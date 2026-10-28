begin;

alter table public.user_account_state
  add column if not exists progress_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists progress_updated_at timestamptz;

create or replace function public.save_mobile_progress_snapshot(
  p_snapshot jsonb,
  p_client_updated_at timestamptz
)
returns table(state_version bigint, accepted boolean, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_changed integer := 0;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if jsonb_typeof(coalesce(p_snapshot, '{}'::jsonb)) <> 'object'
    or octet_length(coalesce(p_snapshot, '{}'::jsonb)::text) > 2097152 then
    raise exception 'invalid-progress-snapshot';
  end if;

  insert into public.user_account_state(
    user_id, progress_snapshot, progress_updated_at, updated_at
  ) values (
    v_user_id,
    coalesce(p_snapshot, '{}'::jsonb),
    coalesce(p_client_updated_at, now()),
    now()
  )
  on conflict (user_id) do update set
    progress_snapshot = excluded.progress_snapshot,
    progress_updated_at = excluded.progress_updated_at,
    state_version = public.user_account_state.state_version + 1,
    updated_at = now()
  where public.user_account_state.progress_updated_at is null
     or public.user_account_state.progress_updated_at <= excluded.progress_updated_at;

  get diagnostics v_changed = row_count;

  return query
  select s.state_version, v_changed > 0, s.progress_updated_at
  from public.user_account_state s
  where s.user_id = v_user_id;
end;
$$;

revoke all on function public.save_mobile_progress_snapshot(jsonb,timestamptz) from public;
grant execute on function public.save_mobile_progress_snapshot(jsonb,timestamptz) to authenticated;

notify pgrst, 'reload schema';
commit;
