# Missões pedagógicas — Fase 3.4

## Auditoria e dependências
Web usa React/Vite/TypeScript/IndexedDB; Mobile usa React Native/Expo Router/AsyncStorage/SecureStore. Autenticação e sincronização usam Supabase Auth, PostgreSQL, fila offline UUID e RLS. As Fases 3.1, 3.2 e 3.3 possuem código, testes e migrations, mas a aplicação no projeto Supabase externo deve ser confirmada operacionalmente. A migration 3.3 foi corrigida nesta entrega porque continha um bloco SQL duplicado e interrompido.

## Arquitetura
`src/domain/missions.ts` é o núcleo determinístico compartilhado. Uma missão é um snapshot versionado e imutável. Seu progresso é uma projeção dos eventos reais: tentativas, atividade diária, checkpoints, revisões e conclusões de etapas de planos. A conclusão/expiração é append-only e idempotente; nunca concede XP nem altera memória, domínio, gabaritos ou planos.

Regras:
- até duas missões diárias básicas, uma semanal, uma de reforço vencido e uma temática quando uma recomendação aponta para atividade existente;
- metas são reduzidas conforme o tempo diário declarado;
- mesma questão conta uma vez por dia na missão de prática; sessões de revisão distintas contam por ID de tentativa;
- missões impossíveis não são criadas;
- expiração preserva progresso e não pune;
- períodos usam datas civis locais e semana iniciada na segunda;
- o servidor associa o usuário autenticado e RLS permite somente leitura própria.

## Integrações
Revisão espaçada fornece apenas itens já vencidos e seus intervalos não são alterados. O motor adaptativo pode fornecer uma atividade temática real, sem atualizar domínio pela missão. Planos e metas compartilham a mesma evidência de aprendizagem, sem duplicá-la. O Professor Noah continua contextual e opcional; não é chamado automaticamente e não participa da geração/conclusão.

## Fase 4
Os contratos `mission_started`, `mission_progressed`, `mission_completed` e `mission_expired` estão preparados para consumidores futuros. Não foram implementadas mascote, baús, moedas, animações, ofensivas, notificações ou recompensas econômicas.

## Operação
Aplicar migrations na ordem 202610180001, 002, 003 e 004. Testar com duas contas e dois dispositivos, incluindo offline, reinstalação, virada de dia/semana e negação RLS entre usuários. Nenhuma tarefa agendada é necessária: geração e reconciliação são incrementais ao abrir a área, com IDs determinísticos; o banco armazena somente novos eventos.
