begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  profile_version bigint not null default 1
);

create table if not exists public.devices (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  platform text not null check (platform in ('web', 'android', 'ios')),
  label text check (label is null or char_length(label) <= 80),
  last_seen_at timestamptz not null default now(),
  primary key (user_id, device_id)
);

create table if not exists public.sync_events (
  sequence bigint generated always as identity primary key,
  event_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  event_type text not null check (event_type in (
    'answer.recorded',
    'lesson.completed',
    'checkpoint.completed',
    'achievement.unlocked',
    'profile.updated',
    'active_session.updated',
    'legacy.imported'
  )),
  payload jsonb not null,
  local_date date,
  timezone text,
  created_at timestamptz not null default now(),
  constraint sync_event_payload_size check (octet_length(payload::text) <= 32768),
  foreign key (user_id, device_id)
    references public.devices(user_id, device_id)
    on delete cascade
);

create index if not exists sync_events_user_sequence
  on public.sync_events(user_id, sequence);
create index if not exists sync_events_user_created
  on public.sync_events(user_id, created_at desc);

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp bigint not null default 0 check (total_xp >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_study_date date,
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  checkpoints_completed integer not null default 0 check (checkpoints_completed >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  timezone text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, study_date)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id text not null check (char_length(activity_id) between 1 and 160),
  activity_type text not null check (activity_type in ('lesson', 'checkpoint')),
  status text not null check (status in ('completed', 'failed')),
  best_accuracy numeric(6,5) not null default 0 check (best_accuracy between 0 and 1),
  attempts integer not null default 1 check (attempts > 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  last_event_id uuid not null,
  primary key (user_id, activity_id)
);

create table if not exists public.answer_history (
  event_id uuid primary key references public.sync_events(event_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 160),
  question_id text not null check (char_length(question_id) between 1 and 160),
  selected_answer text check (selected_answer is null or char_length(selected_answer) <= 1000),
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create index if not exists answer_history_user_answered
  on public.answer_history(user_id, answered_at desc);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null check (char_length(achievement_id) between 1 and 160),
  unlocked_at timestamptz not null default now(),
  event_id uuid not null references public.sync_events(event_id) on delete restrict,
  primary key (user_id, achievement_id)
);

create table if not exists public.active_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  activity_id text not null check (char_length(activity_id) between 1 and 160),
  step_index integer not null check (step_index >= 0),
  started_at timestamptz not null,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  event_id uuid not null references public.sync_events(event_id) on delete restrict,
  primary key (user_id, device_id),
  foreign key (user_id, device_id)
    references public.devices(user_id, device_id)
    on delete cascade,
  constraint active_answers_size check (octet_length(answers::text) <= 32768)
);

create table if not exists public.legacy_imports (
  user_id uuid not null references auth.users(id) on delete cascade,
  fingerprint text not null check (char_length(fingerprint) between 32 and 128),
  event_id uuid not null unique references public.sync_events(event_id) on delete restrict,
  imported_at timestamptz not null default now(),
  primary key (user_id, fingerprint)
);

alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.sync_events enable row level security;
alter table public.user_stats enable row level security;
alter table public.study_days enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.answer_history enable row level security;
alter table public.user_achievements enable row level security;
alter table public.active_progress enable row level security;
alter table public.legacy_imports enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "devices_select_own" on public.devices
  for select using (auth.uid() = user_id);
create policy "events_select_own" on public.sync_events
  for select using (auth.uid() = user_id);
create policy "stats_select_own" on public.user_stats
  for select using (auth.uid() = user_id);
create policy "study_days_select_own" on public.study_days
  for select using (auth.uid() = user_id);
create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "answers_select_own" on public.answer_history
  for select using (auth.uid() = user_id);
create policy "achievements_select_own" on public.user_achievements
  for select using (auth.uid() = user_id);
create policy "active_progress_select_own" on public.active_progress
  for select using (auth.uid() = user_id);
create policy "legacy_imports_select_own" on public.legacy_imports
  for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(user_id, display_name, avatar_url)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'), '')
  )
  on conflict (user_id) do nothing;

  insert into public.user_stats(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.recompute_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current integer := 0;
  v_longest integer := 0;
  v_last date;
begin
  select max(study_date) into v_last
  from public.study_days
  where user_id = p_user_id;

  if v_last is not null then
    select count(*)::integer into v_current
    from (
      select
        study_date,
        row_number() over (order by study_date desc) - 1 as offset_days
      from public.study_days
      where user_id = p_user_id
    ) ranked
    where study_date = v_last - (offset_days::integer);

    select coalesce(max(run_length), 0)::integer into v_longest
    from (
      select count(*) as run_length
      from (
        select
          study_date,
          study_date - (row_number() over (order by study_date))::integer as run_group
        from public.study_days
        where user_id = p_user_id
      ) grouped_days
      group by run_group
    ) runs;
  end if;

  insert into public.user_stats(user_id, current_streak, longest_streak, last_study_date)
  values (p_user_id, v_current, v_longest, v_last)
  on conflict (user_id) do update set
    current_streak = excluded.current_streak,
    longest_streak = greatest(public.user_stats.longest_streak, excluded.longest_streak),
    last_study_date = excluded.last_study_date,
    updated_at = now();
end;
$$;

create or replace function public.submit_sync_event(
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
  total_xp bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_sequence bigint;
  v_total integer;
  v_correct integer;
  v_checkpoint boolean;
  v_passed boolean;
  v_perfect boolean;
  v_reward integer := 0;
  v_activity_id text;
  v_accuracy numeric(6,5);
  v_fingerprint text;
  v_legacy_xp bigint;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  if p_platform not in ('web', 'android', 'ios') then
    raise exception 'invalid-platform';
  end if;
  if p_event_type not in (
    'answer.recorded',
    'lesson.completed',
    'checkpoint.completed',
    'achievement.unlocked',
    'profile.updated',
    'active_session.updated',
    'legacy.imported'
  ) then
    raise exception 'invalid-event-type';
  end if;
  if octet_length(coalesce(p_payload, '{}'::jsonb)::text) > 32768 then
    raise exception 'payload-too-large';
  end if;
  if p_timezone is not null and char_length(p_timezone) > 80 then
    raise exception 'invalid-timezone';
  end if;

  insert into public.devices(user_id, device_id, platform, last_seen_at)
  values (v_user_id, p_device_id, p_platform, now())
  on conflict (user_id, device_id) do update set
    platform = excluded.platform,
    last_seen_at = now();

  insert into public.sync_events(
    event_id, user_id, device_id, event_type, payload, local_date, timezone
  )
  values (
    p_event_id, v_user_id, p_device_id, p_event_type, p_payload,
    p_local_date, nullif(p_timezone, '')
  )
  on conflict (event_id) do nothing
  returning sequence into v_sequence;

  if v_sequence is null then
    select sequence into v_sequence
    from public.sync_events
    where event_id = p_event_id and user_id = v_user_id;

    if v_sequence is null then
      raise exception 'event-id-owned-by-another-user';
    end if;

    return query
      select v_sequence, false, coalesce(s.total_xp, 0)
      from public.user_stats s
      where s.user_id = v_user_id;
    return;
  end if;

  if p_event_type = 'answer.recorded' then
    if coalesce(p_payload ->> 'lesson_id', '') = ''
      or coalesce(p_payload ->> 'question_id', '') = ''
      or jsonb_typeof(p_payload -> 'is_correct') <> 'boolean' then
      raise exception 'invalid-answer-event';
    end if;

    insert into public.answer_history(
      event_id, user_id, lesson_id, question_id, selected_answer, is_correct, answered_at
    )
    values (
      p_event_id,
      v_user_id,
      left(p_payload ->> 'lesson_id', 160),
      left(p_payload ->> 'question_id', 160),
      nullif(left(coalesce(p_payload ->> 'selected_answer', ''), 1000), ''),
      (p_payload ->> 'is_correct')::boolean,
      coalesce((p_payload ->> 'answered_at')::timestamptz, now())
    );

  elsif p_event_type in ('lesson.completed', 'checkpoint.completed') then
    v_activity_id := left(coalesce(p_payload ->> 'activity_id', ''), 160);
    v_total := coalesce((p_payload ->> 'total')::integer, 0);
    v_correct := coalesce((p_payload ->> 'correct')::integer, -1);
    v_checkpoint := p_event_type = 'checkpoint.completed';

    if v_activity_id = '' or v_total < 1 or v_total > 100
      or v_correct < 0 or v_correct > v_total then
      raise exception 'invalid-completion-event';
    end if;

    v_accuracy := v_correct::numeric / v_total::numeric;
    v_passed := not v_checkpoint or v_accuracy >= 0.8;
    v_perfect := v_correct = v_total;
    v_reward := v_total * 5
      + case when v_checkpoint and v_passed then 50
             when not v_checkpoint then 20
             else 0 end
      + case when not v_checkpoint and v_perfect then 10 else 0 end;

    insert into public.lesson_progress(
      user_id, activity_id, activity_type, status, best_accuracy,
      attempts, completed_at, updated_at, last_event_id
    )
    values (
      v_user_id,
      v_activity_id,
      case when v_checkpoint then 'checkpoint' else 'lesson' end,
      case when v_passed then 'completed' else 'failed' end,
      v_accuracy,
      1,
      case when v_passed then now() else null end,
      now(),
      p_event_id
    )
    on conflict (user_id, activity_id) do update set
      status = case
        when public.lesson_progress.status = 'completed' then 'completed'
        else excluded.status
      end,
      best_accuracy = greatest(public.lesson_progress.best_accuracy, excluded.best_accuracy),
      attempts = public.lesson_progress.attempts + 1,
      completed_at = coalesce(public.lesson_progress.completed_at, excluded.completed_at),
      updated_at = now(),
      last_event_id = excluded.last_event_id;

    insert into public.user_stats(
      user_id, total_xp, lessons_completed, checkpoints_completed, updated_at
    )
    values (
      v_user_id,
      v_reward,
      case when not v_checkpoint and v_passed then 1 else 0 end,
      case when v_checkpoint and v_passed then 1 else 0 end,
      now()
    )
    on conflict (user_id) do update set
      total_xp = public.user_stats.total_xp + excluded.total_xp,
      lessons_completed = public.user_stats.lessons_completed
        + case when not v_checkpoint and v_passed
          and not exists (
            select 1 from public.sync_events previous
            where previous.user_id = v_user_id
              and previous.sequence < v_sequence
              and previous.event_type = 'lesson.completed'
              and previous.payload ->> 'activity_id' = v_activity_id
          ) then 1 else 0 end,
      checkpoints_completed = public.user_stats.checkpoints_completed
        + case when v_checkpoint and v_passed
          and not exists (
            select 1 from public.sync_events previous
            where previous.user_id = v_user_id
              and previous.sequence < v_sequence
              and previous.event_type = 'checkpoint.completed'
              and previous.payload ->> 'activity_id' = v_activity_id
          ) then 1 else 0 end,
      updated_at = now();

    delete from public.active_progress
    where user_id = v_user_id and activity_id = v_activity_id;

    if p_local_date is not null then
      insert into public.study_days(user_id, study_date, timezone)
      values (v_user_id, p_local_date, coalesce(nullif(p_timezone, ''), 'UTC'))
      on conflict (user_id, study_date) do nothing;
      perform public.recompute_streak(v_user_id);
    end if;

  elsif p_event_type = 'achievement.unlocked' then
    if coalesce(p_payload ->> 'achievement_id', '') = '' then
      raise exception 'invalid-achievement-event';
    end if;
    insert into public.user_achievements(user_id, achievement_id, event_id)
    values (v_user_id, left(p_payload ->> 'achievement_id', 160), p_event_id)
    on conflict (user_id, achievement_id) do nothing;

  elsif p_event_type = 'profile.updated' then
    update public.profiles set
      display_name = case
        when p_payload ? 'display_name'
          then nullif(left(trim(p_payload ->> 'display_name'), 80), '')
        else display_name
      end,
      avatar_url = case
        when p_payload ? 'avatar_url'
          then nullif(left(trim(p_payload ->> 'avatar_url'), 2048), '')
        else avatar_url
      end,
      timezone = case
        when p_payload ? 'timezone'
          then left(trim(p_payload ->> 'timezone'), 80)
        else timezone
      end,
      profile_version = profile_version + 1,
      updated_at = now()
    where user_id = v_user_id;

  elsif p_event_type = 'active_session.updated' then
    if coalesce(p_payload ->> 'activity_id', '') = ''
      or coalesce((p_payload ->> 'step_index')::integer, -1) < 0 then
      raise exception 'invalid-active-session-event';
    end if;
    insert into public.active_progress(
      user_id, device_id, activity_id, step_index, started_at,
      answers, updated_at, event_id
    )
    values (
      v_user_id,
      p_device_id,
      left(p_payload ->> 'activity_id', 160),
      (p_payload ->> 'step_index')::integer,
      coalesce((p_payload ->> 'started_at')::timestamptz, now()),
      coalesce(p_payload -> 'answers', '{}'::jsonb),
      now(),
      p_event_id
    )
    on conflict (user_id, device_id) do update set
      activity_id = excluded.activity_id,
      step_index = case
        when public.active_progress.activity_id = excluded.activity_id
          then greatest(public.active_progress.step_index, excluded.step_index)
        else excluded.step_index
      end,
      started_at = excluded.started_at,
      answers = excluded.answers,
      updated_at = now(),
      event_id = excluded.event_id;

  elsif p_event_type = 'legacy.imported' then
    v_fingerprint := lower(coalesce(p_payload ->> 'fingerprint', ''));
    v_legacy_xp := coalesce((p_payload ->> 'legacy_xp')::bigint, -1);
    if v_fingerprint !~ '^[a-f0-9]{32,128}$'
      or v_legacy_xp < 0 or v_legacy_xp > 10000000 then
      raise exception 'invalid-legacy-import';
    end if;

    insert into public.legacy_imports(user_id, fingerprint, event_id)
    values (v_user_id, v_fingerprint, p_event_id)
    on conflict (user_id, fingerprint) do nothing;

    if found then
      insert into public.user_stats(user_id, total_xp, updated_at)
      values (v_user_id, v_legacy_xp, now())
      on conflict (user_id) do update set
        total_xp = public.user_stats.total_xp + excluded.total_xp,
        updated_at = now();

      if jsonb_typeof(coalesce(p_payload -> 'completed_lesson_ids', '[]'::jsonb)) <> 'array'
        or jsonb_typeof(coalesce(p_payload -> 'completed_checkpoint_ids', '[]'::jsonb)) <> 'array'
        or jsonb_typeof(coalesce(p_payload -> 'achievement_ids', '[]'::jsonb)) <> 'array'
        or jsonb_array_length(coalesce(p_payload -> 'completed_lesson_ids', '[]'::jsonb)) > 5000
        or jsonb_array_length(coalesce(p_payload -> 'completed_checkpoint_ids', '[]'::jsonb)) > 1000
        or jsonb_array_length(coalesce(p_payload -> 'achievement_ids', '[]'::jsonb)) > 1000 then
        raise exception 'invalid-legacy-collections';
      end if;

      insert into public.lesson_progress(
        user_id, activity_id, activity_type, status, best_accuracy,
        attempts, completed_at, updated_at, last_event_id
      )
      select v_user_id, left(value, 160), 'lesson', 'completed', 1, 1, now(), now(), p_event_id
      from jsonb_array_elements_text(coalesce(p_payload -> 'completed_lesson_ids', '[]'::jsonb))
      where value <> ''
      on conflict (user_id, activity_id) do update set
        status = 'completed',
        completed_at = coalesce(public.lesson_progress.completed_at, excluded.completed_at),
        updated_at = now();

      insert into public.lesson_progress(
        user_id, activity_id, activity_type, status, best_accuracy,
        attempts, completed_at, updated_at, last_event_id
      )
      select v_user_id, left(value, 160), 'checkpoint', 'completed', 1, 1, now(), now(), p_event_id
      from jsonb_array_elements_text(coalesce(p_payload -> 'completed_checkpoint_ids', '[]'::jsonb))
      where value <> ''
      on conflict (user_id, activity_id) do update set
        status = 'completed',
        completed_at = coalesce(public.lesson_progress.completed_at, excluded.completed_at),
        updated_at = now();

      insert into public.user_achievements(user_id, achievement_id, event_id)
      select v_user_id, left(value, 160), p_event_id
      from jsonb_array_elements_text(coalesce(p_payload -> 'achievement_ids', '[]'::jsonb))
      where value <> ''
      on conflict (user_id, achievement_id) do nothing;
    end if;
  end if;

  return query
    select v_sequence, true, coalesce(s.total_xp, 0)
    from public.user_stats s
    where s.user_id = v_user_id;
end;
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;
  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.submit_sync_event(uuid, uuid, text, text, jsonb, date, text) from public;
grant execute on function public.submit_sync_event(uuid, uuid, text, text, jsonb, date, text) to authenticated;
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
revoke all on function public.recompute_streak(uuid) from public;

grant select on public.profiles to authenticated;
grant update(display_name, avatar_url, timezone) on public.profiles to authenticated;
grant select on public.devices to authenticated;
grant select on public.sync_events to authenticated;
grant select on public.user_stats to authenticated;
grant select on public.study_days to authenticated;
grant select on public.lesson_progress to authenticated;
grant select on public.answer_history to authenticated;
grant select on public.user_achievements to authenticated;
grant select on public.active_progress to authenticated;
grant select on public.legacy_imports to authenticated;

commit;
