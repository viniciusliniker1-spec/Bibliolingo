-- Skins da Bíblia: o servidor reconhece a skin equipada (ranking) mas não as vende.
-- Roda com as migrations reais num banco descartável, numa transação que termina em rollback.
begin;

insert into auth.users(id, raw_user_meta_data) values
 ('30000000-0000-4000-8000-00000000000a', '{"display_name":"Eva Tester"}');

do $$
declare v_count integer;
begin
  select count(*) into v_count from public.lumi_items
   where category = 'skin' and active and unlock_rule ->> 'kind' = 'book';
  if v_count <> 59 then raise exception 'esperava 59 skins da Bíblia ativas, achei %', v_count; end if;
  if exists (select 1 from public.lumi_items where unlock_rule ->> 'kind' = 'book' and price <> 0) then
    raise exception 'skin da Bíblia não pode ter preço';
  end if;
  if not exists (select 1 from public.lumi_items where id = 'lumi_revelation' and unlock_rule ->> 'book_id' = 'revelation') then
    raise exception 'lumi_revelation deveria apontar para o livro revelation';
  end if;
  -- as cinco skins antigas continuam como estavam
  if (select price from public.lumi_items where id = 'lumi_deuteronomio') <> 400 then
    raise exception 'a migração não deveria mexer nas skins antigas';
  end if;
end;
$$;

-- O ranking e os perfis aceitam a skin da Bíblia equipada; valor inventado continua virando a Lumi padrão.
insert into public.user_account_state(user_id, progress_snapshot, progress_updated_at) values
 ('30000000-0000-4000-8000-00000000000a', '{"schemaVersion":1,"lumiWallet":{"equippedSkinId":"lumi_joshua"}}', now());
do $$
begin
  if public.social_skin('30000000-0000-4000-8000-00000000000a') <> 'lumi_joshua' then
    raise exception 'a skin da Bíblia equipada deveria aparecer no social';
  end if;
end;
$$;
update public.user_account_state set progress_snapshot = '{"schemaVersion":1,"lumiWallet":{"equippedSkinId":"lumi_nao_existe"}}'
 where user_id = '30000000-0000-4000-8000-00000000000a';
do $$
begin
  if public.social_skin('30000000-0000-4000-8000-00000000000a') <> 'lumi_base' then
    raise exception 'skin inexistente deveria virar lumi_base';
  end if;
end;
$$;

-- O servidor não vende skin da Bíblia (a liberação é pelo livro, no próprio app).
set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-00000000000a', true);
do $$
declare v_failed boolean := false; v_msg text;
begin
  begin
    perform * from public.purchase_lumi_item('lumi_joshua', gen_random_uuid());
  exception when others then
    v_failed := true; v_msg := sqlerrm;
  end;
  if not v_failed then raise exception 'a compra de skin da Bíblia deveria falhar'; end if;
  if v_msg <> 'unsupported-unlock-rule' then raise exception 'esperava unsupported-unlock-rule, veio %', v_msg; end if;
end;
$$;

rollback;
