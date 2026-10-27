begin;

create or replace function public.reconcile_lumi_rewards()
returns table(reconciled_events integer, credited_total integer, balance integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event record;
  v_reward record;
  v_reconciled integer := 0;
  v_credited integer := 0;
  v_balance integer := 0;
begin
  if v_user_id is null then
    raise exception 'authentication-required' using errcode = '28000';
  end if;

  insert into public.user_lumi_wallets(user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  for v_event in
    select event_id
    from public.sync_events
    where user_id = v_user_id
      and event_type in ('lesson.completed', 'checkpoint.completed', 'achievement.unlocked')
    order by sequence
    limit 5000
  loop
    begin
      select * into v_reward
      from public.reward_lumi_learning_event(v_event.event_id);
      v_reconciled := v_reconciled + 1;
      v_credited := v_credited + coalesce(v_reward.credited, 0);
      v_balance := coalesce(v_reward.balance, v_balance);
    exception
      when others then
        -- Um evento editorial antigo inválido não bloqueia os demais.
        null;
    end;
  end loop;

  select w.balance into v_balance
  from public.user_lumi_wallets w
  where w.user_id = v_user_id;

  return query select v_reconciled, v_credited, coalesce(v_balance, 0);
end;
$$;

revoke all on function public.reconcile_lumi_rewards() from public;
grant execute on function public.reconcile_lumi_rewards() to authenticated;
notify pgrst, 'reload schema';
commit;
