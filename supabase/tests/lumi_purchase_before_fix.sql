begin;
insert into auth.users(id) values ('00000000-0000-4000-8000-000000000001');
update public.user_lumi_wallets set balance=1000 where user_id='00000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$
begin
  begin
    perform public.purchase_lumi_item('lumi_oculos','00000000-0000-4000-8000-000000000010');
    raise exception 'Regression was not reproduced: legacy purchase unexpectedly succeeded';
  exception when ambiguous_column then
    raise notice 'REPRODUCED: purchase fails with SQLSTATE 42702 (ambiguous balance)';
  end;
  if (select w.balance from public.user_lumi_wallets w where w.user_id=auth.uid())<>1000 then
    raise exception 'Failed transaction changed balance';
  end if;
end; $$;
rollback;
