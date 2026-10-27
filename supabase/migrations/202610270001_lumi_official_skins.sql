begin;

alter table public.lumi_items drop constraint if exists lumi_items_category_check;
alter table public.lumi_items add constraint lumi_items_category_check
  check (category in ('skin','head','glasses','outfit','backpack','special','celebration'));
alter table public.user_lumi_equipment drop constraint if exists user_lumi_equipment_category_check;
alter table public.user_lumi_equipment add constraint user_lumi_equipment_category_check
  check (category in ('skin','head','glasses','outfit','backpack','special','celebration'));

update public.lumi_items set active=false,updated_at=now() where category<>'skin';

insert into public.lumi_items(id,name,description,category,price,rarity,asset_path,asset_status,unlock_rule,layer_order,anchor,active) values
 ('lumi_base','Lumi Original','A companheira original de toda jornada Bibliolingo.','skin',0,'common',null,'pending','{"kind":"none"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_oculos','Lumi Intelectual','Óculos para acompanhar estudos e descobertas.','skin',100,'common','assets/lumi/skins/lumi_oculos.png','approved','{"kind":"none"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_hiphop','Lumi Hip-Hop','Uma versão urbana e cheia de personalidade.','skin',250,'rare','assets/lumi/skins/lumi_hiphop.png','approved','{"kind":"none"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_eva','Lumi Jardim do Éden','Skin temática liberada após concluir Gênesis.','skin',200,'rare','assets/lumi/skins/lumi_eva_folhas.png','approved','{"kind":"achievement_purchase","achievement_id":"genesis-complete"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_moises','Lumi Moisés','Skin temática liberada após concluir Êxodo.','skin',300,'epic','assets/lumi/skins/lumi_moises.png','approved','{"kind":"achievement_purchase","achievement_id":"exodus-complete"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_levitico','Lumi Sacerdotal','Skin temática liberada após concluir Levítico.','skin',350,'epic','assets/lumi/skins/lumi_levitico.png','approved','{"kind":"achievement_purchase","achievement_id":"leviticus-complete"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_numeros','Lumi Peregrina','Skin temática liberada após concluir Números.','skin',350,'epic','assets/lumi/skins/lumi_numeros.png','approved','{"kind":"achievement_purchase","achievement_id":"numbers-complete"}',10,'{"x":0.5,"y":0.5,"scale":1}',true),
 ('lumi_deuteronomio','Lumi da Aliança','Skin temática liberada após concluir Deuteronômio.','skin',400,'legendary','assets/lumi/skins/lumi_deuteronomio.png','approved','{"kind":"achievement_purchase","achievement_id":"deuteronomy-complete"}',10,'{"x":0.5,"y":0.5,"scale":1}',true)
on conflict(id) do update set name=excluded.name,description=excluded.description,category=excluded.category,price=excluded.price,rarity=excluded.rarity,asset_path=excluded.asset_path,asset_status=excluded.asset_status,unlock_rule=excluded.unlock_rule,layer_order=excluded.layer_order,anchor=excluded.anchor,active=excluded.active,updated_at=now();

insert into public.user_lumi_inventory(user_id,item_id,acquired_at,acquisition_type)
select id,'lumi_base',now(),'migration' from auth.users
on conflict(user_id,item_id) do nothing;
insert into public.user_lumi_equipment(user_id,category,item_id)
select id,'skin','lumi_base' from auth.users
on conflict(user_id,category) do nothing;

create or replace function public.handle_new_lumi_user()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.user_lumi_wallets(user_id,balance) values(new.id,0) on conflict(user_id) do nothing;
 insert into public.user_lumi_inventory(user_id,item_id,acquisition_type) values(new.id,'lumi_base','grant') on conflict(user_id,item_id) do nothing;
 insert into public.user_lumi_equipment(user_id,category,item_id) values(new.id,'skin','lumi_base') on conflict(user_id,category) do nothing;
 return new;
end;$$;

create or replace function public.purchase_lumi_item(p_item_id text,p_request_id uuid)
returns table(balance integer,acquired boolean)
language plpgsql security definer set search_path='' as $$
declare v_user_id uuid:=auth.uid();v_item public.lumi_items%rowtype;v_balance integer;v_kind text;v_achievement text;
begin
 if v_user_id is null then raise exception 'authentication-required' using errcode='28000';end if;
 if p_request_id is null then raise exception 'request-id-required';end if;
 select * into v_item from public.lumi_items where id=p_item_id and active=true;
 if not found then raise exception 'item-unavailable';end if;
 if exists(select 1 from public.user_lumi_inventory where user_id=v_user_id and item_id=p_item_id) then
  select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id;
  return query select coalesce(v_balance,0),false;return;
 end if;
 v_kind:=coalesce(v_item.unlock_rule->>'kind','none');
 if v_kind in ('achievement','achievement_purchase') then
  v_achievement:=v_item.unlock_rule->>'achievement_id';
  if not exists(select 1 from public.user_achievements where user_id=v_user_id and achievement_id=v_achievement) then raise exception 'item-locked';end if;
 elsif v_kind<>'none' then raise exception 'unsupported-unlock-rule';end if;
 insert into public.user_lumi_wallets(user_id,balance) values(v_user_id,0) on conflict(user_id) do nothing;
 select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id for update;
 if v_balance<v_item.price then raise exception 'insufficient-lumi-coins';end if;
 update public.user_lumi_wallets set balance=balance-v_item.price,updated_at=now() where user_id=v_user_id returning user_lumi_wallets.balance into v_balance;
 insert into public.user_lumi_inventory(user_id,item_id,acquisition_type,source_event_id) values(v_user_id,p_item_id,case when v_item.price>0 then 'purchase' else 'grant' end,p_request_id);
 if v_item.price>0 then insert into public.lumi_transactions(user_id,amount,transaction_type,source_event_id,item_id,balance_after) values(v_user_id,-v_item.price,'purchase',p_request_id,p_item_id,v_balance);end if;
 return query select v_balance,true;
exception when unique_violation then
 select w.balance into v_balance from public.user_lumi_wallets w where w.user_id=v_user_id;
 return query select coalesce(v_balance,0),false;
end;$$;

grant execute on function public.purchase_lumi_item(text,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
