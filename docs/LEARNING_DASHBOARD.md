# Fase 3.5 — Dashboard Inteligente de Aprendizagem

## Auditoria e dependências

A auditoria confirmou implementações reais, não apenas interfaces, para:

- Fase 3.1: memória por conceito, revisão espaçada determinística, persistência e fila de revisão;
- Fase 3.2: perfil adaptativo explicável, catálogo curricular, pré-requisitos e recomendações;
- Fase 3.3: metas, planos versionados, calendário, conclusão explícita e sincronização;
- Fase 3.4: missões determinísticas, eventos idempotentes, RLS e telas Web/Mobile.

Web usa React/Vite/TypeScript e IndexedDB com sincronização Supabase. Mobile usa React Native/Expo Router, armazenamento local e a mesma projeção sincronizada. Supabase Auth identifica usuários e as tabelas pedagógicas possuem isolamento por RLS. O Professor Noah usa os provedores existentes, mas não participa dos cálculos do painel.

## Arquitetura implementada

`src/domain/learningDashboard.ts` é um agregador puro compartilhado por Web e Mobile. Ele lê as fontes autoritativas já existentes e não grava uma segunda cópia de estatísticas.

Fontes:

- conclusões de lições e checkpoints;
- atividade diária efetiva;
- tentativas e revisões;
- estados de memória e perfil adaptativo;
- metas e planos;
- conclusões confirmadas de leitura;
- definições e eventos de missões.

Saídas:

- visão geral;
- revisões vencidas, disponíveis, programadas e concluídas;
- metas atingidas e planos ativos/concluídos;
- missões ativas e concluídas;
- capítulos únicos confirmados;
- tempo efetivo registrado;
- unidades e trilhas bíblicas;
- mapa de domínio por Bíblia, formação pastoral, grego e aprofundamento;
- série diária para 7, 30, 90 dias ou todo o histórico disponível.

A interface Web está em `src/features/dashboard/LearningDashboard.tsx` e a Mobile em `mobile/app/dashboard.tsx`.

## Critérios e limitações dos indicadores

O índice de domínio reutiliza o modelo da Fase 3.2: acurácia ponderada (40%), retenção (25%), variedade (20%) e espaçamento (15%), ajustados pela confiança das evidências. É um índice explicável de 0–100, não uma medida psicométrica. Com poucas oportunidades, a interface mostra **Evidências insuficientes**.

Abrir uma tela não conta como conclusão. Leituras contam apenas após evento confirmado. O total global de capítulos deduplica livro/capítulo mesmo quando o mesmo conteúdo participa de mais de um plano. Missões são deduplicadas pelo identificador e tentativas pelo identificador do evento.

Itens históricos anteriores que não possuem data individual continuam presentes nos totais confiáveis, mas não são distribuídos artificialmente na série temporal.

## Persistência, sincronização e segurança

Não foi necessária nova migração: o dashboard é uma projeção das tabelas e eventos já criados nas Fases 3.1–3.4. Isso preserva contas existentes e evita divergência entre Web e Mobile.

Os dados críticos permanecem vinculados à conta, com filas offline, mesclagem idempotente e RLS. O painel distingue estado sem histórico de falha de sincronização. Nenhum cálculo depende de Gemini ou Groq, não altera XP e não executa chamadas automáticas de IA.

## Integrações

- Recomendações reutilizam o motor adaptativo e abrem atividades reais.
- Revisões abrem a fila existente.
- Metas e planos usam os cálculos da Fase 3.3.
- Missões usam o histórico e estados da Fase 3.4.
- O contexto do Professor Noah continua disponível dentro das atividades abertas pelas recomendações; o painel não cria um segundo tutor nem envia dados automaticamente.
- Foram preservados XP, conquistas, leitor bíblico, trilhas e demais funcionalidades.

## Testes adicionados

`src/domain/learningDashboard.test.ts` cobre:

- primeiro acesso;
- deduplicação de conclusões;
- revisões vencidas, futuras e concluídas;
- evidências insuficientes;
- capítulos confirmados e deduplicados;
- metas, planos e tempo efetivo;
- missões duplicadas;
- períodos de 7, 30, 90 dias e histórico;
- atualização após nova atividade;
- preservação de XP.

A validação final deve incluir os workflows CI, Auth Sync Smoke e Mobile Expo CI. A aplicação das migrações remotas e a sincronização em dois aparelhos físicos continuam dependendo do ambiente Supabase/EAS do proprietário.
