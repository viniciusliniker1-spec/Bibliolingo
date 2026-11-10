-- Social: a skin do avatar passa a vir da carteira Lumi do progresso da conta.
--
-- Na versão atual do app a skin equipada fica no progresso (lumiWallet.equippedSkinId), que sobe
-- ao servidor em user_account_state.progress_snapshot. A tabela user_lumi_equipment (loja antiga
-- do servidor) deixou de ser a fonte, então o ranking mostrava sempre a Lumi padrão.
--
-- Regras: só vale uma skin oficial e ativa (lumi_items, categoria 'skin'); qualquer outro valor
-- vira a Lumi padrão. Usa a loja antiga como reserva e depois 'lumi_base'.
begin;

create or replace function public.social_skin(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select s.id
      from public.user_account_state a
      join public.lumi_items s
        on s.id = a.progress_snapshot #>> '{lumiWallet,equippedSkinId}'
       and s.category = 'skin' and s.active
      where a.user_id = p_user_id
    ),
    (
      select e.item_id
      from public.user_lumi_equipment e
      where e.user_id = p_user_id and e.category = 'skin'
    ),
    'lumi_base'
  );
$$;

revoke all on function public.social_skin(uuid) from public;

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
    public.social_skin(r.uid),
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
    public.social_skin(t.uid),
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
    public.social_skin(sp.user_id),
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

notify pgrst, 'reload schema';
commit;
