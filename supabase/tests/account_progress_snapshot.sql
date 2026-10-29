begin;

insert into auth.users(id) values
 ('10000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
set local role authenticated;

select public.save_mobile_account_state(
 '{"goal":"daily-habit"}'::jsonb,
 '{"soundEnabled":true}'::jsonb,
 '{"note-1":{"id":"note-1","text":"teste"}}'::jsonb,
 '{"bookId":"genesis","chapter":1}'::jsonb,
 array['logos']
);

do $$
declare r record;
begin
  select * into r from public.save_mobile_progress_snapshot(
    '{"schemaVersion":1,"xp":120,"completedLessonIds":["genesis-u01-l01"]}'::jsonb,
    '2026-10-29T12:00:00Z'::timestamptz
  );
  if not r.accepted then raise exception 'Initial progress snapshot was rejected'; end if;

  select * into r from public.save_mobile_progress_snapshot(
    '{"schemaVersion":1,"xp":1,"completedLessonIds":[]}'::jsonb,
    '2026-10-29T11:59:00Z'::timestamptz
  );
  if r.accepted then raise exception 'Older device snapshot overwrote newer account progress'; end if;

  if (select progress_snapshot->>'xp' from public.user_account_state where user_id=auth.uid()) <> '120' then
    raise exception 'Account progress was not preserved';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$
begin
  if exists(select 1 from public.user_account_state) then
    raise exception 'RLS exposed another student account state';
  end if;
end;
$$;

reset role;
rollback;
