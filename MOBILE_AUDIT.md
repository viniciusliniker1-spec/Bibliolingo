# Auditoria Mobile — Bibliolingo

Atualizada em 16 de outubro de 2026.  
Branch: `feature/bibliolingo-mobile-full-parity`.  
Expo SDK preservado: **57**.

## Arquitetura confirmada

- Web: React 19, Vite, TypeScript, HashRouter, IndexedDB e PWA.
- Mobile: React Native 0.86, Expo SDK 57, Expo Router, TypeScript, AsyncStorage e SecureStore.
- Conteúdo compartilhado: `src/content/` é a fonte única para Bíblia, jornada canônica, Grego, Formação e Aprofundar.
- Regras compartilhadas: `src/domain/`, `src/config/` e `src/sync/`.
- Backend de IA: Cloudflare Worker existente, Gemini Flash principal e Groq como fallback; nenhuma chave de modelo entra no Mobile.
- Conta/sync: Supabase Auth/Postgres/RLS com fila offline idempotente para os eventos validados de progresso.
- Mobile nativo: componentes, navegação, cache, compartilhamento, notificações e armazenamento vivem em `mobile/`; a Web não foi reconstruída.

## Inventário funcional da Web

A auditoria confirmou:

- 66 livros, 1.189 capítulos, 266 unidades, 1.067 lições e 266 checkpoints;
- múltipla escolha, completar frase e organizar blocos;
- leitor Almeida 1819/Bíblia Livre e texto grego do Novo Testamento;
- Grego Bíblico com 8 unidades, 32 lições e 8 checkpoints;
- léxico completo com mais de 5.408 entradas;
- Formação Pastoral com 6 matérias, 58 lições, provas e simulado;
- percurso Aprofundar;
- Noah contextual, revisão espaçada, XP, níveis, streak, corações, conquistas, atividade, backup, notificações e conta.

A matriz executável e o estado de cada área estão em [MOBILE_PARITY_MATRIX.md](./MOBILE_PARITY_MATRIX.md).

## Estrutura Mobile

```text
mobile/
├── app/          rotas Expo Router
├── components/   UI e player nativos
├── domain/       adaptação das regras e catálogo unificado
├── providers/    autenticação, progresso e sincronização
├── services/     AsyncStorage, SecureStore, Bíblia, léxico, Noah, backup e notificações
├── theme/        tokens visuais
├── types/        contratos específicos da sessão nativa
├── app.json
├── eas.json
└── package.json
```

Os componentes Web dependentes de DOM/CSS não são importados no React Native. O Mobile reutiliza os dados e regras puras, evitando uma segunda fonte editorial.

## Persistência e integridade

O progresso Mobile é local-first. AsyncStorage conserva sessão de estudo, XP, streak, corações, tentativas, revisão, conquistas, atividade, preferências, notas bíblicas, marcações, última leitura, vocabulário grego e sessão em andamento. SecureStore conserva a sessão de autenticação. O backup utiliza o mesmo schema validado da Web.

O backend continua responsável por validar recompensas sincronizadas. Eventos possuem ID único e o servidor rejeita duplicação. A conclusão local também é idempotente. O modo Livro individual persiste separadamente e não concede desbloqueio indevido na jornada canônica.

## Segurança

- Apenas URL e chave publicável do Supabase podem usar prefixo `EXPO_PUBLIC_`.
- `service_role`, chaves Gemini/Groq e segredos OAuth nunca entram no app.
- Noah recebe contexto pedagógico limitado e histórico recente; não altera gabarito ou progresso.
- Formação usa `12345` somente como barreira de interface de sessão, explicitamente sem alegação de segurança.
- Políticas RLS isolam os dados por `auth.uid()`.

## Recursos dependentes de configuração externa

- E-mail/senha exige URL/chave pública do Supabase e migrações aplicadas.
- Google e Facebook permanecem ocultos até configuração e teste reais de OAuth.
- Noah exige o Worker publicado e seus segredos configurados.
- Notificações remotas não são alegadas; lembretes locais usam Expo Notifications.
- Testes físicos de Android/iOS, permissões, TalkBack, teclado, segundo plano e links OAuth não podem ser substituídos pela CI.

## Preservação

A aplicação Web, a lógica editorial e o SDK 57 foram preservados. A implementação ocorre em branch e PR próprios, sem merge automático em `main`.
