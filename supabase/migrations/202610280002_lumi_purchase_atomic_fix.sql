begin;

-- Keep the existing RPC response contract used by Web and Android.
-- A receipt binds an idempotency key to one item. Wallet row locking serializes
-- concurrent purchases for the same account, including different request IDs.
create table if not exists public.lumi_purchase_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  item_id text not null references public.lumi_items(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);
alter table public.lumi_purchase_requests enable row level security;
drop policy if exists lumi_purchase_requests_read_own on public.lumi_purchase_requests;
create policy lumi_purchase_requests_read_own on public.lumi_purchase_requests
  for select to authenticated using (auth.uid() = user_id);
revoke all on public.lumi_purchase_requests from anon, authenticated;
grant select on public.lumi_purchase_requests to authenticated;

create or replace function public.purchase_lumi_item(p_item_id text, p_request_id uuid)
returns table(balance integer, acquired boolean)
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.lumi_items%rowtype;
  v_balance integer;
  v_kind text;
  v_achievement text;
  v_checkpoint text;
  v_previous_item text;
  v_unlocked boolean := false;
begin
  if v_user_id is null then raise exception 'authentication-required' using errcode = '28000'; end if;
  if p_request_id is null then raise exception 'request-id-required'; end if;

  select i.* into v_item from public.lumi_items i where i.id = p_item_id and i.active;
  if not found then raise exception 'item-unavailable'; end if;

  insert into public.user_lumi_wallets(user_id, balance)
    values (v_user_id, 0) on conflict (user_id) do nothing;
  select w.balance into v_balance from public.user_lumi_wallets w
    where w.user_id = v_user_id for update;

  select r.item_id into v_previous_item from public.lumi_purchase_requests r
    where r.user_id = v_user_id and r.request_id = p_request_id;
  if v_previous_item is null then
    -- Receipts from earlier versions remain idempotent.
    select t.item_id into v_previous_item from public.lumi_transactions t
      where t.user_id = v_user_id and t.transaction_type = 'purchase'
        and t.source_event_id = p_request_id;
  end if;
  if v_previous_item is not null and v_previous_item <> p_item_id then
    raise exception 'purchase-request-conflict';
  end if;

  -- Check ownership AFTER obtaining the wallet lock: a concurrent purchase may
  -- have committed while this transaction was waiting.
  if exists (select 1 from public.user_lumi_inventory inv
      where inv.user_id = v_user_id and inv.item_id = p_item_id) then
    insert into public.lumi_purchase_requests(user_id, request_id, item_id)
      values (v_user_id, p_request_id, p_item_id) on conflict do nothing;
    return query select v_balance, false;
    return;
  end if;

  v_kind := coalesce(v_item.unlock_rule ->> 'kind', 'none');
  if v_kind in ('achievement', 'achievement_purchase') then
    v_achievement := v_item.unlock_rule ->> 'achievement_id';
    v_checkpoint := case v_achievement
      when 'genesis-complete' then 'genesis-u10-checkpoint'
      when 'exodus-complete' then 'exodus-u08-checkpoint'
      when 'leviticus-complete' then 'leviticus-u05-checkpoint'
      when 'numbers-complete' then 'numbers-u06-checkpoint'
      when 'deuteronomy-complete' then 'deuteronomy-u06-checkpoint'
      else null end;
    v_unlocked := exists (select 1 from public.user_achievements a
      where a.user_id = v_user_id and a.achievement_id = v_achievement);
    if not v_unlocked and v_checkpoint is not null then
      v_unlocked := exists (select 1 from public.lesson_progress lp
        where lp.user_id = v_user_id and lp.activity_id = v_checkpoint and lp.status = 'completed');
    end if;
    if not v_unlocked then raise exception 'item-locked'; end if;
  elsif v_kind <> 'none' then
    raise exception 'unsupported-unlock-rule';
  end if;

  if v_balance < v_item.price then raise exception 'insufficient-lumi-coins'; end if;
  update public.user_lumi_wallets as w
    set balance = w.balance - v_item.price, updated_at = now()
    where w.user_id = v_user_id returning w.balance into v_balance;

  insert into public.user_lumi_inventory(user_id, item_id, acquisition_type, source_event_id)
    values (v_user_id, p_item_id, case when v_item.price > 0 then 'purchase' else 'grant' end, p_request_id);
  if v_item.price > 0 then
    insert into public.lumi_transactions(user_id, amount, transaction_type, source_event_id, item_id, balance_after)
      values (v_user_id, -v_item.price, 'purchase', p_request_id, p_item_id, v_balance);
  end if;
  insert into public.lumi_purchase_requests(user_id, request_id, item_id)
    values (v_user_id, p_request_id, p_item_id);
  return query select v_balance, true;
  -- Do not convert arbitrary unique violations into false success.
  -- Any failure rolls back wallet, inventory, receipt and transaction together.
end;
$$;

revoke all on function public.purchase_lumi_item(text, uuid) from public, anon;
grant execute on function public.purchase_lumi_item(text, uuid) to authenticated;
grant select on public.lumi_items, public.user_lumi_wallets, public.user_lumi_inventory,
  public.user_lumi_equipment, public.lumi_transactions to authenticated;
notify pgrst, 'reload schema';
commit;
