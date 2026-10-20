# Motor de aprendizado adaptativo — Fase 3.2

## Auditoria realizada

- Web: React 19, TypeScript, Vite, React Router e IndexedDB.
- Mobile: React Native 0.86, Expo SDK 57, Expo Router, AsyncStorage e SecureStore.
- Conteúdo: catálogo compartilhado em `src/content`, com Bíblia, jornada canônica, aprofundamento, formação pastoral e grego.
- Exercícios existentes: múltipla escolha, completar por escolhas e blocos de palavras. O motor apenas referencia atividades reais.
- Identidade e sincronização: Supabase Auth, eventos UUID idempotentes, PostgreSQL e RLS por `auth.uid()`.
- Progresso: projeções locais Web/Mobile, eventos remotos, estatísticas, respostas, atividades concluídas e estado ativo.
- Fase 3.1: existe implementação real por conceito, histórico, estado de memória, migração, fila e telas Web/Mobile. A aplicação da migração no projeto Supabase externo precisa ser confirmada pelo responsável pelo ambiente.
- Professor Noah: tutor contextual existente com Gemini/Groq, fallback, limites por instalação/global, controle de tokens e afinidade de provedor. Não foi encontrado cache semântico persistente de respostas.
- Não havia motor adaptativo persistente completo; somente continuação da trilha e fila de revisão.

## Arquitetura

O núcleo é compartilhado e não depende de IA:

- `src/domain/adaptive.ts`: perfil por conceito e recomendações auditáveis.
- `src/domain/adaptiveCatalog.ts`: atividades e conceitos reais das áreas compatíveis.
- `src/domain/prerequisites.ts`: grafo curricular explícito e validação.
- `src/domain/review.ts`: retenção e agenda da Fase 3.1, consumidas sem alteração de responsabilidade.

Fluxo:

1. uma resposta gera evento idempotente;
2. a Fase 3.1 atualiza memória e agenda;
3. o perfil é reconstruído de evidências locais e sincronizadas;
4. o motor classifica estado por conceito;
5. recomenda somente atividades existentes, acessíveis e não concluídas quando apresentadas como novas;
6. Web e Mobile executam a mesma função.

## Índice de domínio

A escala 0–100 é um índice explicável, não uma medida psicométrica nem avaliação de inteligência:

- 40% precisão ponderada;
- 25% retenção estimada pela Fase 3.1;
- 20% variedade de questões;
- 15% espaçamento entre dias;
- resultado multiplicado por confiança, que cresce até quatro oportunidades independentes.

Pesos de dificuldade, modalidade e recência são declarados no código. Tentativas da mesma questão, conceito e dia são consolidadas, evitando inflação imediata. Evidências de checkpoint e revisão valem mais que repetição inicial.

Estados: evidências insuficientes, primeiro contato, aprendizagem inicial, consolidação, domínio demonstrado e revisão necessária. O estado é por área/conceito, nunca um rótulo global do aluno.

Limitações: este índice ainda não foi calibrado em estudo psicométrico; por isso a interface usa linguagem de evidência e não apresenta precisão científica fictícia.

## Recomendações

Prioridade determinística:

1. revisões vencidas/atrasadas;
2. dificuldades recorrentes;
3. pré-requisito curricular explícito;
4. continuação da progressão disponível;
5. aprofundamento compatível com objetivo explícito.

Cada item contém justificativa, destino real e tempo estimado. Recomendações ignoradas deixam de aparecer; itens abertos recentemente perdem prioridade para evitar repetição. Ignorar não bloqueia, penaliza ou muda a trilha.

Conteúdo ausente, inacessível ou removido não vira recomendação executável. A indisponibilidade de Gemini, Groq ou Professor Noah não interrompe o motor.

## Pré-requisitos

Somente dependências explícitas da sequência publicada de grego foram cadastradas. O grafo:

- não muda desbloqueios oficiais;
- não inventa relações doutrinárias;
- valida ciclos, autorreferências e IDs inexistentes;
- serve apenas como orientação da próxima atividade.

Outras áreas deverão receber relações apenas quando houver metadados curriculares aprovados.

## Professor Noah

Os fluxos existentes de lição/revisão continuam oferecendo ajuda contextual após erros. O motor pode encaminhar à atividade de reforço, onde a integração já fornece conceito e questão ao tutor. Conversas não alteram domínio: somente respostas verificáveis geram evidência.

## Persistência e sincronização

A migração `202610180002_adaptive_learning.sql` cria:

- preferências adaptativas por usuário;
- log idempotente de eventos de recomendação;
- RLS de leitura por usuário;
- RPC autenticada para registrar “ignorar” e “abrir”.

O perfil calculado não é duplicado no banco: ele é reconstruído do `review_history`, evitando pontuações obsoletas. Até 1.000 evidências recentes são carregadas; listas de preferências são limitadas a 100 ignoradas e 20 recentes. Eventos pendentes permanecem na fila offline.

A migração deve ser aplicada depois de `202610180001_spaced_repetition.sql`. Sem a migração nova, a experiência local continua funcionando e a leitura de preferências remotas usa fallback; a gravação fica pendente até o backend aceitar a RPC.

## Desempenho e custos

- nenhuma chamada de IA para perfil ou recomendação;
- cálculo linear nas evidências carregadas e no catálogo;
- consultas remotas limitadas;
- nenhuma credencial nova ou serviço pago;
- regras compartilhadas, sem duplicar lógica entre Web e Mobile.

## Validação

Testes adicionados cobrem: ausência/poucas evidências, domínio demonstrado, dificuldades por disciplina, revisão vencida/futura, equivalência por conceito, conceitos distintos, duplicidade/tentativas na mesma sessão, pré-requisitos, conteúdo removido, recomendação ignorada/recente e integração com retenção da Fase 3.1. O grafo possui testes de ciclo, autorreferência e referência inexistente.

Também devem permanecer verdes os testes anteriores de revisão, sincronização, RLS estático, catálogo e regressão das trilhas.

## Configuração e verificação externa

1. aplicar as migrações Supabase na ordem;
2. executar `npm test` e `npm run build`;
3. em `mobile`, executar o typecheck/build Expo usado no CI;
4. testar com duas contas e dois dispositivos;
5. confirmar RLS e recuperação após reinstalação;
6. validar conteúdo e pré-requisitos com responsável pedagógico.

Não foram alterados gabaritos, doutrinas, ordem oficial, conteúdo das lições nem limites do Professor Noah.
