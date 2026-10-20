# Sistema inteligente de revisão espaçada

## Auditoria da base

Data: 18/10/2026.

- Web: React 19, TypeScript, Vite, React Router e PWA local-first.
- Mobile: React Native 0.86, Expo SDK 57, Expo Router, AsyncStorage e SecureStore.
- Identidade: Supabase Auth por HTTP oficial; e-mail/senha e OAuth configurável.
- Persistência local: `AppState` no IndexedDB da Web e `MobileProgress` no AsyncStorage.
- Sincronização: fila offline de eventos UUID, RPC `submit_sync_event`, PostgreSQL e RLS por `auth.uid()`.
- Conteúdo: IDs estáveis de livro, unidade, lição, questão e conceito em `src/content`.
- Exercícios: múltipla escolha, completar frase e ordenar blocos.
- Avaliação: lições, checkpoints, provas de Formação e simulado; checkpoints usam aprovação configurável.
- Desempenho: `QuestionAttempt` registra questão, conceito, atividade, dificuldade, modo, resultado e data.
- Professor Noah: Worker Cloudflare, Gemini com contingência Groq, contexto mínimo e sem autoridade sobre gabarito/progresso.
- Revisão anterior: fila local por erro, intervalos fixos e item centrado em questão.
- Sincronização anterior: histórico remoto de respostas permitia reconstrução parcial, sem estado de memória persistido no servidor.

## Decisão algorítmica

FSRS foi avaliado, mas não adotado nesta etapa porque o histórico real do Bibliolingo registra resultado binário. FSRS depende de avaliações semânticas `Again/Hard/Good/Easy` e produz melhor resultado depois de calibrar parâmetros com um volume suficiente de revisões. Converter todo acerto em `Good` inventaria um sinal que o aluno nunca forneceu.

Foi adotado um modelo determinístico de curva de esquecimento por conceito, inspirado em half-life regression:

- estabilidade: dias até a retenção projetada atingir o alvo de 90%;
- retenção: `exp(ln(0,9) × dias_decorridos / estabilidade)`;
- dificuldade: escala de 1 a 10, inicializada pela dificuldade editorial;
- acerto espaçado aumenta estabilidade conforme a retenção estimada;
- erro reduz estabilidade, aumenta dificuldade e agenda reaprendizagem;
- evidência de checkpoint/revisão pesa mais que repetição dentro da lição;
- repetição imediata possui ganho mínimo, evitando domínio artificial.

O cálculo é puro, testável, offline e independente de IA. Os mesmos campos são gravados localmente e no PostgreSQL.

## Modelo por conceito

Cada `ReviewItem` usa `conceptId` como identidade pedagógica. `questionId` apenas escolhe um exercício representativo. Perguntas diferentes com o mesmo conceito compartilham uma única memória.

Campos:

- estado: aprendizado, revisão ou reaprendizagem;
- estabilidade, dificuldade e retenção estimadas;
- repetições, tentativas e lapsos;
- última resposta e última revisão;
- intervalo calculado e próxima data.

A equivalência depende exclusivamente de metadados editoriais explícitos. Não existe agrupamento irrestrito por texto ou IA.

## Persistência remota

Aplicar, depois da migration inicial de autenticação:

```text
supabase/migrations/202610180001_spaced_repetition.sql
```

Ela cria:

- `concept_review_state`: projeção atual por usuário/conceito;
- `review_history`: histórico imutável ligado ao evento de resposta;
- trigger idempotente sobre `answer_history`;
- índices por usuário/data;
- RLS de leitura exclusiva do proprietário;
- escrita somente pelo fluxo protegido já existente.

O evento UUID continua sendo a chave idempotente. Um reenvio não cria nova resposta nem altera a memória duas vezes.

## Offline e conflitos

Web e Mobile calculam a memória localmente para resposta imediata. O evento permanece na fila offline e, quando confirmado, o servidor calcula a projeção canônica. Na leitura:

1. usa-se o estado remoto confirmado quando disponível;
2. mescla-se por `conceptId`;
3. vence a atualização com `lastReviewedAt` mais recente;
4. em empate, vence o maior número de tentativas.

Dados antigos são normalizados sem apagar o histórico. Backups continuam compatíveis.

## Experiência

A área **Minhas Revisões** mostra:

- disponíveis hoje;
- atrasadas;
- conceitos que precisam de reforço;
- tempo/quantidade estimados;
- histórico e precisão das revisões concluídas.

As sessões reutilizam os componentes existentes e abrangem Bíblia, Aprofundar, Grego e Formação. O Noah é oferecido após dificuldade repetida, não é chamado automaticamente a cada erro e não participa do agendamento.

## Operação e privacidade

- Nenhuma informação pessoal é enviada ao Noah para calcular revisão.
- O algoritmo continua funcionando sem Gemini ou Groq.
- RLS isola os alunos.
- O servidor não aceita XP arbitrário.
- Tempos de resposta não foram adicionados ao banco; a decisão pedagógica atual não exige esse dado.
- A migration deve ser aplicada primeiro em projeto de teste e validada com duas contas e dois dispositivos antes de produção.
