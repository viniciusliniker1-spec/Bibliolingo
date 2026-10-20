# Metas personalizadas e planos de estudo — Fase 3.3

## Auditoria

- Web: React 19, TypeScript, Vite, React Router e IndexedDB.
- Mobile: React Native 0.86, Expo SDK 57, Expo Router, AsyncStorage e SecureStore.
- Conta e sincronização: Supabase Auth, eventos UUID idempotentes, fila offline e RLS.
- Bíblia: um único leitor compartilhando o catálogo de 66 livros por OSIS. Tradução disponível: Almeida 1819, domínio público, fonte versionada. Destaques, notas e última localização já existiam e foram preservados.
- Conteúdo educacional: jornada bíblica, formação pastoral, grego, aprofundamento e revisão.
- Metas anteriores: XP diário configurável, meta semanal derivada e calendário retrospectivo de 28 dias; não havia metas por métrica nem planos.
- Fases 3.1/3.2: código, testes e migrações existem. Revisões e recomendações são consumidas sem algoritmos concorrentes.
- Professor Noah: tutor contextual Gemini/Groq com fallback e limites. Não existia contrato estruturado e validado para criação de planos; por segurança, nenhuma resposta livre de IA é salva como plano.

## Arquitetura

A regra de negócio compartilhada está em `src/domain/studyPlans.ts`.

Entidades:

- `PersonalGoal`: métrica, periodicidade, alvo e estado;
- `StudyPlanDefinition`: catálogo versionado e publicável;
- `StudyPlanStep`: leitura ou atividade real;
- `PlanEnrollment`: inscrição com snapshot imutável das etapas;
- `PlanCompletionEvent`: conclusão/desmarcação explícita;
- `PlanChangeEvent`: pausa, retomada, arquivo, reorganização e conclusão;
- `ScheduledPlanStep`: projeção calculada do calendário.

Valores derivados, como percentual e próxima atividade, não são duplicados no banco.

## Catálogo publicado

Planos de leitura com cobertura validada por testes:

- Bíblia completa em 365 dias, ordem canônica;
- Novo Testamento em 90 dias;
- Evangelhos em 30 dias;
- Salmos em 30 dias;
- Provérbios em 31 dias.

Planos educacionais são construídos somente a partir das atividades reais do catálogo:

- jornada bíblica guiada;
- formação pastoral;
- grego bíblico;
- aprofundamento teológico.

O plano cronológico não foi publicado, pois o repositório não contém uma sequência editorial fundamentada e aprovada. Nenhuma cronologia foi inventada.

## Planos personalizados

Web e Mobile permitem criar plano de qualquer livro bíblico existente, informando duração. Os capítulos são distribuídos pelo período escolhido; dias sem leitura são mantidos quando o prazo é maior que o número de capítulos. Não são criadas atividades artificiais.

A estrutura aceita novos modelos sem reconstruir as interfaces.

## Calendário

Datas são chaves civis locais `AAAA-MM-DD`, convertidas ao meio-dia local para evitar deslocamento por UTC ou horário de verão. O agendador considera:

- dias da semana escolhidos;
- virada de mês e ano;
- ano bissexto;
- plano iniciado no meio do mês;
- múltiplos planos simultâneos;
- substituições de agenda somente para etapas pendentes.

O calendário apresenta quantidade de atividades e também revisões da Fase 3.1. Atrasos não reduzem XP, sequência ou progresso.

## Reorganização

O aluno pode:

- manter o calendário sem alteração;
- distribuir pendências a partir de amanhã;
- retomar a partir de hoje;
- reduzir a intensidade semanal.

A reorganização exige ação explícita, incrementa a revisão da agenda e registra histórico. Conclusões e datas de conclusão não são apagadas.

## Leitor bíblico

Uma etapa de leitura abre o leitor existente no livro e capítulo corretos, preserva Almeida 1819, notas, marcações e navegação, e oferece “Voltar ao plano”.

Abrir um capítulo não conclui a etapa. A conclusão exige o botão “Concluir” e pode ser desmarcada. A mesma passagem em planos diferentes mantém conclusões independentes, permitindo releitura.

## Metas

Métricas disponíveis:

- minutos efetivos;
- lições;
- revisões;
- checkpoints;
- capítulos confirmados;
- conceitos praticados;
- unidades/checkpoints.

Metas podem ser diárias ou semanais. Minutos usam somente os segundos de atividade já registrados, nunca tempo de aplicativo aberto. O progresso é calculado de dados reais.

## Fases 3.1 e 3.2

- revisões vencidas aparecem como opção transparente, sem alterar intervalos;
- uma sugestão adaptativa pode ser aceita ou adiada;
- aceitar reforço não substitui nem conclui etapa obrigatória;
- ignorar não penaliza o aluno;
- o sistema funciona sem Gemini, Groq ou Professor Noah.

## Persistência, conflito e privacidade

A migração `202610180003_study_plans.sql` cria um log append-only de eventos:

- chave UUID única para idempotência;
- vínculo obrigatório ao usuário autenticado;
- RLS de leitura pelo próprio usuário;
- RPC `security definer` com validação de tipo, identificador, tamanho e campos críticos;
- índice por usuário e sequência.

Metas e inscrições usam a versão mais recente por `updatedAt`; eventos de conclusão e mudança são unidos por ID. Estados antigos não sobrescrevem atualizações mais recentes.

O cliente mantém fila offline e sincroniza quando a conexão retorna. A consulta remota é limitada a 5.000 eventos por sincronização.

## Testes

A suíte cobre:

- cobertura, duplicações e omissões dos planos publicados;
- plano personalizado e conteúdo inexistente;
- snapshot/versionamento;
- data inválida, virada de mês e ano bissexto;
- dias de estudo;
- duração personalizada;
- concluir e desmarcar;
- múltiplos planos;
- pausar, retomar e arquivar;
- reorganizar sem apagar conclusões;
- releitura independente;
- metas diárias/semanais com dados reais;
- leitura confirmada versus capítulo apenas aberto;
- regressões Web, Mobile, autenticação, revisão e motor adaptativo.

## Configuração

Aplicar no Supabase, nesta ordem:

1. migração base de progresso;
2. `202610180001_spaced_repetition.sql`;
3. `202610180002_adaptive_learning.sql`;
4. `202610180003_study_plans.sql`.

Depois validar duas contas e dois dispositivos, incluindo modo offline, reinstalação e tentativa de acesso cruzado.

## Limitações reais

- apenas Almeida 1819 está legalmente disponível no aplicativo;
- cronologia bíblica aguarda validação editorial;
- propostas livres do Professor Noah não são convertidas automaticamente em planos;
- a aplicação das migrações e testes físicos no Supabase real dependem do ambiente externo;
- calendários externos não fazem parte desta fase.
