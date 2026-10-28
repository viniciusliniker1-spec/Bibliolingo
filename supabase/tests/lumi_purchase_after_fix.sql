begin;
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000002');
update public.user_lumi_wallets set balance=1000 where user_id='00000000-0000-4000-8000-000000000001';
update public.user_stats set total_xp=777;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare r record;
begin
  select * into r from public.purchase_lumi_item('lumi_oculos','00000000-0000-4000-8000-000000000010');
  if r.balance<>900 or not r.acquired then raise exception 'Purchase receipt mismatch';end if;
  if not exists(select 1 from public.user_lumi_inventory where user_id=auth.uid() and item_id='lumi_oculos') then raise exception 'Inventory missing';end if;
  if (select count(*) from public.lumi_transactions where user_id=auth.uid() and transaction_type='purchase')<>1 then raise exception 'Missing transaction';end if;

  -- Retry same request and concurrent-style retry with another ID cannot debit twice.
  perform public.purchase_lumi_item('lumi_oculos','00000000-0000-4000-8000-000000000010');
  select * into r from public.purchase_lumi_item('lumi_oculos','00000000-0000-4000-8000-000000000011');
  if r.balance<>900 or r.acquired then raise exception 'Duplicate purchase debit';end if;
  perform public.equip_lumi_item('lumi_oculos');
  if not exists(select 1 from public.user_lumi_equipment where user_id=auth.uid() and item_id='lumi_oculos') then raise exception 'Equipment missing';end if;

  begin
    perform public.purchase_lumi_item('lumi_hiphop','00000000-0000-4000-8000-000000000010');
    raise exception 'Expected request conflict';
  exception when raise_exception then
    if sqlerrm<>'purchase-request-conflict' then raise;end if;
  end;

  begin
    perform public.purchase_lumi_item('lumi_eva','00000000-0000-4000-8000-000000000012');
    raise exception 'Expected locked skin';
  exception when raise_exception then
    if sqlerrm<>'item-locked' then raise;end if;
  end;

  select * into r from public.purchase_lumi_item('lumi_base','00000000-0000-4000-8000-000000000013');
  if r.balance<>900 then raise exception 'Original skin charged';end if;
  if (select total_xp from public.user_stats where user_id=auth.uid())<>777 then raise exception 'Purchase changed XP';end if;
  if exists(select 1 from public.user_lumi_wallets where user_id<>auth.uid()) then raise exception 'RLS leaked another wallet';end if;
  begin
    update public.user_lumi_wallets set balance=99999 where user_id=auth.uid();
    raise exception 'Client changed wallet';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS: purchase, inventory, equip, retries, locked skin, original, XP, RLS';
end; $$;

-- Actual learning event and reward RPC: +5 once per event, replay never duplicates.
select * from public.submit_sync_event_with_lumi(
 '00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000099',
 'android','lesson.completed','{"activity_id":"genesis-u01-l01","total":5,"correct":5}',current_date,'UTC');
select * from public.submit_sync_event_with_lumi(
 '00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000099',
 'android','lesson.completed','{"activity_id":"genesis-u01-l01","total":5,"correct":5}',current_date,'UTC');
do $$ begin
 if (select balance from public.user_lumi_wallets where user_id=auth.uid())<>905 then raise exception 'Reward duplicated or missing';end if;
end; $$;

select * from public.submit_sync_event_with_lumi(
 '00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000099',
 'android','checkpoint.completed','{"activity_id":"genesis-u10-checkpoint","total":5,"correct":5}',current_date,'UTC');
do $$ declare r record; begin
 select * into r from public.purchase_lumi_item('lumi_eva','00000000-0000-4000-8000-000000000014');
 if r.balance<>730 or not r.acquired then raise exception 'Thematic purchase/reward mismatch';end if;
 raise notice 'PASS: real learning events, +5 lesson, +25 checkpoint, replay, thematic unlock';
end; $$;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ begin
 begin
  perform public.purchase_lumi_item('lumi_hiphop','00000000-0000-4000-8000-000000000030');
  raise exception 'Expected insufficient balance';
 exception when raise_exception then
  if sqlerrm<>'insufficient-lumi-coins' then raise;end if;
 end;
 if (select balance from public.user_lumi_wallets where user_id=auth.uid())<>0 then raise exception 'Negative balance';end if;
 if exists(select 1 from public.user_lumi_inventory where item_id='lumi_oculos') then raise exception 'Inventory leaked from other user';end if;
 raise notice 'PASS: insufficient balance and cross-account isolation';
end; $$;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin
  perform public.purchase_lumi_item('lumi_oculos','00000000-0000-4000-8000-000000000031');
  raise exception 'Expected authentication requirement';
 exception when sqlstate '28000' then null;
 end;
end; $$;
reset role;
rollback;
