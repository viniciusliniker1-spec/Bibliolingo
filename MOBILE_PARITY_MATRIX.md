# Matriz de paridade funcional — Bibliolingo Mobile

Data da auditoria inicial: 2026-10-16  
Branch de execução: `feature/bibliolingo-mobile-full-parity`  
Base: `feature/bibliolingo-phase-4@a0b3aa9` (inclui `main@556dfd4`)

## Critérios

- **Web é a fonte da verdade** para conteúdo, regras e comportamento.
- **Compartilhado** significa reutilização direta de módulos TypeScript em `src/`, não cópia.
- **Implementado** só será marcado após código, teste automatizado e export Android.
- **Validado no aparelho** só será marcado após teste físico informado pelo proprietário.
- Expo permanece em **SDK 57**.
- Nenhuma alteração editorial, de gabarito ou de regra de recompensa faz parte desta iniciativa.

## Auditoria da arquitetura

| Área | Implementação encontrada |
|---|---|
| Web | React 19, Vite, TypeScript, HashRouter, IndexedDB/PWA |
| Mobile | React Native, Expo SDK 57, Expo Router, TypeScript, AsyncStorage/SecureStore |
| Conteúdo | Catálogos compartilhados em `src/content`: canônico, Grego, Formação e Aprofundar |
| Regras | `src/domain`, `src/config` e `src/sync` concentram progressão, XP, streak, revisão e sync |
| Conta | Supabase Auth/Postgres/RLS; e-mail/senha funcional, OAuth dependente de configuração externa |
| IA | Cloudflare Worker; Gemini principal e Groq fallback; clientes Web/Mobile não recebem chaves |
| Bíblia | Almeida 1819 carregada por livro; marcações/notas na Web; texto grego NT por livro |
| Léxico | 5.408 entradas Dodson/STEP + verbetes enriquecidos; carregamento sob demanda |
| Persistência | Web: schema versionado no IndexedDB. Mobile: schema reduzido no AsyncStorage |
| Fase 4 | PR #42 adiciona revisão Mobile, política de notificações, notificações locais e Noah pedagógico |

## Rotas e navegação

| Funcionalidade | Origem Web | Mobile inicial | Estratégia / dependências | Aceitação | Situação final |
|---|---|---|---|---|---|
| Jornada | `Home.tsx`, `catalog.ts` | Parcial | Completar mapa, modos canônico/avulso e retomada | Mesmo próximo passo e bloqueios | Em execução |
| Bíblia | `Bible.tsx` | Ausente | Rota/tab nativa + serviços compartilhados/adaptador de cache | 66 livros e 1.189 capítulos navegáveis | Pendente |
| Estudar | `Study.tsx` | Revisar apenas | Hub nativo de percursos e revisão | Todos os cards abrem conteúdo real | Pendente |
| Conquistas | `Achievements.tsx` | Ausente | Reusar `ACHIEVEMENTS` e estado unificado | Estado ganho/bloqueado idêntico | Pendente |
| Perfil | `Profile.tsx` | Parcial | Ampliar configurações, métricas, backup e calendário | Todas as preferências persistem | Pendente |
| Conta | `Account.tsx` | Parcial | Completar perfil, recuperação, exclusão e migração | Fluxos reais Supabase | Pendente |
| Formação | `FormationHub/Player` | Ausente | Rotas nativas, gate de sessão e engine compartilhada | 6 matérias/58 lições/provas/simulado | Pendente |
| Grego | `GreekHub/Player` | Ausente | Rotas e player sobre catálogo compartilhado | 8 unidades/32 lições/8 checkpoints | Pendente |
| Dicionário | `GreekDictionary.tsx` | Ausente | Busca nativa e cache lexical | Catálogo integral e todas as buscas | Pendente |
| Aprofundar | `DeepenHub/Player` | Ausente | Hub/player nativo com conteúdo existente | Percurso e checkpoints funcionais | Pendente |
| Lição canônica | `LessonPlayer.tsx` | Parcial | Completar todos os comportamentos da engine | Retomada, feedback, resultado e referências | Pendente |
| Resultados | players Web | Parcial | Resultado por modo e próxima atividade correta | Sem XP duplicado | Pendente |
| Notificações | `NotificationSettings.tsx` | Implementada na base | Manter serviço local e validar integração final | Permissão, agenda e deep link | Automatizado; físico pendente |

## Jornada, lições e gamificação

| Funcionalidade | Origem Web | Mobile inicial | Estratégia | Aceitação | Situação final |
|---|---|---|---|---|---|
| 66 livros/266 unidades/1.067 lições/266 checkpoints | `src/content/catalog.ts` | Catálogo importado; UI parcial | Reuso direto | Contagens e IDs por teste | Pendente |
| Modo canônico | `unlocks.ts`, AppContext | Parcial | Estado Mobile compatível | Sem desbloqueio indevido | Pendente |
| Livro individual | AppContext/Home | Ausente | Persistir `journeyMode/bookId` | Retomada dentro do livro | Pendente |
| Introdução/objetivos/fontes/tempo/XP | players Web | Parcial | Componentes nativos comuns | Metadados visíveis em cada atividade | Pendente |
| Múltipla escolha | `ExerciseView.tsx` | Implementada | Consolidar player comum | Correção determinística | Pendente |
| Completar frase | `ExerciseView.tsx` | Implementada parcialmente | Player comum | Resposta completa e feedback | Pendente |
| Organizar blocos | `ExerciseView.tsx` | Implementada parcialmente | Player comum | Ordem e desfazer funcionais | Pendente |
| Checkpoints | `checkpoint.ts` | Parcial | Critérios por catálogo | Aprovação e repetição corretas | Pendente |
| Explicação por alternativa | contratos/ExerciseView | Parcial | Renderizar quando disponível | Feedback editorial exato | Pendente |
| XP | `gamification.ts` | Parcial | Eliminar engine paralela; eventos idempotentes | Valores iguais à Web | Pendente |
| Níveis | `domain/gamification.ts` | Implementado visualmente | Reuso direto | Mesmo nível/progresso | Pendente |
| Streak | `streak.ts` | Parcial | Registrar atividade e fuso local | Mesmo calendário civil | Pendente |
| Corações/recuperação | AppContext/config | Ausente | Estado unificado e revisão | Mesmas exceções por percurso | Pendente |
| Conquistas/medalhas | `achievements.ts` | Ausente | Avaliação compartilhada | Sem duplicação | Pendente |
| Atividade/28 dias | Profile/AppState | Ausente | Persistir agregado diário | Calendário e métricas reais | Pendente |
| Som/vibração | feedbackSound/haptics | Ausente | APIs Expo compatíveis ou fallback | Preferências respeitadas | Pendente |

## Bíblia e idiomas originais

| Funcionalidade | Origem Web | Mobile inicial | Estratégia | Aceitação | Situação final |
|---|---|---|---|---|---|
| Catálogo bíblico | `content/bible/catalog.ts` | Não exposto | Reuso direto | 66 livros/1.189 capítulos | Pendente |
| Texto Almeida 1819 | `services/bible.ts` | Ausente | Adapter RN fetch + cache versionado | Livro integral, fonte identificada | Pendente |
| Navegação capítulo | `Bible.tsx` | Ausente | Rota parametrizada | anterior/próximo/seletores | Pendente |
| Busca por referência | `bibleReference.ts` | Ausente | Reuso parser | referências válidas e erros claros | Pendente |
| Selecionar/copiar/compartilhar | `Bible.tsx` | Ausente | Clipboard/Share nativos compatíveis Expo Go | texto + referência | Pendente |
| Marcações/notas | AppState/Bible | Ausente | Estado Mobile + sync quando suportado | persiste reinício | Pendente |
| Última leitura | AppState | Ausente | Estado versionado | reabre posição | Pendente |
| Prévia contextual | `BibleReferencePreview.tsx` | Ausente | Modal nativo e retorno parametrizado | volta ao passo exato | Pendente |
| Texto grego NT | `greekNewTestament.ts` | Ausente | Parser compartilhado + cache | palavras/Strong/morfologia | Pendente |
| Dicionário integral | `completeLexicon.ts`, `search.ts` | Ausente | Adapter de carregamento/cache | 5.408 entradas + enriquecidos | Pendente |
| Vocabulário aprendido | AppState Greek | Ausente | Estado Mobile/sync | lexemas persistidos | Pendente |

## Percursos especiais

| Funcionalidade | Origem Web | Mobile inicial | Estratégia | Aceitação | Situação final |
|---|---|---|---|---|---|
| Grego: hub/progresso | `GreekHub.tsx` | Ausente | Player genérico + catálogo | indicadores iguais à Web | Pendente |
| Grego: lições/checkpoints | `GreekPlayer.tsx` | Ausente | Engine comum por modo | 32/8 íntegros | Pendente |
| Formação: senha de sessão | `FormationAccessGate.tsx` | Ausente | Memória de sessão; aviso de segurança | código atual, sem falsa segurança | Pendente |
| Formação: matérias/lições | catálogo + Hub/Player | Ausente | Engine comum | 6/58/174 íntegros | Pendente |
| Formação: provas/simulado | catálogo + Player | Ausente | aprovação 80%, repetição | 6 provas + 30 questões finais | Pendente |
| Aprofundar | catálogo + Hub/Player | Ausente | Engine comum, nível avançado | somente conteúdo existente | Pendente |

## Noah, revisão, conta e dados

| Funcionalidade | Origem Web | Mobile inicial | Estratégia | Aceitação | Situação final |
|---|---|---|---|---|---|
| Modal Noah | `NoahTutor.tsx` | Implementado | Manter `ProfessorNoahModal` e ampliar áreas | Histórico de sessão e erros | Pendente |
| Pista antes da correção | Noah/Lesson | Implementado canônico | Integrar em todos os players | não revela gabarito | Pendente |
| Explicar erro | Noah/Lesson | Implementado canônico | Contexto comum de exercício | resposta selecionada/correta completas | Pendente |
| Contexto pedagógico | `noahLearning.ts` | Parcial | Reuso de perfil e revisão | sem PII e sem progresso mutável | Pendente |
| Worker Gemini/Groq | `worker/src` | Reutilizado | Nenhuma segunda infraestrutura | fallback e indisponibilidade | Pendente |
| Revisão espaçada | `review.ts`, Study | Implementada na base | Completar modos e métricas | offline, prioridades iguais | Pendente |
| Domínio por conceito | `mastery.ts` | Ausente | Estado de tentativas completo | mesmos cálculos | Pendente |
| Visitante | Auth Web/Mobile | Implementado | Preservar dados locais | uso completo offline | Pendente |
| E-mail/senha | Supabase Auth | Implementado | Validar telas/erros/sessão | cadastro/login reais configurados | Pendente |
| Recuperação/exclusão | Account/Auth services | Parcial | Completar UI Mobile | fluxo real | Pendente |
| Google/Facebook | Supabase/OAuth | Não configurado | Código e documentação; ocultar até configurado | teste real obrigatório | Dependência externa |
| Sync offline-first | `src/sync` | Parcial | Ampliar projeção e eventos | XP, progresso e sessão idempotentes | Pendente |
| Migração local | sync engine | Parcial | escolha mesclar/importar | nunca apaga sem confirmação | Pendente |
| Isolamento/RLS | migration Supabase | Implementado backend | testes de schema/smoke | usuário não lê outro | Pendente |
| Backup/exportação | `storage/backup.ts` | Ausente | Document picker/share + schema comum | round-trip validado | Pendente |
| Migração de schema | `migrations.ts` | Mobile reduzido | estado nativo versionado | estados antigos preservados | Pendente |
| Offline | PWA/cache | Parcial Mobile | cache RN por recurso e fila sync | estudo sem conexão | Pendente |

## Testes obrigatórios

| Suite | Origem/novo teste | Critério | Situação final |
|---|---|---|---|
| Integridade de catálogo | testes `src/content` | todas as contagens e referências | Pendente |
| Navegação nativa | novos testes | todas as rotas montam | Pendente |
| Engine por formato | compartilhado + Mobile | respostas e feedback | Pendente |
| Idempotência | progress/sync | sem XP/conclusão duplicados | Pendente |
| Bíblia | parser/cache/notas | leitura, busca e persistência | Pendente |
| Grego/dicionário | catálogos/search/cache | conteúdo integral | Pendente |
| Formação/Aprofundar | catálogos/players | aprovação e progresso | Pendente |
| Noah | domínio/cliente | contexto, offline e indisponibilidade | Pendente |
| Backup/migração | schema | round-trip/corrupção | Pendente |
| Web regressão | CI Web | testes e build | Pendente |
| Expo 57 | Mobile CI | doctor, TS, testes, export Android | Pendente |
| Android físico | roteiro final | todos os fluxos críticos | Depende do proprietário |

## Inventário inicial

- Rotas funcionais Web auditadas: **13** (incluindo players parametrizados).
- Arquivos do head de base: **255**.
- Módulos TypeScript/JSON de aplicação auditados por estrutura/importações: **138**.
- Rotas Mobile funcionais na base: **10**, sendo duas de Fase 4 e uma prévia isolada.
- Lacunas funcionais principais confirmadas: Bíblia, Conquistas, Grego, Dicionário, Formação, Aprofundar, backup e estado de gamificação completo.
- A coluna **Situação final** será atualizada em cada lote e não será convertida em “concluída” apenas por existir uma tela.
