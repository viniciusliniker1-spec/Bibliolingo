# Bibliolingo

PWA mobile-first para estudo bíblico progressivo e gamificado. A jornada canônica cobre os **66 livros e 1.189 capítulos da Bíblia protestante**. A edição atual possui 266 unidades, 1.067 lições e 266 checkpoints: 191 unidades no Antigo Testamento e 75 no Novo Testamento.

## Stack

- React 19, TypeScript e Vite
- IndexedDB com `idb`
- Zod para backups
- Web Audio API e Vibration API para feedback opcional
- service worker e backend opcional em Cloudflare Worker para o tutor remoto
- Vitest e GitHub Actions

O núcleo permanece local-first e sem custo mensal obrigatório. O tutor remoto é opcional: Gemini Flash é o provedor principal e Groq a contingência, sempre por um Cloudflare Worker que protege as chaves. Nenhuma chave de IA entra no frontend.

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

A UI não acessa IndexedDB diretamente. O conteúdo não é escrito dentro de componentes React. A ordem global em `src/content/catalog.ts` conecta os 66 livros em uma rota recomendada, sem bloquear o leitor bíblico nem o estudo avulso. Bíblia, Teologia, Formação Ministerial e trilha Nazarena são percursos distintos; a aba **Estudar** é o ponto comum para conteúdo completo e revisão.

### Estudar um livro fora da rota

Na Home, abra **Escolher outro livro**, selecione qualquer livro e toque em **Estudar este livro fora da rota**. Um diálogo apresenta duas opções explícitas:

- **Estudar o livro individualmente:** libera somente a progressão interna do livro escolhido e mantém o próximo passo dentro dele;
- **Continuar pela jornada:** retorna diretamente à próxima atividade da ordem canônica.

As duas opções usam as mesmas lições, XP, revisão e conclusão — não existe conteúdo duplicado. A sessão registra o modo e o livro no IndexedDB e no backup, por isso **Continuar** retoma corretamente após fechar o PWA. Conclusões avulsas são preservadas, mas não liberam etapas anteriores nem criam atalhos artificiais na sequência recomendada.

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

- **Noah contextual remoto:** painel reutilizável dentro das lições bíblicas, gregas, avançadas, da Formação Pastoral e do dicionário. Usa o contexto mínimo da atividade, mantém apenas o histórico da sessão no navegador e chama o Worker seguro quando `VITE_NOAH_API_URL` está configurado.

Durante uma lição, **Perguntar ao Noah** oferece pistas sem gabarito. Depois de um erro, a correção determinística acontece primeiro e o painel abre automaticamente com a resposta escolhida, a correta e a explicação editorial. Acertos oferecem **Quer entender melhor?** sem interromper o ritmo. No desktop o painel é lateral; no celular, um bottom sheet com rolagem e safe areas. Respostas da IA nunca corrigem exercício, concedem XP ou alteram progresso. Sem rede, cota ou configuração, todas as trilhas continuam funcionando.\n\nGemini Flash é o principal; Groq assume apenas em erros temporários elegíveis e mantém afinidade durante a sessão. O acesso usa token anônimo curto vinculado à instalação e limites no KV. Consulte [Professor Noah 2.0](docs/NOAH_2.md).

O Noah local/WebLLM foi removido para evitar downloads grandes e duas experiências concorrentes. As chaves `GROQ_API_KEY` e `GEMINI_API_KEY` pertencem exclusivamente ao Worker. Consulte [Arquitetura de IA e Grego](docs/ARCHITECTURE_AI_GREEK.md) e [worker/README.md](worker/README.md).

## Formação Pastoral Nazareno

A segunda jornada fica exclusivamente em **Estudar → Formação Pastoral Nazarena**. O acesso solicita a senha `12345` e permanece liberado somente durante a sessão atual do navegador. O conteúdo autoral está estruturado em dados versionados a partir de `Bibliolingo-Formacao-Pastoral.md`:

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


### Piloto editorial de Gênesis 1–2

A Unidade 1 avançada possui quatro etapas e um checkpoint de oito questões. Os quatro primeiros temas canônicos têm estudos completos rastreáveis. Erros do Aprofundar entram na revisão comum com enunciado reformulado; o feedback oferece **Rever estudo** e **Estudar com Noah** sem bloquear o conteúdo.


## Primeiros livros históricos

A sequência canônica agora continua do Pentateuco até **2 Samuel**:

- Josué: 5 unidades sobre entrada, conquista, repartição e renovação da aliança;
- Juízes: 5 unidades que tratam a espiral de infidelidade sem idealizar seus protagonistas;
- Rute: 2 unidades sobre lealdade, resgate e inclusão;
- 1 Samuel: 6 unidades, de Ana e Samuel à queda de Saul;
- 2 Samuel: 6 unidades, da unificação do reino ao censo de Davi.

São 96 lições novas, sempre com ensino antes de cada exercício, duas questões por lição, checkpoint de 80% por unidade e IDs estáveis. Narrativas de guerra, violência sexual, abuso de poder e práticas antigas recebem notas didáticas que distinguem descrição bíblica de aprovação moral ou aplicação cristã. Todo o material novo precisa de revisão editorial bíblica e teológica humana antes de ser considerado edição definitiva.

## Grego Bíblico e dicionário

A rota **Grego Bíblico** contém oito unidades, 32 lições e oito checkpoints, com objetivos, ensino progressivo, exercícios determinísticos nos três formatos do Bibliolingo e aprovação de 80%. O progresso reutiliza XP, streak, corações, revisão e conquistas existentes. A página **Minha evolução no grego** mostra unidades, vocabulário e dificuldades gramaticais.

O **Dicionário Grego** funciona localmente e offline. Busca por lema ou forma grega, transliteração, significado em português e número Strong, ignorando diferenças de acentos e diacríticos. A edição atual carrega sob demanda as 5.408 entradas do Dodson Greek Lexicon e mantém 34 verbetes editoriais enriquecidos em português; lema e forma flexionada são sempre distinguidos.

Os dados lexicais combinam o TBESG do [STEP Bible Data](https://github.com/STEPBible/STEPBible-Data), sob CC BY 4.0, e o [Dodson Greek Lexicon](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon), publicado sob CC0 1.0/domínio público. O CSV completo está fixado por revisão, é carregado somente ao abrir o dicionário e fica no cache offline depois do primeiro acesso. As definições completas permanecem em inglês; traduções, pronúncias e notas morfológicas em português existem somente nos verbetes revisados editorialmente.

No leitor bíblico, versículos do Novo Testamento oferecem **Ver no grego original**. O texto, Strong e morfologia são carregados por livro a partir do [Textus Receptus de Robinson](https://github.com/byztxt/greektext-textus-receptus), declarado em domínio público. As palavras aparecem na ordem grega e abrem diretamente o verbete correspondente; o app não afirma alinhamento automático de uma palavra portuguesa a uma grega.


## Antigo Testamento completo

A jornada canônica segue de Gênesis a Malaquias. Os dez primeiros livros mantêm as unidades detalhadas já publicadas; de 1 Reis a Malaquias, a primeira edição oferece uma unidade panorâmica por livro, quatro lições temáticas, duas questões por lição e checkpoint de 80%. IDs, capítulos, referências e ordem são validados automaticamente. O conteúdo é autoral e deve passar por revisão bíblica e teológica humana antes de ser tratado como edição editorial definitiva; livros extensos serão aprofundados em incrementos posteriores sem quebrar o progresso existente.


### Matriz proporcional em andamento

Os livros não recebem mais uma quantidade uniforme de lições. A matriz considera extensão, gênero e densidade. Gênesis–Ester e Salmos já atingiram a meta: Salmos possui 61 lições; 1–2 Reis e 1 Crônicas possuem 24 cada; 2 Crônicas possui 28; Esdras e Ester possuem 12 cada; Neemias possui 16. Os livros ainda panorâmicos continuam funcionais e serão aprofundados sem alterar IDs existentes.


O bloco poético e sapiencial atingiu sua meta: Jó 32 lições, Salmos 61, Provérbios 32, Eclesiastes 12 e Cântico dos Cânticos 8.


### Antigo Testamento proporcionalmente completo

Todos os 39 livros atingiram a meta curricular mínima. Os Profetas Maiores possuem 48 lições em Isaías, 44 em Jeremias, 8 em Lamentações, 40 em Ezequiel e 16 em Daniel. Profetas Menores variam de 4 a 16 lições conforme extensão e densidade. A contagem final é 767, uma acima da matriz original, para preservar um ID antigo de Salmos.


## Novo Testamento completo

A jornada canônica continua de Mateus a Apocalipse usando a mesma engine de conteúdo, progresso, revisão e checkpoints. Os 27 livros cobrem os 260 capítulos em 75 unidades, 300 lições e 75 checkpoints. A distribuição considera extensão, gênero e densidade: Mateus, Lucas, João, Atos, Romanos, Hebreus e Apocalipse recebem mais unidades; cartas de um capítulo preservam quatro lições focadas em seus principais movimentos.

Os dados ficam em `src/content/newTestament/books.ts`. IDs seguem `matthew-u01-l01`, referências usam os IDs do catálogo bíblico e cada unidade cobre uma faixa contínua de capítulos validada por teste. Esta é uma primeira edição curricular autoral baseada no texto bíblico e deve receber revisão editorial, exegética e teológica humana antes de ser apresentada como edição definitiva.

A Formação Pastoral não aparece mais na Home. Seu único ponto de entrada fica na aba **Estudar**, e as rotas `/formation` e `/formation/activity/:id` compartilham o mesmo bloqueio de sessão. A senha no frontend é uma barreira de interface, não autenticação criptográfica; conteúdo realmente privado exigirá backend e contas.


## Cliente mobile com Expo (branch de desenvolvimento)

A primeira versão React Native está isolada em `mobile/` e não altera os comandos da aplicação web. Consulte:

- [MOBILE_AUDIT.md](./MOBILE_AUDIT.md): auditoria e decisões de arquitetura;
- [MOBILE_SETUP.md](./MOBILE_SETUP.md): teste usando apenas Android, Codespaces e Expo Go;
- [MOBILE_VALIDATION.md](./MOBILE_VALIDATION.md): resultados reais da CI e limitações.

A implementação está no PR rascunho [#36](https://github.com/viniciusliniker1-spec/Bibliolingo/pull/36) e não deve ser incorporada à `main` antes do teste físico e da autorização do proprietário.
