# Bibliolingo

PWA mobile-first para estudo bíblico progressivo e gamificado. A jornada canônica cobre todo o **Pentateuco** em 35 unidades, 142 lições e 35 checkpoints.

## Stack

- React 19, TypeScript e Vite
- IndexedDB com `idb`
- Zod para backups
- Web Audio API e Vibration API para feedback opcional
- service worker sem backend
- Vitest e GitHub Actions

Não existe API paga, chave da OpenAI ou custo mensal obrigatório.

## Rodar localmente

Requer Node.js 22 ou versão LTS compatível.

```bash
npm install
npm run dev
```

Testes e build:

```bash
npm test
npm run build
npm run preview
```

## Instalar como PWA

1. Gere o build e sirva `dist/` por HTTPS.
2. Abra o aplicativo no Chrome/Android.
3. Use **Instalar** no cabeçalho quando o navegador oferecer a instalação.

O service worker guarda a interface, o conteúdo da jornada e os assets essenciais. Livros bíblicos visitados também ficam no cache. Depois do primeiro carregamento bem-sucedido, as atividades principais funcionam offline.

## Arquitetura

```text
src/
  app/             shell e navegação
  components/      componentes reutilizáveis
  config/          XP, metas, corações e progressão
  content/         livros, unidades, lições e exercícios
  domain/          regras puras de negócio
  features/        telas por área do produto
  services/        Noah, áudio e integrações sem estado
  state/           estado e ações da aplicação
  storage/         IndexedDB, backup e migrações
  types/           contratos de conteúdo e progresso
public/            manifest, service worker e ícone
```

A UI não acessa IndexedDB diretamente. O conteúdo não é escrito dentro de componentes React. A ordem global em `src/content/catalog.ts` conecta os livros e mantém uma rota recomendada, sem bloquear o leitor dos 66 livros. Bíblia, Teologia, Formação Ministerial e trilha Nazarena são percursos distintos; a aba **Estudar** é o ponto comum para conteúdo completo e revisão.

## Estrutura do conteúdo

Os contratos estão em `src/types/content.ts`. Cada entidade usa ID estável e `contentVersion`.

```text
exodus
exodus-u01
exodus-u01-l01
exodus-u01-l01-s01
exodus-u01-l01-q01
exodus-u01-checkpoint
```

Cada exercício de lição deve ser imediatamente precedido por um passo didático. Cada exercício também precisa incluir:

- objetivo pedagógico;
- resposta inequívoca;
- distratores plausíveis;
- explicação;
- referência;
- conceito;
- dificuldade.

O modelo de `Lesson` aceita um `CompleteStudy` de aproximadamente 600–1.000 palavras quando a complexidade exigir, dividido em blocos retomáveis: texto-base e objetivo, contexto histórico, contexto literário, explicação, conceitos, interpretações e limites, aplicação, síntese e fontes. O piloto `genesis-u01-l01` implementa o contrato completo; as demais lições exibem estado editorial pendente em vez de conteúdo gerado em massa sem revisão.

`SourceReference` implementa a ficha de rastreabilidade: autor, instituição, URL, consulta, idioma, edição, licença, orientação teológica, cobertura efetivamente lida, resumo original, referências bíblicas, divergências, limites, unidades aplicáveis e estado editorial. Links não autorizam cópia: material protegido só pode ser resumido originalmente e referenciado até haver licença de incorporação.

### Criar uma lição

1. Abra o arquivo da unidade em `src/content/<livro>/`.
2. Adicione um `Lesson` com ID novo e estável.
3. Combine passos `learn` e exercícios objetivos.
4. Adicione o ID à ordem da unidade.
5. Rode os testes de integridade.

### Criar uma unidade

1. Crie ou amplie o arquivo versionado da unidade.
2. Declare conceitos e fontes.
3. Adicione lições e checkpoint.
4. Registre a unidade no carregador do livro.

### Adicionar um livro

1. Crie `src/content/<book-id>/`.
2. Defina unidades com IDs estáveis e cobertura explícita de capítulos.
3. Registre metadados e ordem em `journeyBooks`, dentro de `src/content/catalog.ts`.
4. Adicione testes de cobertura, formatos e desbloqueio.
5. Quando o catálogo crescer, mova cada livro para carregamento dinâmico sem alterar os contratos.

## Feedback de resposta

Acertos, erros e conclusão bem-sucedida usam sequências próprias sintetizadas no navegador com Web Audio e pulsos táteis breves em aparelhos compatíveis; nenhum ativo proprietário é copiado. O botão **Começar próximo passo** encerra a tela de resultado, cria a sessão seguinte e abre diretamente o primeiro conteúdo didático da nova atividade. Som e vibração são preferências independentes, persistidas e incluídas no backup. Movimento reduzido desativa o feedback tátil, e falhas dessas APIs nunca bloqueiam uma resposta.

## Gamificação

Todos os valores ficam em `src/config/gamification.ts`. Níveis são calculados por função, sem tabela manual. Streak usa a data civil local, evitando quebra por UTC.

XP mede atividade e nunca é usado como sinônimo de aprendizagem. O domínio por conceito é calculado em `src/domain/mastery.ts` com evidência recente, variedade de questões, revisões posteriores e peso adicional de checkpoints. Repetir imediatamente a mesma questão não basta para atingir domínio.

Achievements ficam em `src/domain/achievements.ts`. Para criar um:

1. escolha um ID estável;
2. informe título, descrição e ícone;
3. use uma condição existente ou adicione um novo tipo com teste;
4. nunca derive progresso do texto exibido.

## Persistência e migrações

`src/storage/database.ts` contém o adaptador IndexedDB. Migrações incrementais ficam em `src/storage/migrations.ts`. O schema 5 acrescenta o lembrete diário e migra automaticamente estados anteriores, preservando progresso, notas, marcações, feedback e preferências.

## Lembrete diário

Em **Perfil → Lembrete da jornada**, o usuário escolhe o horário local, permite notificações quando o navegador oferece suporte e pode baixar um evento recorrente para o calendário. Enquanto o PWA está aberto ou volta ao primeiro plano, a engine confere o horário e mostra o aviso interno uma única vez por dia. Navegadores podem suspender um PWA totalmente fechado; por isso, o arquivo de calendário é oferecido como alternativa confiável, offline e sem backend ou custo recorrente.

## Exportar e importar

Em **Perfil → Backup do progresso**:

- **Exportar progresso** baixa um JSON versionado.
- **Importar progresso** valida o arquivo antes de qualquer troca.
- Antes da substituição, o app baixa automaticamente um backup de recuperação.

## Estudar com Noah

Os atalhos geram um prompt a partir da lição atual, copiam para a área de transferência antes de abrir o ChatGPT e não usam API nem chave. O aplicativo não envia a mensagem automaticamente. Por segurança, navegadores não permitem que um site cole texto automaticamente dentro de outro; no ChatGPT, use **Colar**. A cópia usa fallback compatível com navegadores mobile.

## Formação Pastoral Nazareno

A segunda jornada fica em **Jornada → Formação Pastoral** e também aparece na área **Estudar**. O conteúdo autoral está estruturado em dados versionados a partir de `Bibliolingo-Formacao-Pastoral.md`:

- 6 matérias, 58 lições e 174 questões únicas;
- três blocos didáticos antes dos exercícios: compreensão, prática pastoral e síntese para entrevista;
- 6 provas de matéria e simulado final com 30 questões;
- critério pedagógico de 80%, sem alegar equivalência com nota de banca;
- fontes e localizadores visíveis por lição;
- referências bíblicas abrem o leitor e preservam o retorno à atividade;
- XP, streak, sons e persistência compartilhados com o restante do aplicativo;
- erros de Formação não consomem corações, evitando bloqueio da preparação ministerial.

Para editar o curso, preserve os IDs publicados em `src/content/formation/formationData.json`, atualize a versão do conteúdo e rode os testes de integridade. O documento-fonte não substitui o JSON consumido pela aplicação.

## Texto bíblico e fontes

O leitor oferece os 66 livros da **Almeida 1819 (Bíblia Livre)**, declarada em domínio público, a partir de uma revisão fixada do [Midvash Bible Data](https://github.com/midvash/bible-data). Cada livro é carregado somente quando aberto e fica disponível no cache offline. O leitor aceita referências como **Êxodo 3:14**, permite marcar versículos e salvar notas no IndexedDB. Referências verdes das lições abrem diretamente o primeiro versículo citado e exibem **Voltar à tarefa na jornada**. A ARA não é incluída porque possui direitos autorais ativos; sua inclusão futura exige licença do titular.

Consulte [PROJECT.md](PROJECT.md) para decisões e limitações e [ROADMAP.md](ROADMAP.md) para as próximas fases.


## Experiência de estudo 2.0

- a Home mantém o livro atual em foco e recolhe o restante da jornada;
- cada atividade começa com objetivo, referências, duração e XP disponível;
- referências abrem uma prévia bíblica em painel, com nota e marcação, sem perder a tarefa;
- o leitor completo continua acessível e preserva o retorno ao passo exato;
- respostas escolhidas e corretas recebem estados visuais com ícones, não somente cor;
- a conclusão mostra conceitos demonstrados, pontos para revisar, conquista e próxima atividade;
- a revisão oferece sessão rápida de cinco itens, estimativa e justificativa para cada questão;
- o shell informa quando o aparelho está offline.


## Jornada Aprofundar

O campo **Nível de conhecimento bíblico** fica no Perfil. Ao escolher **Avançado**, o aplicativo abre a rota independente `/deepen`. Essa jornada não substitui a trilha bíblica comum: ela usa estudos completos, fontes rastreáveis, exercícios médios/difíceis, checkpoint de 80% e progresso com IDs próprios.

O piloto editorial é Gênesis 1, dividido em três lições avançadas e um checkpoint. Para ampliar:

1. adicione ou revise um `CompleteStudy`;
2. crie lições em `src/content/deepen/catalog.ts` com IDs `deepen-...`;
3. associe blocos, questões objetivas, conceitos e referências;
4. mantenha fontes e limites interpretativos explícitos;
5. execute `npm test` e `npm run build`.
