begin;

create table if not exists public.lumi_reward_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_kind text not null check (reward_kind in ('checkpoint_reward','book_reward','achievement_reward')),
  reference_id text not null check (char_length(reference_id) between 1 and 160),
  source_event_id uuid not null references public.sync_events(event_id) on delete restrict,
  claimed_at timestamptz not null default now(),
  primary key (user_id, reward_kind, reference_id)
);
alter table public.lumi_reward_claims enable row level security;
drop policy if exists "lumi_reward_claims_read_own" on public.lumi_reward_claims;
create policy "lumi_reward_claims_read_own" on public.lumi_reward_claims
  for select to authenticated using (auth.uid() = user_id);
grant select on public.lumi_reward_claims to authenticated;

create or replace function public.set_profile_photo_path(p_path text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_path text := nullif(trim(coalesce(p_path, '')), '');
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if v_path is not null and v_path !~ ('^' || v_user_id::text || '/[a-zA-Z0-9._-]+$') then
    raise exception 'invalid-profile-photo-path';
  end if;
  insert into public.profiles(user_id, profile_photo_path, updated_at)
  values (v_user_id, v_path, now())
  on conflict (user_id) do update set
    profile_photo_path = excluded.profile_photo_path,
    updated_at = now(),
    profile_version = public.profiles.profile_version + 1;
  return v_path;
end;
$$;

create or replace function public.purchase_lumi_item(p_item_id text,p_request_id uuid)
returns table(balance integer,acquired boolean)
language plpgsql security definer set search_path='' as $$
declare
  v_user_id uuid:=auth.uid();
  v_item public.lumi_items%rowtype;
  v_balance integer;
  v_kind text;
  v_achievement text;
  v_checkpoint text;
  v_unlocked boolean := false;
begin
  if v_user_id is null then raise exception 'authentication-required' using errcode='28000';end if;
  if p_request_id is null then raise exception 'request-id-required';end if;
  select * into v_item from public.lumi_items where id=p_item_id and active=true;
  if not found then raise exception 'item-unavailable';end if;
  if exists(select 1 from public.user_lumi_inventory where user_id=v_user_id and item_id=p_item_id) then
    select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id;
    return query select coalesce(v_balance,0),false;return;
  end if;

  v_kind:=coalesce(v_item.unlock_rule->>'kind','none');
  if v_kind in ('achievement','achievement_purchase') then
    v_achievement:=v_item.unlock_rule->>'achievement_id';
    v_checkpoint:=case v_achievement
      when 'genesis-complete' then 'genesis-u10-checkpoint'
      when 'exodus-complete' then 'exodus-u08-checkpoint'
      when 'leviticus-complete' then 'leviticus-u05-checkpoint'
      when 'numbers-complete' then 'numbers-u06-checkpoint'
      when 'deuteronomy-complete' then 'deuteronomy-u06-checkpoint'
      else null end;
    v_unlocked:=exists(select 1 from public.user_achievements where user_id=v_user_id and achievement_id=v_achievement);
    if not v_unlocked and v_checkpoint is not null then
      v_unlocked:=exists(select 1 from public.lesson_progress where user_id=v_user_id and activity_id=v_checkpoint and status='completed');
    end if;
    if not v_unlocked then raise exception 'item-locked';end if;
  elsif v_kind<>'none' then
    raise exception 'unsupported-unlock-rule';
  end if;

  insert into public.user_lumi_wallets(user_id,balance) values(v_user_id,0) on conflict(user_id) do nothing;
  select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id for update;
  if v_balance<v_item.price then raise exception 'insufficient-lumi-coins';end if;
  update public.user_lumi_wallets set balance=balance-v_item.price,updated_at=now()
    where user_id=v_user_id returning user_lumi_wallets.balance into v_balance;
  insert into public.user_lumi_inventory(user_id,item_id,acquisition_type,source_event_id)
    values(v_user_id,p_item_id,'purchase',p_request_id);
  if v_item.price>0 then
    insert into public.lumi_transactions(user_id,amount,transaction_type,source_event_id,item_id,balance_after)
      values(v_user_id,-v_item.price,'purchase',p_request_id,p_item_id,v_balance);
  end if;
  return query select v_balance,true;
exception when unique_violation then
  select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id;
  return query select coalesce(v_balance,0),false;
end;
$$;

create or replace function public.reward_lumi_learning_event(p_event_id uuid)
returns table(balance integer, credited integer)
language plpgsql security definer set search_path='' as $$
declare
  v_user_id uuid:=auth.uid();
  v_event public.sync_events%rowtype;
  v_reference text;
  v_balance integer;
  v_credit integer:=0;
  v_claimed boolean;
  v_is_book boolean:=false;
begin
  if v_user_id is null then raise exception 'authentication-required' using errcode='28000';end if;
  select * into v_event from public.sync_events where event_id=p_event_id and user_id=v_user_id;
  if not found then raise exception 'learning-event-not-found';end if;
  insert into public.user_lumi_wallets(user_id,balance) values(v_user_id,0) on conflict(user_id) do nothing;
  select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id for update;

  if v_event.event_type='lesson.completed' then
    v_reference:=v_event.payload->>'activity_id';
    if not exists(select 1 from public.lesson_progress where user_id=v_user_id and activity_id=v_reference and status='completed')
      then raise exception 'lesson-not-completed';end if;
    if not exists(select 1 from public.lumi_transactions where user_id=v_user_id and transaction_type='lesson_reward' and source_event_id=p_event_id) then
      v_balance:=v_balance+5;v_credit:=v_credit+5;
      insert into public.lumi_transactions(user_id,amount,transaction_type,source_event_id,balance_after)
        values(v_user_id,5,'lesson_reward',p_event_id,v_balance);
    end if;

  elsif v_event.event_type='checkpoint.completed' then
    v_reference:=v_event.payload->>'activity_id';
    if exists(select 1 from public.lesson_progress where user_id=v_user_id and activity_id=v_reference and status='completed') then
      insert into public.lumi_reward_claims(user_id,reward_kind,reference_id,source_event_id)
        values(v_user_id,'checkpoint_reward',v_reference,p_event_id) on conflict do nothing;
      v_claimed:=found;
      if v_claimed then
        v_balance:=v_balance+25;v_credit:=v_credit+25;
        insert into public.lumi_transactions(user_id,amount,transaction_type,source_event_id,balance_after)
          values(v_user_id,25,'checkpoint_reward',p_event_id,v_balance);
      end if;
    end if;

  elsif v_event.event_type='achievement.unlocked' then
    v_reference:=v_event.payload->>'achievement_id';
    if not exists(select 1 from public.user_achievements where user_id=v_user_id and achievement_id=v_reference)
      then raise exception 'achievement-not-unlocked';end if;
    insert into public.lumi_reward_claims(user_id,reward_kind,reference_id,source_event_id)
      values(v_user_id,'achievement_reward',v_reference,p_event_id) on conflict do nothing;
    v_claimed:=found;
    if v_claimed then
      v_balance:=v_balance+30;v_credit:=v_credit+30;
      insert into public.lumi_transactions(user_id,amount,transaction_type,source_event_id,balance_after)
        values(v_user_id,30,'achievement_reward',p_event_id,v_balance);
    end if;

    v_is_book:=v_reference in (
      'genesis-complete','exodus-complete','leviticus-complete','numbers-complete','deuteronomy-complete',
      'joshua-complete','judges-complete','ruth-complete','first-samuel-complete','second-samuel-complete',
      'first-kings-complete','second-kings-complete','chronicles-complete','ezra-nehemiah-complete',
      'esther-complete','psalms-complete','isaiah-complete','jeremiah-complete','ezekiel-complete','daniel-complete'
    );
    if v_is_book then
      insert into public.lumi_reward_claims(user_id,reward_kind,reference_id,source_event_id)
        values(v_user_id,'book_reward',v_reference,p_event_id) on conflict do nothing;
      v_claimed:=found;
      if v_claimed then
        v_balance:=v_balance+100;v_credit:=v_credit+100;
        insert into public.lumi_transactions(user_id,amount,transaction_type,source_event_id,balance_after)
          values(v_user_id,100,'book_reward',p_event_id,v_balance);
      end if;
    end if;
  else
    raise exception 'event-not-rewardable';
  end if;

  update public.user_lumi_wallets set balance=v_balance,updated_at=now() where user_id=v_user_id;
  return query select v_balance,v_credit;
end;
$$;

create or replace function public.submit_sync_event_with_lumi(
  p_event_id uuid,p_device_id uuid,p_platform text,p_event_type text,p_payload jsonb,
  p_local_date date default null,p_timezone text default null
)
returns table(server_sequence bigint,accepted boolean,total_xp bigint,lumi_balance integer,lumi_credited integer)
language plpgsql security definer set search_path='' as $$
declare v_sync record;v_reward record;
begin
  select * into v_sync from public.submit_sync_event(
    p_event_id,p_device_id,p_platform,p_event_type,p_payload,p_local_date,p_timezone
  );
  if p_event_type in ('lesson.completed','checkpoint.completed','achievement.unlocked') then
    select * into v_reward from public.reward_lumi_learning_event(p_event_id);
  else
    select coalesce((select balance from public.user_lumi_wallets where user_id=auth.uid()),0) as balance,0 as credited into v_reward;
  end if;
  return query select v_sync.server_sequence::bigint,v_sync.accepted::boolean,v_sync.total_xp::bigint,
    v_reward.balance::integer,v_reward.credited::integer;
end;
$$;

grant execute on function public.set_profile_photo_path(text) to authenticated;
grant execute on function public.purchase_lumi_item(text,uuid) to authenticated;
grant execute on function public.reward_lumi_learning_event(uuid) to authenticated;
grant execute on function public.submit_sync_event_with_lumi(uuid,uuid,text,text,jsonb,date,text) to authenticated;
notify pgrst, 'reload schema';
commit;
