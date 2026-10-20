begin;

create table if not exists public.concept_review_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null check (char_length(concept_id) between 1 and 160),
  question_id text not null check (char_length(question_id) between 1 and 160),
  memory_state text not null check (memory_state in ('learning', 'review', 'relearning')),
  stability_days numeric(10,4) not null check (stability_days between 0.25 and 3650),
  difficulty_score numeric(5,2) not null check (difficulty_score between 1 and 10),
  retrievability numeric(6,5) not null check (retrievability between 0 and 1),
  repetitions integer not null default 0 check (repetitions >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  attempts integer not null default 1 check (attempts > 0),
  scheduled_days integer not null default 0 check (scheduled_days between 0 and 3650),
  due_at timestamptz not null,
  last_reviewed_at timestamptz not null,
  last_result boolean not null,
  last_event_id uuid not null references public.sync_events(event_id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (user_id, concept_id)
);

create index if not exists concept_review_due
  on public.concept_review_state(user_id, due_at);

create table if not exists public.review_history (
  event_id uuid primary key references public.sync_events(event_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null check (char_length(concept_id) between 1 and 160),
  question_id text not null check (char_length(question_id) between 1 and 160),
  is_correct boolean not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  activity_mode text not null check (activity_mode in ('lesson', 'checkpoint', 'review', 'formation', 'deepen', 'greek')),
  attempt_number integer not null check (attempt_number > 0),
  reviewed_at timestamptz not null,
  stability_before numeric(10,4),
  stability_after numeric(10,4) not null,
  retention_before numeric(6,5) not null,
  due_at timestamptz not null
);

create index if not exists review_history_user_reviewed
  on public.review_history(user_id, reviewed_at desc);

alter table public.concept_review_state enable row level security;
alter table public.review_history enable row level security;

drop policy if exists "concept_review_select_own" on public.concept_review_state;
create policy "concept_review_select_own" on public.concept_review_state
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "review_history_select_own" on public.review_history;
create policy "review_history_select_own" on public.review_history
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.update_concept_review_from_answer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
  v_concept_id text;
  v_difficulty text;
  v_mode text;
  v_now timestamptz;
  v_current public.concept_review_state%rowtype;
  v_has_current boolean := false;
  v_stability_before numeric;
  v_stability numeric;
  v_difficulty_score numeric;
  v_retention numeric;
  v_elapsed_days numeric;
  v_evidence_weight numeric;
  v_spacing_gain numeric;
  v_state text;
  v_scheduled_days integer;
  v_attempt integer;
  v_lapses integer;
  v_repetitions integer;
  v_due_at timestamptz;
begin
  select payload into v_payload
  from public.sync_events
  where event_id = new.event_id and user_id = new.user_id;

  v_concept_id := left(coalesce(v_payload ->> 'concept_id', ''), 160);
  if v_concept_id = '' then
    return new;
  end if;

  v_difficulty := case
    when v_payload ->> 'difficulty' in ('easy', 'medium', 'hard') then v_payload ->> 'difficulty'
    else 'medium'
  end;
  v_mode := case
    when v_payload ->> 'mode' in ('lesson', 'checkpoint', 'review', 'formation', 'deepen', 'greek')
      then v_payload ->> 'mode'
    else 'lesson'
  end;
  v_now := coalesce(new.answered_at, now());

  select * into v_current
  from public.concept_review_state
  where user_id = new.user_id and concept_id = v_concept_id
  for update;
  v_has_current := found;

  if v_has_current then
    v_stability_before := v_current.stability_days;
    v_elapsed_days := greatest(0, extract(epoch from (v_now - v_current.last_reviewed_at)) / 86400);
    v_retention := greatest(0, least(1,
      exp(ln(0.9) * (v_elapsed_days / greatest(0.25, v_current.stability_days)))
    ));
    v_difficulty_score := v_current.difficulty_score;
    v_attempt := v_current.attempts + 1;
    v_lapses := v_current.lapses;
    v_repetitions := v_current.repetitions;
  else
    v_stability_before := null;
    v_retention := 0;
    v_difficulty_score := case v_difficulty when 'easy' then 3.5 when 'hard' then 7 else 5 end;
    v_attempt := 1;
    v_lapses := 0;
    v_repetitions := 0;
  end if;

  if new.is_correct then
    if not v_has_current then
      v_stability := case v_difficulty when 'easy' then 3 when 'hard' then 1 else 2 end;
      v_state := 'learning';
    else
      v_evidence_weight := case when v_mode in ('review', 'checkpoint') then 1.7 else 0.75 end;
      v_spacing_gain := greatest(0.05, (1 - v_retention) * v_evidence_weight * ((11 - v_difficulty_score) / 10));
      v_stability := v_current.stability_days * (1 + v_spacing_gain);
      v_state := 'review';
    end if;
    v_difficulty_score := v_difficulty_score - case when v_mode in ('review', 'checkpoint') then 0.25 else 0.1 end;
    v_repetitions := v_repetitions + 1;
  else
    v_stability := case when v_has_current then v_current.stability_days * 0.35 else 0.25 end;
    v_difficulty_score := v_difficulty_score + case when v_mode in ('review', 'checkpoint') then 1 else 0.7 end;
    v_lapses := v_lapses + 1;
    v_state := 'relearning';
  end if;

  v_stability := greatest(0.25, least(3650, v_stability));
  v_difficulty_score := greatest(1, least(10, v_difficulty_score));
  v_scheduled_days := case when new.is_correct then greatest(1, ceil(v_stability)::integer) else 0 end;
  v_due_at := v_now + make_interval(days => v_scheduled_days);

  insert into public.review_history(
    event_id, user_id, concept_id, question_id, is_correct, difficulty,
    activity_mode, attempt_number, reviewed_at, stability_before,
    stability_after, retention_before, due_at
  ) values (
    new.event_id, new.user_id, v_concept_id, new.question_id, new.is_correct,
    v_difficulty, v_mode, v_attempt, v_now, v_stability_before,
    v_stability, v_retention, v_due_at
  ) on conflict (event_id) do nothing;

  insert into public.concept_review_state(
    user_id, concept_id, question_id, memory_state, stability_days,
    difficulty_score, retrievability, repetitions, lapses, attempts,
    scheduled_days, due_at, last_reviewed_at, last_result, last_event_id, updated_at
  ) values (
    new.user_id, v_concept_id, new.question_id, v_state, v_stability,
    v_difficulty_score, case when new.is_correct then 1 else 0 end,
    v_repetitions, v_lapses, v_attempt, v_scheduled_days, v_due_at,
    v_now, new.is_correct, new.event_id, now()
  )
  on conflict (user_id, concept_id) do update set
    question_id = excluded.question_id,
    memory_state = excluded.memory_state,
    stability_days = excluded.stability_days,
    difficulty_score = excluded.difficulty_score,
    retrievability = excluded.retrievability,
    repetitions = excluded.repetitions,
    lapses = excluded.lapses,
    attempts = excluded.attempts,
    scheduled_days = excluded.scheduled_days,
    due_at = excluded.due_at,
    last_reviewed_at = excluded.last_reviewed_at,
    last_result = excluded.last_result,
    last_event_id = excluded.last_event_id,
    updated_at = now()
  where public.concept_review_state.last_reviewed_at <= excluded.last_reviewed_at;

  return new;
end;
$$;

drop trigger if exists answer_history_update_review on public.answer_history;
create trigger answer_history_update_review
after insert on public.answer_history
for each row execute function public.update_concept_review_from_answer();

revoke all on public.concept_review_state from anon;
revoke all on public.review_history from anon;
grant select on public.concept_review_state to authenticated;
grant select on public.review_history to authenticated;
revoke all on function public.update_concept_review_from_answer() from public;

commit;
