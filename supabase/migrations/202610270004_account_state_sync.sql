begin;

create table if not exists public.user_account_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  learning_profile jsonb not null default '{}'::jsonb,
  app_settings jsonb not null default '{}'::jsonb,
  bible_annotations jsonb not null default '{}'::jsonb,
  bible_location jsonb,
  learned_greek_lexeme_ids text[] not null default '{}',
  state_version bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint account_profile_size check (octet_length(learning_profile::text) <= 8192),
  constraint account_settings_size check (octet_length(app_settings::text) <= 8192),
  constraint account_annotations_size check (octet_length(bible_annotations::text) <= 524288),
  constraint account_location_size check (bible_location is null or octet_length(bible_location::text) <= 2048),
  constraint account_greek_lexemes_count check (cardinality(learned_greek_lexeme_ids) <= 20000)
);

alter table public.user_account_state enable row level security;
drop policy if exists "account_state_read_own" on public.user_account_state;
create policy "account_state_read_own" on public.user_account_state
  for select to authenticated using (auth.uid() = user_id);
grant select on public.user_account_state to authenticated;

create or replace function public.save_mobile_account_state(
  p_learning_profile jsonb,
  p_app_settings jsonb,
  p_bible_annotations jsonb,
  p_bible_location jsonb,
  p_learned_greek_lexeme_ids text[]
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_version bigint;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if jsonb_typeof(coalesce(p_learning_profile, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_app_settings, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_bible_annotations, '{}'::jsonb)) <> 'object'
    or (p_bible_location is not null and jsonb_typeof(p_bible_location) <> 'object')
    or octet_length(coalesce(p_learning_profile, '{}'::jsonb)::text) > 8192
    or octet_length(coalesce(p_app_settings, '{}'::jsonb)::text) > 8192
    or octet_length(coalesce(p_bible_annotations, '{}'::jsonb)::text) > 524288
    or cardinality(coalesce(p_learned_greek_lexeme_ids, '{}'::text[])) > 20000 then
    raise exception 'invalid-account-state';
  end if;

  insert into public.user_account_state(
    user_id, learning_profile, app_settings, bible_annotations,
    bible_location, learned_greek_lexeme_ids
  ) values (
    v_user_id,
    coalesce(p_learning_profile, '{}'::jsonb),
    coalesce(p_app_settings, '{}'::jsonb),
    coalesce(p_bible_annotations, '{}'::jsonb),
    p_bible_location,
    array(select distinct value from unnest(coalesce(p_learned_greek_lexeme_ids, '{}'::text[])) value where value <> '')
  )
  on conflict (user_id) do update set
    learning_profile = excluded.learning_profile,
    app_settings = excluded.app_settings,
    bible_annotations = public.user_account_state.bible_annotations || excluded.bible_annotations,
    bible_location = coalesce(excluded.bible_location, public.user_account_state.bible_location),
    learned_greek_lexeme_ids = array(
      select distinct value
      from unnest(public.user_account_state.learned_greek_lexeme_ids || excluded.learned_greek_lexeme_ids) value
      where value <> ''
    ),
    state_version = public.user_account_state.state_version + 1,
    updated_at = now()
  returning state_version into v_version;

  return v_version;
end;
$$;

revoke all on function public.save_mobile_account_state(jsonb,jsonb,jsonb,jsonb,text[]) from public;
grant execute on function public.save_mobile_account_state(jsonb,jsonb,jsonb,jsonb,text[]) to authenticated;
notify pgrst, 'reload schema';
commit;
