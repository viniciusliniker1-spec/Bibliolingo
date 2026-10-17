# Matriz de paridade funcional — Bibliolingo Mobile

Atualizada em 17 de outubro de 2026.  
Branch: `feature/bibliolingo-mobile-full-parity`.  
Base preservada: Expo SDK 57.  
Fonte da verdade: Web em `src/`, dados em `public/`, Worker em `worker/` e backend em `supabase/`.

Legenda:

- **Implementado**: código funcional conectado a conteúdo/estado real.
- **CI**: coberto por testes, TypeScript e/ou export Android automatizados.
- **Físico/externo**: exige aparelho, credencial ou serviço configurado; não é alegado como validado.

## Paridade por área

| Área | Origem Web | Implementação Mobile | Estado |
|---|---|---|---|
| Jornada canônica | catálogo + `unlocks.ts` | mapa nativo, 66 livros, bloqueios e próximo passo | Implementado + CI |
| Livro individual | AppContext/modo de estudo | alternância explícita, sequência interna e sessão persistida | Implementado + CI |
| Catálogo | `src/content/catalog.ts` | importação direta, sem cópia editorial | 66 livros/1.189 capítulos/266 unidades/1.067 lições/266 checkpoints |
| Engine | players Web | `MobileActivityPlayer` único | Implementado + CI |
| Exercícios | `ExerciseView` | múltipla escolha, completar e blocos ordenáveis | Implementado + CI |
| Checkpoints | domínio/catálogos | aprovação por percurso, repetição e resultado | Implementado + CI |
| Referências | preview/leitor Web | links abrem o leitor nativo e o Back retorna ao passo | Implementado + CI |
| Resultados | players Web | acertos, erros, XP, precisão e próxima atividade por percurso | Implementado + CI |
| Bíblia | `Bible.tsx` + serviços | leitor nativo, 66 livros, busca e navegação | Implementado + CI |
| Notas/marcações | estado Web | estado Mobile unificado, backup e persistência | Implementado + CI |
| Compartilhamento | Web Share/clipboard | Share e Clipboard nativos | Implementado; físico pendente |
| Grego NT | `greekNewTestament.ts` | palavras, Strong e entrada do dicionário | Implementado + CI |
| Grego Bíblico | catálogo/players | 8 unidades, 32 lições e 8 checkpoints | Implementado + CI |
| Dicionário | léxico/search | catálogo integral, busca, cache, detalhes e vocabulário | Implementado + CI |
| Formação | catálogo/players | 6 matérias, 58 lições, provas e simulado; gate 12345 | Implementado + CI |
| Aprofundar | catálogo/players | hub, estudos, exercícios e checkpoint existentes | Implementado + CI |
| Noah | Worker + Noah Web | modal, sessão, contexto, pistas, erro, histórico e limite diário | Implementado + CI; backend real externo |
| Revisão | `review.ts` | fila espaçada, prioridades, sessão e Noah | Implementado + CI |
| XP/nível | domínio compartilhado | regras compartilhadas e conclusão idempotente | Implementado + CI |
| Streak | `streak.ts` | calendário civil local e atividade diária | Implementado + CI |
| Corações | regras Web | perda prevista e recuperação em revisão | Implementado + CI |
| Conquistas | `achievements.ts` | catálogo e avaliação sobre progresso real | Implementado + CI |
| Perfil | `Profile.tsx` | metas, nível, estatísticas, calendário e preferências | Implementado + CI |
| Conta | Supabase Auth | cadastro, login, recuperação, perfil, senha, logout e exclusão | Implementado; Supabase real externo |
| Sessão | Web/local | SecureStore e entrada login/cadastro/visitante | Implementado + CI |
| Sync principal | `src/sync` + Supabase | fila offline idempotente, XP, lições, checkpoints, respostas, conquistas e sessão | Implementado + CI; validação Web↔Mobile externa |
| Migração local | sync engine | detecção e mesclagem explícita, sem apagar local | Implementado + CI |
| Backup | schema Web | exportação/seleção/restauração nativas com validação | Implementado + CI; físico pendente |
| Notificações | política compartilhada | lembretes locais, categorias, horário silencioso e deduplicação | Implementado + CI; entrega física pendente |
| Offline | persistência/cache | lições e progresso locais; Bíblia/léxico após primeiro cache; fila posterior | Implementado + CI |
| EAS | — | perfis APK interno e AAB de produção | Configurado; build remoto não executado |
| Google/Facebook | OAuth oficial | flags e contratos preservados; botões ocultos | Configuração e teste externos pendentes |
| iOS | arquitetura Expo | bundle/configuração compatíveis em código | aparelho/build iOS não validados |

## Rotas Mobile

- `/`: autenticação ou visitante;
- `/(tabs)`: Jornada;
- `/(tabs)/bible`: Bíblia;
- `/(tabs)/study`: Estudar;
- `/(tabs)/achievements`: Conquistas;
- `/(tabs)/profile`: Perfil/Conta;
- `/(tabs)/review`: Revisar;
- `/book/[bookId]`: livro e modos de estudo;
- `/lesson/[activityId]`: jornada bíblica;
- `/activity/[kind]/[activityId]`: Grego, Formação e Aprofundar;
- `/greek`, `/greek/dictionary`, `/formation`, `/deepen`;
- `/result` e `/notification-settings`.

A rota demonstrativa isolada da Fase 4 foi removida da entrega de produção.

## Evidências automatizadas

Commit-base validado: `b4e760ae2c221ad086d4c1fa4af13afbd3226f69`.

- Web CI #258: auditoria passou; 123/123 testes; build Vite passou.
- Mobile Expo CI #115: Expo install check; Expo Doctor 21/21; 11/11 testes; TypeScript; export Android.
- Bundle Android Hermes: 5,5 MB e 1.846 módulos.

Commits documentais posteriores não alteram a aplicação; o head final deve repetir os dois workflows antes de revisão.

## Limites que não podem ser convertidos em “testado” pela CI

- UX completa em aparelho, teclado, safe areas, TalkBack e encerramento pelo Android;
- notificações sob políticas reais de bateria;
- OAuth Google/Facebook;
- sincronização real entre dois dispositivos;
- respostas reais do Worker quando indisponível/configuração ausente;
- instalação EAS e iOS.

Esses itens possuem código ou configuração, mas só mudarão para “validados” após evidência real.
