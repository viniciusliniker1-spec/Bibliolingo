# Bibliolingo: plano de implementação do aprendizado e da gamificação

Data: 6 de outubro de 2026. Versão 1.

## Resultado que queremos construir

O Bibliolingo deve ensinar com profundidade em sessões curtas. O usuário lê, entende, pratica, recebe retorno específico, revisa o que esqueceu e acompanha evolução real. XP, sequência e recompensas servem para sustentar o hábito. Eles não podem premiar repetição vazia nem substituir domínio do conteúdo.

O produto será organizado em quatro áreas: Início, Trilhas, Estudar e Perfil. A trilha Nazarena usará a mesma estrutura, com fontes institucionais e um simulador pastoral no final. A área `Bíblia` dentro de `Estudar` será também um leitor bíblico completo, com versões selecionáveis.

## Escopo do primeiro ciclo

Implementar uma trilha piloto de Gênesis, Unidade 1: Criação e propósito. Ela valida o modelo antes de replicarmos para os demais livros e para a Formação Nazarena.

| Item | Definição para o piloto | Critério de pronto |
|---|---|---|
| Unidade | 4 lições, 1 checkpoint e revisão | A unidade aparece como caminho de lições e pode ser concluída |
| Estudo | Contexto, explicação, texto bíblico, síntese e fonte | Cada lição ensina o necessário antes das perguntas |
| Exercícios | 2 a 4 questões por lição, múltipla escolha ou completar frase | Há explicação específica para acerto e erro |
| Revisão | Itens errados retornam em nova formulação | O usuário vê uma fila de revisão e consegue concluí-la |
| Progresso | XP, domínio e sequência diária | Os três indicadores mudam com regras distintas |
| Checkpoint | Questões inéditas sobre a unidade | O sistema informa quais competências precisam de reforço |
| Perfil | Resumo de domínio e conquistas | O usuário vê progresso por assunto e nível geral |

## Regras do aprendizado

### 1. Estrutura do conteúdo

Usar: Trilha → Unidade → Lição → Competência → Revisão → Checkpoint.

Cada lição terá:

1. Objetivo de aprendizagem.
2. Texto bíblico delimitado.
3. Leitura curta em blocos.
4. Contexto histórico e literário quando for relevante.
5. Explicação de dois ou três pontos centrais.
6. Aplicação que decorre do texto.
7. Prática.
8. Fonte e botão `Estudar com Noah`.

O botão `Estudar com Noah` abre o ChatGPT com uma pergunta pronta, por exemplo: “Estou estudando Gênesis 1:26–28 no Bibliolingo. Explique a expressão ‘imagem de Deus’, apresente os principais cuidados de interpretação e me ajude a entender onde errei.”

### 2. Questões e retorno

Cada questão mede uma competência identificada. Exemplos para Gênesis 1:

| Competência | Tipo de questão |
|---|---|
| Distinguir observação de interpretação | Múltipla escolha |
| Explicar imagem de Deus no contexto da passagem | Múltipla escolha |
| Relacionar criação e responsabilidade humana | Completar frase |
| Identificar o gênero e a função de uma passagem | Múltipla escolha |

Após responder:

- Acerto: explicar por que a alternativa corresponde ao texto e conceder XP.
- Erro: explicar o problema da alternativa escolhida, mostrar a resposta correta e oferecer `Rever estudo` e `Estudar com Noah`.
- A explicação aparece antes do botão para continuar. O usuário não perde acesso ao conteúdo por errar.

### 3. Domínio e revisão inteligente

XP mede participação. Domínio mede desempenho em questões variadas ao longo do tempo. Os dois não são equivalentes.

Cada competência começa como `novo`. Depois progride para `em aprendizado`, `praticado` e `dominado`. A classificação deve considerar acerto, dificuldade, uso de nova formulação e tempo desde a última resposta.

Revisão inicial para o piloto:

| Resultado | Retorno para revisão |
|---|---|
| Errou | Depois de 1 dia |
| Errou novamente | Depois de 3 dias |
| Acertou na revisão | Depois de 7 dias |
| Acertou novamente | Depois de 21 dias |

Se a pessoa erra uma questão, a revisão usa outro enunciado ou outra aplicação. Não repetir a mesma pergunta como única prova de aprendizagem.

### 4. Checkpoint

O checkpoint libera ao concluir as quatro lições da unidade. Terá 8 questões inéditas, distribuídas pelas competências da unidade.

Resultado proposto:

- 80% ou mais: checkpoint concluído, +60 XP, conquista da unidade e próxima unidade recomendada.
- 60% a 79%: unidade concluída, com revisão recomendada nos tópicos frágeis.
- Abaixo de 60%: apresentar revisão guiada e permitir nova tentativa depois de concluí-la.

O conteúdo de qualquer unidade continua acessível em `Estudar`. O checkpoint mede avanço do percurso e não bloqueia a leitura bíblica.

### 5. Nivelamento inicial

No primeiro acesso, oferecer duas opções: escolher onde começar ou fazer diagnóstico. O diagnóstico terá 15 questões, com conteúdos básicos de Antigo Testamento, Evangelhos, Cartas e leitura bíblica.

Ele gera uma rota recomendada e um retrato inicial de domínio. Não deve pular automaticamente o usuário para unidades avançadas. Mesmo quem vai bem recebe recomendação e pode estudar qualquer conteúdo aberto.

## Gamificação que ajuda o hábito

### XP e nível

| Ação | XP inicial |
|---|---:|
| Concluir uma lição | 15 |
| Acertar todas as questões da lição | +5 |
| Concluir revisão | 10 |
| Concluir checkpoint | 60 |
| Concluir quiz diário | 10 |

O nível sobe a cada 100 XP no piloto. Não conceder XP extra por responder a mesma questão repetidamente no mesmo dia.

### Sequência diária e meta

O usuário escolhe uma meta diária de 5, 10 ou 15 minutos. Ao cumprir a meta, mantém a sequência. Uma lição curta ou uma revisão pode contar, desde que haja interação respondida.

Exibir no Início: sequência atual, meta do dia e uma ação clara para continuar. Evitar mensagens punitivas quando a sequência é quebrada. Mostrar recomeço simples e histórico semanal.

### Conquistas

Começar com conquistas úteis, ligadas a ações reais:

| Conquista | Condição |
|---|---|
| Primeiro passo | Concluir a primeira lição |
| Estudante constante | Manter 7 dias de sequência |
| Mente em revisão | Concluir 10 revisões |
| Fundamentos de Gênesis | Concluir a Unidade 1 |
| Leitor atento | Abrir estudo completo em 5 lições |
| Preparação pastoral | Concluir uma unidade Nazarena |

Avatares e itens cosméticos não entram no primeiro ciclo. Eles não são necessários para validar estudo, retenção e navegação.

### Quiz diário

Adicionar após a revisão inteligente estar funcionando. Ele terá cinco perguntas curtas de conteúdo já estudado ou de fundamentos gerais. Vale 10 XP e alimenta a sequência, mas não altera domínio se a pergunta nunca foi apresentada no percurso.

### Ranking e ligas

Deixar para o segundo ciclo. Só vale incluir quando houver usuários suficientes e regras contra competição por volume. A pontuação semanal deve valorizar lições, revisões e checkpoints, com teto diário de XP competitivo. O ranking não pode reduzir a prioridade de estudo ou expor desempenho teológico como comparação pública.

### Corações

Não implementar no primeiro ciclo. Se forem usados depois, servirão como sinal visual de tentativa, nunca como bloqueio de conteúdo. Recuperação por revisão é obrigatória. O teste de retenção precisa mostrar se isso melhora ou piora o retorno às lições.

## Telas e comportamentos

| Tela | Elementos obrigatórios | Ação principal |
|---|---|---|
| Início | Continuar trilha, revisão pendente, sequência, XP, meta e atalho para Estudar | Retomar o próximo passo |
| Trilhas | Caminho vertical de unidades e lições, progresso e checkpoint | Iniciar lição |
| Lição | Progresso, estudo em blocos, referência bíblica, questão e retorno | Verificar resposta |
| Resultado da questão | Correção, explicação, XP e atalhos de aprofundamento | Próxima etapa ou rever estudo |
| Revisão | Fila de competências a fortalecer e progresso da sessão | Revisar agora |
| Checkpoint | Questões novas, resultado por competência e plano de reforço | Concluir ou revisar |
| Estudar | Texto completo, fontes, temas relacionados e acesso por trilha | Ler em profundidade |
| Perfil | Nível, sequência, domínio por área, conquistas e histórico semanal | Ver progresso |

## Leitor bíblico e versões completas

Dentro de `Estudar`, criar a aba `Bíblia`. Ela terá navegação por Antigo e Novo Testamento, busca por referência, seletor de capítulo, leitura contínua e seletor de versão. No lançamento, disponibilizar:

| Código | Versão exibida | Situação de uso | Crédito obrigatório |
|---|---|---|---|
| ALM1911 | Almeida Revista e Corrigida, 1911 | Edição histórica de uso livre | João Ferreira de Almeida, Edição Revista e Corrigida, Lisboa, 1911 |
| BLIVRE | Bíblia Livre | Licença Creative Commons Atribuição 4.0. Não é domínio público | Bíblia Livre, autores Diego Santos, Mario Sérgio e Marco Teles. CC BY 4.0 |

A opção padrão deve ser a Almeida 1911. O leitor memoriza a última versão escolhida por cada usuário e permite trocar de versão em qualquer capítulo. Quando uma lição aponta para uma passagem, o botão `Ler` abre esse texto na versão escolhida, mantendo um seletor visível para comparação.

### Importação e organização dos textos

1. Obter o arquivo-fonte completo e rastreável de cada versão.
2. Conferir os 66 livros, capítulos e versículos, sem lacunas e sem duplicações.
3. Converter para um formato interno por versão, livro, capítulo e versículo.
4. Guardar metadados de versão: código, nome, ano, licença, autores, URL da fonte, data de importação e texto do crédito.
5. Exibir o crédito da versão na tela de informações e no rodapé do leitor.
6. Separar texto bíblico de notas, números de Strong, comentários e recursos de terceiros. Eles só entram com licença própria verificada.
7. Criar testes de integridade para contagem de livros, capítulos e versículos durante cada atualização de base.

Não usar a ARC contemporânea da Sociedade Bíblica do Brasil sob o rótulo `ARC 1911`. São edições diferentes. O aplicativo deve mostrar o ano ao lado do nome para reduzir confusão.

### Funcionalidades do leitor no primeiro ciclo

| Função | Comportamento |
|---|---|
| Seletor de versão | Alterna entre ALM1911 e BLIVRE no mesmo capítulo |
| Navegação | Livro, capítulo, próximo e anterior |
| Referência rápida | Campo como `Gn 1:26` abre a passagem correta |
| Busca | Pesquisa palavras dentro da versão escolhida |
| Abertura por lição | A referência da lição abre o leitor diretamente no texto |
| Créditos | Mostra autoria, edição e licença de cada versão |

Comparação lado a lado, marcações, favoritos, notas pessoais e áudio entram após o leitor, a busca e a importação passarem na validação.

## Ordem de desenvolvimento

### Fase 1. Modelo e conteúdo piloto

1. Definir as quatro lições de Gênesis 1–2 e as competências de cada uma.
2. Criar os estudos completos, as fontes e os exercícios.
3. Modelar os dados de trilha, unidade, lição, questão, competência e resposta.
4. Construir as telas de Trilhas, Lição e Resultado.
5. Validar a experiência inteira no celular.
6. Importar e validar as versões ALM1911 e BLIVRE para alimentar o leitor bíblico.

### Fase 2. Aprendizagem adaptativa

1. Registrar respostas por competência.
2. Criar fila e calendário de revisão.
3. Criar domínio por competência e resumo no Perfil.
4. Implementar checkpoint e resultado por ponto fraco.
5. Criar diagnóstico inicial e rota recomendada.
6. Integrar referências das lições ao leitor e ao seletor de versões.

### Fase 3. Hábito e engajamento

1. Implementar XP, níveis, meta e sequência diária.
2. Criar conquistas do piloto.
3. Adicionar quiz diário.
4. Medir conclusão, retorno e revisões realizadas.

### Fase 4. Escala editorial e formação Nazarena

1. Replicar o modelo para outras unidades bíblicas.
2. Integrar a trilha Formação Nazarena e a aba Estudar.
3. Criar o simulado pastoral por competências.
4. Revisar cada conteúdo com fontes e posição denominacional identificada.

### Fase 5. Recursos sociais experimentais

1. Testar ranking com liga semanal e limite de XP competitivo.
2. Avaliar corações recuperáveis por revisão.
3. Manter apenas o que aumentar constância sem reduzir compreensão.

## Indicadores para decidir o que manter

| Indicador | O que mostra |
|---|---|
| Conclusão de lição | Clareza e duração adequada |
| Conclusão de unidade | Progressão e interesse |
| Retorno em 7 dias | Formação de hábito |
| Revisões concluídas | Aderência ao reforço |
| Acerto em questões novas | Aprendizado além da memorização |
| Uso de `Estudar` e `Estudar com Noah` | Necessidade de aprofundamento |
| Checkpoint por competência | Pontos fracos do conteúdo e da experiência |

Evitar decidir por tempo de tela ou XP acumulado isoladamente. O sinal principal é melhora em questões novas depois da revisão.

## Próxima entrega concreta

Criar o conteúdo e os dados da Unidade 1 de Gênesis: quatro lições, estudo completo, questões, explicações, competências, revisão e checkpoint. Ela será o padrão técnico e editorial do Bibliolingo.
