begin;

alter table public.profiles
  add column if not exists profile_photo_path text
    check (
      profile_photo_path is null
      or profile_photo_path ~ ('^' || user_id::text || '/[a-zA-Z0-9._-]+$')
    );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_photos_select_own" on storage.objects;
drop policy if exists "profile_photos_insert_own" on storage.objects;
drop policy if exists "profile_photos_update_own" on storage.objects;
drop policy if exists "profile_photos_delete_own" on storage.objects;

create policy "profile_photos_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile_photos_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile_photos_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create table if not exists public.lumi_items (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9._-]{1,79}$'),
  name text not null check (char_length(name) between 1 and 80),
  description text not null check (char_length(description) between 1 and 240),
  category text not null check (category in (
    'head', 'glasses', 'outfit', 'backpack', 'special', 'celebration'
  )),
  price integer not null default 0 check (price >= 0),
  rarity text not null check (rarity in ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  asset_path text,
  asset_status text not null default 'pending'
    check (asset_status in ('approved', 'pending')),
  unlock_rule jsonb not null default '{"kind":"none"}'::jsonb,
  layer_order integer not null default 10 check (layer_order between 0 and 100),
  anchor jsonb not null default '{"x":0.5,"y":0.5,"scale":1}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lumi_item_unlock_rule_size check (octet_length(unlock_rule::text) <= 2048),
  constraint lumi_item_anchor_size check (octet_length(anchor::text) <= 1024)
);

create table if not exists public.user_lumi_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.lumi_items(id) on delete restrict,
  acquired_at timestamptz not null default now(),
  acquisition_type text not null check (acquisition_type in (
    'purchase', 'achievement', 'migration', 'grant'
  )),
  source_event_id uuid,
  primary key (user_id, item_id)
);

create table if not exists public.user_lumi_equipment (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in (
    'head', 'glasses', 'outfit', 'backpack', 'special', 'celebration'
  )),
  item_id text not null references public.lumi_items(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

create table if not exists public.user_lumi_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.lumi_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  transaction_type text not null check (transaction_type in (
    'lesson_reward', 'checkpoint_reward', 'book_reward',
    'achievement_reward', 'purchase', 'refund', 'admin_grant'
  )),
  source_event_id uuid not null,
  item_id text references public.lumi_items(id) on delete restrict,
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, transaction_type, source_event_id)
);

create index if not exists lumi_items_category_active
  on public.lumi_items(category, active, rarity);
create index if not exists lumi_inventory_user_acquired
  on public.user_lumi_inventory(user_id, acquired_at desc);
create index if not exists lumi_equipment_user
  on public.user_lumi_equipment(user_id);
create index if not exists lumi_transactions_user_created
  on public.lumi_transactions(user_id, created_at desc);

alter table public.lumi_items enable row level security;
alter table public.user_lumi_inventory enable row level security;
alter table public.user_lumi_equipment enable row level security;
alter table public.user_lumi_wallets enable row level security;
alter table public.lumi_transactions enable row level security;

drop policy if exists "lumi_items_read_active" on public.lumi_items;
drop policy if exists "lumi_inventory_read_own" on public.user_lumi_inventory;
drop policy if exists "lumi_equipment_read_own" on public.user_lumi_equipment;
drop policy if exists "lumi_wallet_read_own" on public.user_lumi_wallets;
drop policy if exists "lumi_transactions_read_own" on public.lumi_transactions;

create policy "lumi_items_read_active" on public.lumi_items
  for select using (active = true);
create policy "lumi_inventory_read_own" on public.user_lumi_inventory
  for select to authenticated using (auth.uid() = user_id);
create policy "lumi_equipment_read_own" on public.user_lumi_equipment
  for select to authenticated using (auth.uid() = user_id);
create policy "lumi_wallet_read_own" on public.user_lumi_wallets
  for select to authenticated using (auth.uid() = user_id);
create policy "lumi_transactions_read_own" on public.lumi_transactions
  for select to authenticated using (auth.uid() = user_id);

insert into public.lumi_items (
  id, name, description, category, price, rarity, asset_path,
  asset_status, unlock_rule, layer_order, anchor
) values
  ('head.reader-cap', 'Boné do Leitor', 'Um detalhe para celebrar a constância na leitura.', 'head', 80, 'common', null, 'pending', '{"kind":"none"}', 40, '{"x":0.5,"y":0.17,"scale":0.42}'),
  ('glasses.study', 'Óculos de Estudo', 'Para acompanhar a Lumi nos momentos de aprofundamento.', 'glasses', 120, 'uncommon', null, 'pending', '{"kind":"none"}', 50, '{"x":0.5,"y":0.38,"scale":0.34}'),
  ('outfit.journey', 'Traje da Jornada', 'Traje verde e dourado para a caminhada bíblica.', 'outfit', 180, 'rare', null, 'pending', '{"kind":"none"}', 20, '{"x":0.5,"y":0.68,"scale":0.7}'),
  ('backpack.notes', 'Mochila de Estudos', 'Leva caderno, referências e boas perguntas.', 'backpack', 150, 'uncommon', null, 'pending', '{"kind":"none"}', 10, '{"x":0.67,"y":0.62,"scale":0.48}'),
  ('special.genesis', 'Selo de Gênesis', 'Item especial por concluir a jornada de Gênesis.', 'special', 0, 'epic', null, 'pending', '{"kind":"achievement","achievement_id":"genesis-complete"}', 60, '{"x":0.76,"y":0.25,"scale":0.22}'),
  ('celebration.new-testament', 'Celebração do Novo Testamento', 'Recompensa exclusiva pela conclusão do Novo Testamento.', 'celebration', 0, 'legendary', null, 'pending', '{"kind":"achievement","achievement_id":"new-testament-complete"}', 70, '{"x":0.5,"y":0.5,"scale":1}'),
  ('celebration.whole-bible', 'Celebração da Bíblia Completa', 'Item lendário por concluir os 66 livros da jornada bíblica.', 'celebration', 0, 'legendary', null, 'pending', '{"kind":"achievement","achievement_id":"whole-bible-complete"}', 80, '{"x":0.5,"y":0.5,"scale":1}')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  price = excluded.price,
  rarity = excluded.rarity,
  unlock_rule = excluded.unlock_rule,
  layer_order = excluded.layer_order,
  anchor = excluded.anchor,
  updated_at = now();

insert into public.user_lumi_wallets(user_id, balance)
select id, 0 from auth.users
on conflict (user_id) do nothing;

create or replace function public.handle_new_lumi_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_lumi_wallets(user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_lumi on auth.users;
create trigger on_auth_user_created_lumi
  after insert on auth.users
  for each row execute procedure public.handle_new_lumi_user();

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
  update public.profiles
  set profile_photo_path = v_path, updated_at = now(), profile_version = profile_version + 1
  where user_id = v_user_id;
  return v_path;
end;
$$;

create or replace function public.purchase_lumi_item(
  p_item_id text,
  p_request_id uuid
)
returns table(balance integer, acquired boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.lumi_items%rowtype;
  v_balance integer;
  v_kind text;
  v_achievement text;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if p_request_id is null then raise exception 'request-id-required'; end if;

  select * into v_item from public.lumi_items
  where id = p_item_id and active = true;
  if not found then raise exception 'item-unavailable'; end if;

  if exists (
    select 1 from public.user_lumi_inventory
    where user_id = v_user_id and item_id = p_item_id
  ) then
    select w.balance into v_balance from public.user_lumi_wallets w where w.user_id = v_user_id;
    return query select coalesce(v_balance, 0), false;
    return;
  end if;

  v_kind := coalesce(v_item.unlock_rule ->> 'kind', 'none');
  if v_kind = 'achievement' then
    v_achievement := v_item.unlock_rule ->> 'achievement_id';
    if not exists (
      select 1 from public.user_achievements
      where user_id = v_user_id and achievement_id = v_achievement
    ) then raise exception 'item-locked'; end if;
  elsif v_kind <> 'none' then
    raise exception 'unsupported-unlock-rule';
  end if;

  insert into public.user_lumi_wallets(user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select w.balance into v_balance
  from public.user_lumi_wallets w
  where w.user_id = v_user_id
  for update;

  if v_balance < v_item.price then raise exception 'insufficient-lumi-coins'; end if;

  update public.user_lumi_wallets
  set balance = balance - v_item.price, updated_at = now()
  where user_id = v_user_id
  returning user_lumi_wallets.balance into v_balance;

  insert into public.user_lumi_inventory(
    user_id, item_id, acquisition_type, source_event_id
  ) values (
    v_user_id,
    p_item_id,
    case when v_kind = 'achievement' then 'achievement' else 'purchase' end,
    p_request_id
  );

  if v_item.price > 0 then
    insert into public.lumi_transactions(
      user_id, amount, transaction_type, source_event_id, item_id, balance_after
    ) values (
      v_user_id, -v_item.price, 'purchase', p_request_id, p_item_id, v_balance
    );
  end if;

  return query select v_balance, true;
exception
  when unique_violation then
    select w.balance into v_balance from public.user_lumi_wallets w where w.user_id = v_user_id;
    return query select coalesce(v_balance, 0), false;
end;
$$;

create or replace function public.equip_lumi_item(p_item_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_category text;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  select i.category into v_category
  from public.lumi_items i
  join public.user_lumi_inventory inventory
    on inventory.item_id = i.id and inventory.user_id = v_user_id
  where i.id = p_item_id and i.active = true;
  if v_category is null then raise exception 'item-not-owned'; end if;

  insert into public.user_lumi_equipment(user_id, category, item_id)
  values (v_user_id, v_category, p_item_id)
  on conflict (user_id, category) do update set
    item_id = excluded.item_id,
    updated_at = now();
end;
$$;

create or replace function public.unequip_lumi_category(p_category text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  delete from public.user_lumi_equipment
  where user_id = auth.uid() and category = p_category;
end;
$$;

create or replace function public.reward_lumi_learning_event(p_event_id uuid)
returns table(balance integer, credited integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event public.sync_events%rowtype;
  v_amount integer := 0;
  v_type text;
  v_balance integer;
  v_reference text;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;

  select * into v_event from public.sync_events
  where event_id = p_event_id and user_id = v_user_id;
  if not found then raise exception 'learning-event-not-found'; end if;

  if v_event.event_type = 'lesson.completed' then
    v_reference := v_event.payload ->> 'activity_id';
    if not exists (
      select 1 from public.lesson_progress
      where user_id = v_user_id and activity_id = v_reference and status = 'completed'
    ) then raise exception 'lesson-not-completed'; end if;
    if exists (
      select 1 from public.sync_events previous
      where previous.user_id = v_user_id
        and previous.sequence < v_event.sequence
        and previous.event_type = 'lesson.completed'
        and previous.payload ->> 'activity_id' = v_reference
    ) then return query select coalesce((select balance from public.user_lumi_wallets where user_id = v_user_id), 0), 0; return; end if;
    v_amount := 10;
    v_type := 'lesson_reward';
  elsif v_event.event_type = 'checkpoint.completed' then
    v_reference := v_event.payload ->> 'activity_id';
    if not exists (
      select 1 from public.lesson_progress
      where user_id = v_user_id and activity_id = v_reference and status = 'completed'
    ) then raise exception 'checkpoint-not-completed'; end if;
    if exists (
      select 1 from public.sync_events previous
      where previous.user_id = v_user_id
        and previous.sequence < v_event.sequence
        and previous.event_type = 'checkpoint.completed'
        and previous.payload ->> 'activity_id' = v_reference
    ) then return query select coalesce((select balance from public.user_lumi_wallets where user_id = v_user_id), 0), 0; return; end if;
    v_amount := 25;
    v_type := 'checkpoint_reward';
  elsif v_event.event_type = 'achievement.unlocked' then
    v_reference := v_event.payload ->> 'achievement_id';
    if not exists (
      select 1 from public.user_achievements
      where user_id = v_user_id and event_id = p_event_id
    ) then raise exception 'achievement-not-unlocked-by-event'; end if;
    v_amount := 30;
    v_type := 'achievement_reward';
  else
    raise exception 'event-not-rewardable';
  end if;

  insert into public.user_lumi_wallets(user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select w.balance into v_balance
  from public.user_lumi_wallets w
  where w.user_id = v_user_id
  for update;

  if exists (
    select 1 from public.lumi_transactions
    where user_id = v_user_id
      and transaction_type = v_type
      and source_event_id = p_event_id
  ) then
    return query select v_balance, 0;
    return;
  end if;

  update public.user_lumi_wallets
  set balance = balance + v_amount, updated_at = now()
  where user_id = v_user_id
  returning user_lumi_wallets.balance into v_balance;

  insert into public.lumi_transactions(
    user_id, amount, transaction_type, source_event_id, balance_after
  ) values (v_user_id, v_amount, v_type, p_event_id, v_balance);

  if v_event.event_type = 'achievement.unlocked' then
    insert into public.user_lumi_inventory(
      user_id, item_id, acquisition_type, source_event_id
    )
    select v_user_id, item.id, 'achievement', p_event_id
    from public.lumi_items item
    where item.active = true
      and item.unlock_rule ->> 'kind' = 'achievement'
      and item.unlock_rule ->> 'achievement_id' = v_reference
    on conflict (user_id, item_id) do nothing;
  end if;

  return query select v_balance, v_amount;
end;
$$;


create or replace function public.submit_sync_event_with_lumi(
  p_event_id uuid,
  p_device_id uuid,
  p_platform text,
  p_event_type text,
  p_payload jsonb,
  p_local_date date default null,
  p_timezone text default null
)
returns table (
  server_sequence bigint,
  accepted boolean,
  total_xp bigint,
  lumi_balance integer,
  lumi_credited integer
)
language plpgsql
security definer
set search_path = ''
as $
declare
  v_sync record;
  v_reward record;
begin
  select * into v_sync from public.submit_sync_event(
    p_event_id, p_device_id, p_platform, p_event_type, p_payload, p_local_date, p_timezone
  );

  if p_event_type in ('lesson.completed', 'checkpoint.completed', 'achievement.unlocked') then
    select * into v_reward from public.reward_lumi_learning_event(p_event_id);
  else
    select coalesce((select balance from public.user_lumi_wallets where user_id = auth.uid()), 0) as balance, 0 as credited
      into v_reward;
  end if;

  return query select
    v_sync.server_sequence::bigint,
    v_sync.accepted::boolean,
    v_sync.total_xp::bigint,
    v_reward.balance::integer,
    v_reward.credited::integer;
end;
$;

grant execute on function public.set_profile_photo_path(text) to authenticated;
grant execute on function public.submit_sync_event_with_lumi(uuid, uuid, text, text, jsonb, date, text) to authenticated;
grant execute on function public.purchase_lumi_item(text, uuid) to authenticated;
grant execute on function public.equip_lumi_item(text) to authenticated;
grant execute on function public.unequip_lumi_category(text) to authenticated;
grant execute on function public.reward_lumi_learning_event(uuid) to authenticated;

commit;
