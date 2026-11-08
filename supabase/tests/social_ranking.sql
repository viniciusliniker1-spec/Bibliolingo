-- Testa o social (ranking, amigos, perfis) com as migrations reais num banco descartável.
-- Todo o teste roda numa transação que termina em rollback.
begin;

create or replace function pg_temp.today() returns date language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;
create or replace function pg_temp.week_start() returns date language sql stable as $$
  select date_trunc('week', now() at time zone 'America/Sao_Paulo')::date;
$$;

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_user::text, true);
end;
$$;

-- Garante que uma chamada falha exatamente com a mensagem esperada.
create or replace function pg_temp.expect_error(p_sql text, p_expected text) returns void language plpgsql as $$
declare v_failed boolean := false; v_msg text;
begin
  begin
    execute p_sql;
  exception when others then
    v_failed := true; v_msg := sqlerrm;
  end;
  if not v_failed then raise exception 'esperava o erro "%" mas a chamada funcionou: %', p_expected, p_sql; end if;
  if v_msg <> p_expected then raise exception 'esperava "%" mas veio "%": %', p_expected, v_msg, p_sql; end if;
end;
$$;

insert into auth.users(id, raw_user_meta_data) values
 ('20000000-0000-4000-8000-00000000000a', '{"display_name":"Ana Souza"}'),
 ('20000000-0000-4000-8000-00000000000b', '{"display_name":"Bruno Lima"}'),
 ('20000000-0000-4000-8000-00000000000c', '{"display_name":"Carla Reis"}'),
 ('20000000-0000-4000-8000-00000000000d', '{"display_name":"Davi Neto"}');

-- Cada aluno estuda uma lição pelo caminho real de sincronização (o servidor calcula o XP).
-- A: 10 de 10 (80 XP)  B: 5 de 10 (70 XP)  C: 10 de 10 (80 XP)  D: 10 de 10 (80 XP)
do $$
declare
  u record;
  v_date date;
begin
  for u in
    select * from (values
      ('20000000-0000-4000-8000-00000000000a'::uuid, 10, 10, 0),
      ('20000000-0000-4000-8000-00000000000b'::uuid, 10, 5, 3),
      ('20000000-0000-4000-8000-00000000000c'::uuid, 10, 10, 0),
      ('20000000-0000-4000-8000-00000000000d'::uuid, 10, 10, 0)
    ) as t(id, total, correct, days_ago)
  loop
    perform set_config('request.jwt.claim.sub', u.id::text, true);
    v_date := pg_temp.today() - u.days_ago;
    perform public.submit_sync_event(
      gen_random_uuid(), gen_random_uuid(), 'android', 'lesson.completed',
      jsonb_build_object('activity_id', 'genesis-u01-l01', 'total', u.total, 'correct', u.correct),
      v_date, 'America/Sao_Paulo'
    );
  end loop;
end;
$$;

-- O gatilho registrou o XP de hoje no servidor.
do $$
begin
  if (select xp from public.social_xp_daily where user_id = '20000000-0000-4000-8000-00000000000a' and day = pg_temp.today()) <> 80 then
    raise exception 'XP do dia de A não foi registrado: %', (select xp from public.social_xp_daily where user_id = '20000000-0000-4000-8000-00000000000a');
  end if;
  if (select xp from public.social_xp_daily where user_id = '20000000-0000-4000-8000-00000000000b' and day = pg_temp.today()) <> 70 then
    raise exception 'XP do dia de B não foi registrado';
  end if;
end;
$$;

-- Importação de legado (aumento enorme de uma vez) não vira XP da semana.
update public.user_stats set total_xp = total_xp + 50000 where user_id = '20000000-0000-4000-8000-00000000000c';
do $$
begin
  if (select xp from public.social_xp_daily where user_id = '20000000-0000-4000-8000-00000000000c' and day = pg_temp.today()) <> 80 then
    raise exception 'Importação de legado entrou no XP da semana';
  end if;
end;
$$;

-- Sem acesso direto às tabelas.
set local role authenticated;
select pg_temp.act_as('20000000-0000-4000-8000-00000000000a');
do $$
declare v_ok boolean := false;
begin
  begin
    perform 1 from public.social_profiles;
  exception when insufficient_privilege then v_ok := true;
  end;
  if not v_ok then raise exception 'authenticated conseguiu ler social_profiles direto'; end if;
  v_ok := false;
  begin
    perform 1 from public.social_xp_daily;
  exception when insufficient_privilege then v_ok := true;
  end;
  if not v_ok then raise exception 'authenticated conseguiu ler social_xp_daily direto'; end if;
end;
$$;

-- Antes de entrar: nenhum perfil social.
do $$
begin
  if exists (select 1 from public.social_my_profile()) then raise exception 'perfil social apareceu antes de entrar'; end if;
end;
$$;

-- Validação do @usuário.
select pg_temp.expect_error($$select * from public.social_set_profile('ab')$$, 'invalid-handle');
select pg_temp.expect_error($$select * from public.social_set_profile('Nome Com Espaço')$$, 'invalid-handle');
select pg_temp.expect_error($$select * from public.social_set_profile('this_handle_is_way_too_long_x')$$, 'invalid-handle');
select pg_temp.expect_error($$select * from public.social_set_profile('Admin')$$, 'handle-reserved');

-- A entra (maiúsculas viram minúsculas).
do $$
declare r record;
begin
  select * into r from public.social_set_profile('  Ana_Souza ');
  if r.handle <> 'ana_souza' or not r.visible then raise exception 'perfil de A errado: %', r; end if;
end;
$$;

-- B entra; o @usuário de A já está em uso (sem diferenciar maiúsculas).
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
select pg_temp.expect_error($$select * from public.social_set_profile('ANA_SOUZA')$$, 'handle-taken');
select * from public.social_set_profile('bruno_l');

-- D entra e depois sai do ranking; C nunca entra.
select pg_temp.act_as('20000000-0000-4000-8000-00000000000d');
select * from public.social_set_profile('davi_n');
select * from public.social_set_profile('davi_n', false);

-- Ranking global como B: só A e B (C não entrou, D se escondeu), A em 1º.
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
do $$
declare v_rows integer; r record;
begin
  select count(*) into v_rows from public.social_leaderboard('global', 50);
  if v_rows <> 2 then raise exception 'ranking global deveria ter 2 alunos, tem %', v_rows; end if;

  select * into r from public.social_leaderboard('global', 50) where handle = 'ana_souza';
  if r.rank <> 1 or r.weekly_xp <> 80 or r.is_me or r.display_name <> 'Ana' or r.skin_id <> 'lumi_base' then
    raise exception 'linha de A errada: %', r;
  end if;
  select * into r from public.social_leaderboard('global', 50) where handle = 'bruno_l';
  if r.rank <> 2 or r.weekly_xp <> 70 or not r.is_me then raise exception 'linha de B errada: %', r; end if;
  -- B estudou há 3 dias: a ofensiva expirou e não aparece como se estivesse viva.
  if r.current_streak <> 0 then raise exception 'ofensiva vencida de B deveria aparecer como 0, veio %', r.current_streak; end if;
  if r.week_ends_at <= now() or r.week_ends_at > now() + interval '7 days 1 hour' then
    raise exception 'fim da semana fora do esperado: %', r.week_ends_at;
  end if;

  -- Limite menor que o ranking: continuo vendo a minha linha, mesmo fora do topo.
  select count(*) into v_rows from public.social_leaderboard('global', 1);
  if v_rows <> 2 or not exists (select 1 from public.social_leaderboard('global', 1) where is_me) then
    raise exception 'minha linha deveria aparecer fora do topo';
  end if;
end;
$$;

-- Skin do avatar: vem da carteira Lumi do progresso da conta; valor inválido vira a Lumi padrão.
reset role;
insert into public.user_account_state(user_id, progress_snapshot, progress_updated_at) values
 ('20000000-0000-4000-8000-00000000000a', '{"schemaVersion":1,"lumiWallet":{"equippedSkinId":"lumi_oculos"}}', now()),
 ('20000000-0000-4000-8000-00000000000b', '{"schemaVersion":1,"lumiWallet":{"equippedSkinId":"skin_inventada"}}', now());
set local role authenticated;
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
do $$
declare r record;
begin
  select * into r from public.social_leaderboard('global', 50) where handle = 'ana_souza';
  if r.skin_id <> 'lumi_oculos' then raise exception 'skin de A deveria vir do progresso, veio %', r.skin_id; end if;
  select * into r from public.social_leaderboard('global', 50) where handle = 'bruno_l';
  if r.skin_id <> 'lumi_base' then raise exception 'skin inventada deveria virar lumi_base, veio %', r.skin_id; end if;
  if (select skin_id from public.social_profile('20000000-0000-4000-8000-00000000000a')) <> 'lumi_oculos' then
    raise exception 'skin no perfil de A';
  end if;
  if (select skin_id from public.social_search('ana')) <> 'lumi_oculos' then
    raise exception 'skin na busca por A';
  end if;
end;
$$;

-- Amigos: antes de seguir, só eu; seguir exige entrar e um alvo visível.
do $$
begin
  if (select count(*) from public.social_leaderboard('friends', 50)) <> 1 then
    raise exception 'ranking de amigos deveria ter só eu';
  end if;
end;
$$;
select pg_temp.expect_error($$select public.social_follow('20000000-0000-4000-8000-00000000000b')$$, 'invalid-follow');
select pg_temp.expect_error($$select public.social_follow('20000000-0000-4000-8000-00000000000d')$$, 'user-not-found');
select pg_temp.expect_error($$select public.social_follow('20000000-0000-4000-8000-00000000000c')$$, 'user-not-found');
select pg_temp.expect_error($$select * from public.social_leaderboard('outro', 5)$$, 'invalid-scope');
select public.social_follow('20000000-0000-4000-8000-00000000000a');
select public.social_follow('20000000-0000-4000-8000-00000000000a');
do $$
declare r record;
begin
  if (select count(*) from public.social_leaderboard('friends', 50)) <> 2 then
    raise exception 'ranking de amigos deveria ter A e B';
  end if;
  select * into r from public.social_leaderboard('global', 50) where handle = 'ana_souza';
  if not r.is_following then raise exception 'is_following de A deveria ser verdadeiro'; end if;
end;
$$;

-- Quem não entrou não pode seguir.
select pg_temp.act_as('20000000-0000-4000-8000-00000000000c');
select pg_temp.expect_error($$select public.social_follow('20000000-0000-4000-8000-00000000000a')$$, 'join-required');

-- Perfil público: de A (participante), de C (não participa), o meu mesmo escondido (D).
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
do $$
declare r record;
begin
  select * into r from public.social_profile('20000000-0000-4000-8000-00000000000a');
  if r.handle <> 'ana_souza' or r.week_xp <> 80 or r.week_rank <> 1 or not r.is_following or r.is_me
     or r.lessons_completed <> 1 or r.followers <> 1 or r.following <> 0
     or jsonb_array_length(r.days) <> 7 then
    raise exception 'perfil de A errado: %', r;
  end if;
  if (r.days -> 6 ->> 'day')::date <> pg_temp.today() or (r.days -> 6 ->> 'xp')::int <> 80 then
    raise exception 'último dia do perfil de A errado: %', r.days;
  end if;
  if exists (select 1 from public.social_profile('20000000-0000-4000-8000-00000000000c')) then
    raise exception 'perfil de quem não participa não pode aparecer';
  end if;
  if exists (select 1 from public.social_profile('20000000-0000-4000-8000-00000000000d')) then
    raise exception 'perfil de quem se escondeu não pode aparecer para outros';
  end if;
end;
$$;
select pg_temp.act_as('20000000-0000-4000-8000-00000000000d');
do $$
begin
  if not exists (select 1 from public.social_profile('20000000-0000-4000-8000-00000000000d') where is_me) then
    raise exception 'eu devo ver o meu próprio perfil mesmo escondido';
  end if;
end;
$$;

-- Busca: acha por começo do @usuário e do nome, ignora texto curto, não acha a si nem quem não participa.
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
do $$
begin
  if (select count(*) from public.social_search('ana')) <> 1 then raise exception 'busca por ana'; end if;
  if (select count(*) from public.social_search('@ANA_s')) <> 1 then raise exception 'busca com @ e maiúsculas'; end if;
  if (select count(*) from public.social_search('a')) <> 0 then raise exception 'busca curta deveria ser vazia'; end if;
  if (select count(*) from public.social_search('carla')) <> 0 then raise exception 'busca achou quem não participa'; end if;
  if (select count(*) from public.social_search('davi')) <> 0 then raise exception 'busca achou quem se escondeu'; end if;
  if (select count(*) from public.social_search('bruno')) <> 0 then raise exception 'busca achou a própria pessoa'; end if;
  if not (select is_following from public.social_search('ana') limit 1) then raise exception 'is_following da busca'; end if;
end;
$$;

-- Denúncia: validação e envio (reenviar atualiza, não duplica).
select pg_temp.expect_error($$select public.social_report('20000000-0000-4000-8000-00000000000b', 'x')$$, 'invalid-report');
select pg_temp.expect_error($$select public.social_report('20000000-0000-4000-8000-00000000000a', '   ')$$, 'invalid-report');
select public.social_report('20000000-0000-4000-8000-00000000000a', 'nome ofensivo');
select public.social_report('20000000-0000-4000-8000-00000000000a', 'nome ofensivo de novo');
reset role;
do $$
begin
  if (select count(*) from public.social_reports) <> 1 then raise exception 'denúncia duplicada'; end if;
end;
$$;

-- Semana anterior não conta; um dia vale no máximo 2000 XP.
insert into public.social_xp_daily(user_id, day, xp)
values ('20000000-0000-4000-8000-00000000000b', pg_temp.week_start() - 1, 900);
update public.social_xp_daily set xp = 5000
where user_id = '20000000-0000-4000-8000-00000000000a' and day = pg_temp.today();
set local role authenticated;
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
do $$
declare r record;
begin
  select * into r from public.social_leaderboard('global', 50) where handle = 'bruno_l';
  if r.weekly_xp <> 70 then raise exception 'semana anterior contou no ranking: %', r.weekly_xp; end if;
  select * into r from public.social_leaderboard('global', 50) where handle = 'ana_souza';
  if r.weekly_xp <> 2000 then raise exception 'limite diário de 2000 XP não aplicado: %', r.weekly_xp; end if;
end;
$$;

-- Moderação: aluno suspenso some do ranking, da busca e do perfil.
reset role;
update public.social_profiles set suspended = true where handle = 'ana_souza';
set local role authenticated;
select pg_temp.act_as('20000000-0000-4000-8000-00000000000b');
do $$
begin
  if exists (select 1 from public.social_leaderboard('global', 50) where handle = 'ana_souza') then raise exception 'suspenso no ranking'; end if;
  if exists (select 1 from public.social_search('ana')) then raise exception 'suspenso na busca'; end if;
  if exists (select 1 from public.social_profile('20000000-0000-4000-8000-00000000000a')) then raise exception 'suspenso no perfil'; end if;
end;
$$;

-- Sem login nada funciona.
select pg_temp.act_as('00000000-0000-0000-0000-000000000000');
select set_config('request.jwt.claim.sub', '', true);
select pg_temp.expect_error($$select * from public.social_leaderboard()$$, 'authentication-required');
select pg_temp.expect_error($$select * from public.social_my_profile()$$, 'authentication-required');
select pg_temp.expect_error($$select * from public.social_search('ana')$$, 'authentication-required');

-- Apagar a conta apaga tudo do social.
reset role;
delete from auth.users where id = '20000000-0000-4000-8000-00000000000b';
do $$
begin
  if exists (select 1 from public.social_profiles where user_id = '20000000-0000-4000-8000-00000000000b')
     or exists (select 1 from public.social_follows where follower_id = '20000000-0000-4000-8000-00000000000b')
     or exists (select 1 from public.social_xp_daily where user_id = '20000000-0000-4000-8000-00000000000b') then
    raise exception 'dados sociais ficaram depois de apagar a conta';
  end if;
end;
$$;

rollback;
select 'social_ranking: tudo certo' as resultado;
