# Ranking social: como ativar e administrar

O ranking semanal, os amigos e os perfis de alunos dependem de uma migration no Supabase.
**Enquanto ela não for aplicada, o app esconde o ranking** (a tela mostra "Ranking chegando em breve").

## 1. Ativar no Supabase

1. Abra o projeto no Supabase › **SQL Editor**.
2. Cole e execute o arquivo `supabase/migrations/202611080001_social_ranking.sql`.
   (Ou, com a CLI: `supabase db push`.)
3. Pronto. Não é preciso gerar outro APK: o app já está preparado e passa a mostrar o ranking.

Pré-requisito: as migrations anteriores (`202610160001_auth_sync.sql` até `202610280002_*`) já aplicadas.

## 2. Como funciona

- **Participar é opcional.** O aluno escolhe um `@usuário` (3 a 20 letras minúsculas, números ou `_`) e entra.
  Pode sair quando quiser (continua com a conta, só some do ranking).
- **Semana:** segunda a domingo, horário de Brasília (UTC-3). O ranking "zera" na segunda às 00:00.
- **XP da semana:** soma do XP que o servidor já registra a cada lição concluída.
  Um gatilho em `user_stats` guarda o XP de cada dia em `social_xp_daily`.
- **Limites contra abuso:** cada dia conta no máximo **2000 XP** no ranking, e aumentos enormes de uma vez
  (importação de histórico antigo) não entram no XP da semana.
- **Amigos:** o aluno segue outros (até 300). O ranking "Amigos" mostra quem ele segue.
- **Avatar:** a Lumi com a skin que o aluno equipou. As fotos de perfil continuam privadas.

> O ranking mede o XP como o app já mede. O XP chega do celular com validações, mas **não é à prova de
> trapaça** para quem alterar o app por conta própria; os limites acima só reduzem o estrago.

## 3. O que os outros alunos veem

A política de privacidade completa já está pronta em `legal/politica-de-privacidade.md` (página web em `public/privacidade.html`), e as respostas sugeridas para o formulário da Play Store estão em `legal/play-store-seguranca-de-dados.md`. Em resumo, os outros alunos veem:

- `@usuário` e primeiro nome
- Skin da Lumi
- XP da semana e total, ofensiva, lições concluídas, recorde de ofensiva e XP dos últimos 7 dias

Não são expostos: e-mail, foto, conversas, localização, nem o progresso detalhado.
Apagar a conta apaga também os dados sociais (`on delete cascade`).

## 4. Moderação

Os `@usuário` são livres (com uma lista curta de nomes reservados, como `admin` e `bibliolingo`).
Alunos podem **denunciar** um perfil (3 motivos). Revise no SQL Editor:

```sql
-- Denúncias recentes, com o @usuário de quem denunciou e de quem foi denunciado
select r.created_at, r.reason, rep.handle as denunciado, who.handle as denunciante
from public.social_reports r
left join public.social_profiles rep on rep.user_id = r.reported_id
left join public.social_profiles who on who.user_id = r.reporter_id
order by r.created_at desc
limit 50;

-- Tirar um aluno do ranking, da busca e dos perfis (ele não consegue desfazer)
update public.social_profiles set suspended = true where handle = 'nome_do_aluno';

-- Reativar
update public.social_profiles set suspended = false where handle = 'nome_do_aluno';
```

Antes de divulgar para muita gente, vale combinar quem vai revisar as denúncias e com que frequência.

## 5. Testes

`supabase/tests/social_ranking.sql` roda no CI (job `lumi-purchase-tests`) com Postgres real e confere:
privacidade (sem acesso direto às tabelas), ranking global e de amigos, semana anterior ignorada,
limite diário, seguir/desseguir, busca, denúncia, suspensão e exclusão de conta.
Para rodar localmente, aplique as migrations numa base de teste (como no CI) e execute o arquivo com `psql`.
