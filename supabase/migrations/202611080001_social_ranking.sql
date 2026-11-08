-- Social: ranking semanal real, amigos (seguir) e perfis públicos de alunos.
--
-- Princípios:
--  * Participar é uma escolha (opt-in): só aparece quem criou um @usuário no ranking.
--  * Nada é exposto por SELECT direto: as tabelas têm RLS ligado e nenhum acesso para
--    anon/authenticated. Tudo passa pelas funções abaixo (security definer).
--  * O XP do dia é registrado no servidor por um gatilho em user_stats, que já recebe o XP
--    calculado pelo servidor (submit_sync_event), sem alterar essa função.
--  * A semana vai de segunda a domingo no horário de Brasília (UTC-3, sem horário de verão).
--  * Anti-abuso: cada dia vale no máximo 2000 XP no ranking e importações de legado
--    (um único aumento muito grande de XP) não entram no XP da semana.
begin;

-- ---------------------------------------------------------------- tabelas

create table if not exists public.social_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  visible boolean not null default true,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_profiles_handle_key unique (handle)
);

create table if not exists public.social_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists social_follows_followee on public.social_follows(followee_id);

create table if not exists public.social_xp_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  xp integer not null check (xp >= 0),
  primary key (user_id, day)
);
create index if not exists social_xp_daily_day on public.social_xp_daily(day);

create table if not exists public.social_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now(),
  unique (reporter_id, reported_id)
);

alter table public.social_profiles enable row level security;
alter table public.social_follows enable row level security;
alter table public.social_xp_daily enable row level security;
alter table public.social_reports enable row level security;

revoke all on public.social_profiles, public.social_follows, public.social_xp_daily, public.social_reports from anon, authenticated;

-- ---------------------------------------------------------------- XP por dia

create or replace function public.social_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

create or replace function public.social_week_start()
returns date
language sql
stable
set search_path = ''
as $$
  select date_trunc('week', now() at time zone 'America/Sao_Paulo')::date;
$$;

create or replace function public.social_track_xp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delta bigint;
begin
  if tg_op = 'UPDATE' then
    v_delta := new.total_xp - old.total_xp;
  else
    v_delta := new.total_xp;
  end if;
  -- Uma lição vale no máximo 550 XP: aumentos maiores são importações de legado.
  if v_delta > 0 and v_delta <= 1000 then
    insert into public.social_xp_daily(user_id, day, xp)
    values (new.user_id, public.social_today(), v_delta)
    on conflict (user_id, day) do update
      set xp = public.social_xp_daily.xp + excluded.xp;
  end if;
  return new;
end;
$$;

drop trigger if exists social_track_xp_insert on public.user_stats;
create trigger social_track_xp_insert
  after insert on public.user_stats
  for each row execute function public.social_track_xp();

drop trigger if exists social_track_xp_update on public.user_stats;
create trigger social_track_xp_update
  after update of total_xp on public.user_stats
  for each row when (new.total_xp is distinct from old.total_xp)
  execute function public.social_track_xp();

-- ---------------------------------------------------------------- funções

-- Quem sou eu no social (nenhuma linha = ainda não participa).
create or replace function public.social_my_profile()
returns table(handle text, visible boolean, suspended boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  return query
  select sp.handle, sp.visible, sp.suspended
  from public.social_profiles sp
  where sp.user_id = auth.uid();
end;
$$;

-- Entrar no ranking (ou trocar de @usuário / sair e voltar).
create or replace function public.social_set_profile(p_handle text, p_visible boolean default true)
returns table(handle text, visible boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_handle text := lower(trim(coalesce(p_handle, '')));
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if v_handle !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'invalid-handle';
  end if;
  if v_handle = any (array[
    'admin', 'administrador', 'bibliolingo', 'lumi', 'noah', 'professor_noah',
    'suporte', 'equipe', 'moderador', 'moderacao', 'oficial', 'sistema'
  ]) then
    raise exception 'handle-reserved';
  end if;

  begin
    insert into public.social_profiles(user_id, handle, visible)
    values (v_user_id, v_handle, coalesce(p_visible, true))
    on conflict (user_id) do update
      set handle = excluded.handle,
          visible = excluded.visible,
          updated_at = now();
  exception when unique_violation then
    raise exception 'handle-taken';
  end;

  return query
  select sp.handle, sp.visible from public.social_profiles sp where sp.user_id = v_user_id;
end;
$$;

-- Ranking semanal. p_scope: 'global' (todos os participantes) ou 'friends' (quem eu sigo + eu).
-- Devolve o topo e, se eu estiver fora dele, também a minha linha.
create or replace function public.social_leaderboard(p_scope text default 'global', p_limit integer default 50)
returns table(
  rank bigint, user_id uuid, handle text, display_name text, skin_id text,
  weekly_xp bigint, total_xp bigint, current_streak integer,
  is_me boolean, is_following boolean, week_ends_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_me uuid := auth.uid();
  v_week date := public.social_week_start();
  v_today date := public.social_today();
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
begin
  if v_me is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if p_scope not in ('global', 'friends') then
    raise exception 'invalid-scope';
  end if;

  return query
  with scoped as (
    select sp.user_id as uid, sp.handle as hnd
    from public.social_profiles sp
    where sp.visible and not sp.suspended
      and (
        p_scope = 'global'
        or sp.user_id = v_me
        or exists (
          select 1 from public.social_follows f
          where f.follower_id = v_me and f.followee_id = sp.user_id
        )
      )
  ), week_xp as (
    select d.user_id as uid, sum(least(d.xp, 2000))::bigint as xp
    from public.social_xp_daily d
    where d.day >= v_week and d.day < v_week + 7
      and d.user_id in (select s.uid from scoped s)
    group by d.user_id
  ), ranked as (
    select
      s.uid, s.hnd,
      coalesce(w.xp, 0) as wxp,
      coalesce(st.total_xp, 0) as txp,
      case when st.last_study_date >= v_today - 1 then st.current_streak else 0 end as streak,
      row_number() over (
        order by coalesce(w.xp, 0) desc, coalesce(st.total_xp, 0) desc, s.hnd asc
      ) as rnk
    from scoped s
    left join week_xp w on w.uid = s.uid
    left join public.user_stats st on st.user_id = s.uid
  )
  select
    r.rnk,
    r.uid,
    r.hnd,
    left(coalesce(nullif(split_part(trim(coalesce(pr.display_name, '')), ' ', 1), ''), r.hnd), 24),
    coalesce(
      (select e.item_id from public.user_lumi_equipment e where e.user_id = r.uid and e.category = 'skin'),
      'lumi_base'
    ),
    r.wxp,
    r.txp,
    r.streak,
    r.uid = v_me,
    exists (select 1 from public.social_follows f where f.follower_id = v_me and f.followee_id = r.uid),
    ((v_week + 7)::timestamp at time zone 'America/Sao_Paulo')
  from ranked r
  left join public.profiles pr on pr.user_id = r.uid
  where r.rnk <= v_limit or r.uid = v_me
  order by r.rnk;
end;
$$;

-- Perfil público de um aluno que participa (ou o meu).
create or replace function public.social_profile(p_user_id uuid)
returns table(
  user_id uuid, handle text, display_name text, skin_id text,
  total_xp bigint, current_streak integer, longest_streak integer, lessons_completed integer,
  week_xp bigint, week_rank bigint, days jsonb,
  followers bigint, following bigint, is_following boolean, is_me boolean, joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_me uuid := auth.uid();
  v_week date := public.social_week_start();
  v_today date := public.social_today();
begin
  if v_me is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;

  return query
  with target as (
    select sp.user_id as uid, sp.handle as hnd, sp.created_at as joined
    from public.social_profiles sp
    where sp.user_id = p_user_id
      and (sp.user_id = v_me or (sp.visible and not sp.suspended))
  ), weekly as (
    select sp.user_id as uid,
      coalesce(sum(least(d.xp, 2000)) filter (where d.day >= v_week and d.day < v_week + 7), 0)::bigint as xp
    from public.social_profiles sp
    left join public.social_xp_daily d on d.user_id = sp.user_id
    where sp.visible and not sp.suspended
    group by sp.user_id
  ), standings as (
    select w.uid, row_number() over (
      order by w.xp desc, coalesce(st.total_xp, 0) desc, sp.handle asc
    ) as rnk, w.xp
    from weekly w
    join public.social_profiles sp on sp.user_id = w.uid
    left join public.user_stats st on st.user_id = w.uid
  )
  select
    t.uid,
    t.hnd,
    left(coalesce(nullif(split_part(trim(coalesce(pr.display_name, '')), ' ', 1), ''), t.hnd), 24),
    coalesce(
      (select e.item_id from public.user_lumi_equipment e where e.user_id = t.uid and e.category = 'skin'),
      'lumi_base'
    ),
    coalesce(st.total_xp, 0),
    case when st.last_study_date >= v_today - 1 then st.current_streak else 0 end,
    coalesce(st.longest_streak, 0),
    coalesce(st.lessons_completed, 0),
    coalesce(sd.xp, 0),
    sd.rnk,
    (
      select jsonb_agg(jsonb_build_object('day', g.day, 'xp', coalesce(least(d.xp, 2000), 0)) order by g.day)
      from generate_series(v_today - 6, v_today, interval '1 day') as gs(day)
      cross join lateral (select gs.day::date as day) g
      left join public.social_xp_daily d on d.user_id = t.uid and d.day = g.day
    ),
    (select count(*) from public.social_follows f
      join public.social_profiles fp on fp.user_id = f.follower_id and fp.visible and not fp.suspended
      where f.followee_id = t.uid),
    (select count(*) from public.social_follows f
      join public.social_profiles fp on fp.user_id = f.followee_id and fp.visible and not fp.suspended
      where f.follower_id = t.uid),
    exists (select 1 from public.social_follows f where f.follower_id = v_me and f.followee_id = t.uid),
    t.uid = v_me,
    t.joined
  from target t
  left join public.profiles pr on pr.user_id = t.uid
  left join public.user_stats st on st.user_id = t.uid
  left join standings sd on sd.uid = t.uid;
end;
$$;

create or replace function public.social_follow(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if p_user_id is null or p_user_id = v_me then
    raise exception 'invalid-follow';
  end if;
  if not exists (select 1 from public.social_profiles where user_id = v_me and visible and not suspended) then
    raise exception 'join-required';
  end if;
  if not exists (select 1 from public.social_profiles where user_id = p_user_id and visible and not suspended) then
    raise exception 'user-not-found';
  end if;
  if (select count(*) from public.social_follows where follower_id = v_me) >= 300 then
    raise exception 'follow-limit';
  end if;
  insert into public.social_follows(follower_id, followee_id)
  values (v_me, p_user_id)
  on conflict do nothing;
end;
$$;

create or replace function public.social_unfollow(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  delete from public.social_follows
  where follower_id = auth.uid() and followee_id = p_user_id;
end;
$$;

-- Buscar alunos pelo começo do @usuário ou do nome.
create or replace function public.social_search(p_query text)
returns table(user_id uuid, handle text, display_name text, skin_id text, total_xp bigint, is_following boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_me uuid := auth.uid();
  v_query text := lower(trim(both '@' from trim(coalesce(p_query, ''))));
begin
  if v_me is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if char_length(v_query) < 2 then
    return;
  end if;

  return query
  select
    sp.user_id,
    sp.handle,
    left(coalesce(nullif(split_part(trim(coalesce(pr.display_name, '')), ' ', 1), ''), sp.handle), 24),
    coalesce(
      (select e.item_id from public.user_lumi_equipment e where e.user_id = sp.user_id and e.category = 'skin'),
      'lumi_base'
    ),
    coalesce(st.total_xp, 0),
    exists (select 1 from public.social_follows f where f.follower_id = v_me and f.followee_id = sp.user_id)
  from public.social_profiles sp
  left join public.profiles pr on pr.user_id = sp.user_id
  left join public.user_stats st on st.user_id = sp.user_id
  where sp.visible and not sp.suspended and sp.user_id <> v_me
    and (
      starts_with(sp.handle, v_query)
      or starts_with(lower(coalesce(pr.display_name, '')), v_query)
    )
  order by (sp.handle = v_query) desc, coalesce(st.total_xp, 0) desc, sp.handle
  limit 20;
end;
$$;

create or replace function public.social_report(p_user_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_reason text := left(trim(coalesce(p_reason, '')), 500);
begin
  if v_me is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if p_user_id is null or p_user_id = v_me or v_reason = '' then
    raise exception 'invalid-report';
  end if;
  insert into public.social_reports(reporter_id, reported_id, reason)
  values (v_me, p_user_id, v_reason)
  on conflict (reporter_id, reported_id) do update set reason = excluded.reason, created_at = now();
end;
$$;

revoke all on function public.social_today() from public;
revoke all on function public.social_week_start() from public;
revoke all on function public.social_track_xp() from public;
revoke all on function public.social_my_profile() from public;
revoke all on function public.social_set_profile(text, boolean) from public;
revoke all on function public.social_leaderboard(text, integer) from public;
revoke all on function public.social_profile(uuid) from public;
revoke all on function public.social_follow(uuid) from public;
revoke all on function public.social_unfollow(uuid) from public;
revoke all on function public.social_search(text) from public;
revoke all on function public.social_report(uuid, text) from public;

grant execute on function public.social_my_profile() to authenticated;
grant execute on function public.social_set_profile(text, boolean) to authenticated;
grant execute on function public.social_leaderboard(text, integer) to authenticated;
grant execute on function public.social_profile(uuid) to authenticated;
grant execute on function public.social_follow(uuid) to authenticated;
grant execute on function public.social_unfollow(uuid) to authenticated;
grant execute on function public.social_search(text) to authenticated;
grant execute on function public.social_report(uuid, text) to authenticated;

notify pgrst, 'reload schema';
commit;
