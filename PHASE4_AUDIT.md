# Auditoria da Fase 4 — Bibliolingo

Data: 2026-10-16  
Branch: `feature/bibliolingo-phase-4`

## Arquitetura preservada

- Web: React 19, TypeScript, Vite, React Router com `HashRouter`, IndexedDB e PWA.
- Mobile: React Native, Expo SDK 57, Expo Router, TypeScript, AsyncStorage e SecureStore.
- Backend de IA: Cloudflare Worker; Gemini principal e Groq como contingência.
- Conta e sincronização: Supabase Auth + Postgres/RLS, eventos idempotentes e progresso local offline.
- Conteúdo: catálogo compartilhado em `src/content`; as 66 rotas e os conteúdos editoriais não serão recriados.
- Gamificação: regras centrais em `src/config/gamification.ts` e `src/domain/*`.

## Recursos já existentes e reutilizados

### Professor Noah

A Web já cria um perfil pedagógico limitado às 40 tentativas recentes, agrega erros por conceito e envia esse resumo no contexto autorizado da questão. O Worker valida e limita esse campo. O Android já envia questão, alternativas, resposta corrigida e contexto da lição, sem chave privada no aplicativo.

Evolução planejada: compartilhar um resumo estruturado de dificuldades, incluir recomendações de revisão e adicionar esse contexto também no mobile. A IA continuará sem poder alterar gabarito, XP ou progresso.

### Revisão inteligente

A Web já possui:

- itens de revisão por questão e conceito;
- intervalos de 0, 1, 3, 7, 14 e 30 dias;
- prioridade por atraso, recorrência e último erro;
- sessão rápida, estatísticas e explicação do motivo;
- XP e recuperação de coração pelas regras atuais.

Lacuna: o mobile guarda somente IDs incorretos. Será adicionada uma fila compatível com os mesmos intervalos, usando exclusivamente exercícios existentes.

### Notificações

A Web possui lembrete diário interno e integração opcional com Notification API/calendário. O mobile não possui serviço de notificação.

O SDK 57 lista oficialmente `expo-notifications ~57.0.23`. A primeira implementação terá preferências por categoria, horário de silêncio, decisões sem duplicação e links internos. Notificações locais do Android serão separadas de push remoto; push remoto continuará fora de escopo até existir infraestrutura e teste físico.

### Gamificação

Já existem XP, níveis, streak, metas diárias, conquistas, checkpoints e recompensas por revisão. A Fase 4 acrescentará meta semanal e desafios derivados do progresso, sem criar uma segunda carteira de XP.

### Sincronização

O servidor valida eventos com IDs únicos. XP remoto deriva de eventos aceitos. Lições, checkpoints, conquistas, respostas e sessão ativa já sincronizam. A fila de revisão será reconstruída com o histórico de respostas autorizado, evitando uma fonte paralela de verdade.

## Decisões de implementação

1. Nenhuma mudança nos 66 livros, gabaritos ou rotas existentes.
2. Nenhuma atualização do Expo SDK.
3. Novas telas visuais ficarão em uma prévia isolada antes de qualquer substituição.
4. Preferências de notificação serão locais e privadas.
5. Comunidade nesta fase será somente contrato de dados e demonstração sem publicação de dados pessoais.
6. Recursos indisponíveis não receberão botões apresentados como funcionais.
7. A `main` não será alterada nesta fase; a entrega será feita em Pull Request.
