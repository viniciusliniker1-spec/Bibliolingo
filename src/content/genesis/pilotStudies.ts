import type { CompleteStudy } from "../../types/content";

const genesisReference = (label: string, chapter: number, startVerse: number, endVerse: number) => ({
  bookId: "genesis",
  startChapter: chapter,
  startVerse,
  endVerse,
  label
});

export const genesisPilotStudies: Record<string, CompleteStudy> = {
  "genesis-u01-l01": {
    id: "genesis-u01-l01-study-v1",
    estimatedWords: 760,
    objective: "Interpretar como Gênesis 1 apresenta Deus, organiza o relato e afirma a bondade da criação.",
    baseText: genesisReference("Gênesis 1:1–31", 1, 1, 31),
    blocks: [
      {
        id: "genesis-u01-l01-study-01",
        kind: "base-text-objective",
        title: "Texto-base e objetivo",
        body: "Leia Gênesis 1:1–31 observando repetições, separações, nomes e avaliações. O objetivo não é resolver em uma única lição todas as discussões científicas sobre origens, mas reconhecer o argumento teológico do capítulo: Deus inicia, ordena, preenche e avalia sua criação. Ao terminar, você deverá conseguir apontar no próprio texto as evidências para essa síntese.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-02",
        kind: "historical-context",
        title: "Contexto histórico",
        body: "Gênesis abre o Pentateuco e apresenta a identidade do Deus de Israel antes de narrar Abraão, o êxodo e a aliança. A data e o processo de composição são discutidos entre estudiosos; esta lição não transforma uma hipótese de autoria ou data em certeza textual. Para o leitor antigo, sol, lua, mares e animais podiam ser associados a poderes divinos em culturas vizinhas. O relato bíblico, porém, os coloca como criaturas sob a palavra de um único Criador.",
        sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"]
      },
      {
        id: "genesis-u01-l01-study-03",
        kind: "literary-context",
        title: "Contexto literário",
        body: "O capítulo possui ritmo deliberado. Deus fala, algo acontece, Deus vê, nomeia ou abençoa, e o dia é contado. Os primeiros movimentos formam domínios; os seguintes os preenchem. Essa organização ajuda o leitor a perceber propósito em vez de acaso. Gênesis 1:1–2 funciona como abertura; Gênesis 1:31 encerra a sequência com a avaliação ‘muito bom’. O sétimo dia, em Gênesis 2:1–3, completa o movimento e será estudado adiante.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-04",
        kind: "text-explanation",
        title: "Explicação do texto",
        body: "Primeiro, Deus é o sujeito principal: a criação depende de sua iniciativa. Segundo, sua palavra estabelece distinções — luz e trevas, águas e firmamento, terra e mares — e torna o mundo habitável. Terceiro, a repetição de ‘bom’ avalia positivamente o mundo material. A bondade não significa que cada possibilidade já esteja desenvolvida, mas que a criação corresponde ao propósito do Criador. A humanidade aparece no clímax do sexto dia, dentro da comunidade das criaturas e com uma vocação particular.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-05",
        kind: "essential-concepts",
        title: "Conceitos essenciais",
        body: "Criação designa a dependência do mundo em relação a Deus. Ordem descreve relações e limites que tornam a vida possível. Bondade é a avaliação divina da obra. Esses conceitos vêm do argumento do capítulo, não de uma etimologia isolada. A fórmula ‘e disse Deus’ destaca autoridade eficaz; ela não autoriza concluir, sem outros argumentos, um mecanismo físico específico para cada etapa.",
        sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"]
      },
      {
        id: "genesis-u01-l01-study-06",
        kind: "interpretations-limits",
        title: "Interpretações e limites",
        body: "Cristãos divergem sobre a relação entre os dias do relato e a cronologia física: há leituras de dias solares, estruturas literárias e outras propostas. O ponto compartilhado que esta lição cobra é mais limitado: o texto apresenta Deus como Criador, a criação como ordenada e sua obra como boa. Nenhuma dessas leituras deve ser apresentada como tradução automática do hebraico. Questões científicas exigem diálogo próprio e não são resolvidas por um quiz breve.",
        sourceIds: ["bibliolingo-editorial-v1"]
      },
      {
        id: "genesis-u01-l01-study-07",
        kind: "application",
        title: "Aplicação",
        body: "Se o mundo é dádiva boa e ordenada, a resposta coerente é gratidão, cuidado e humildade. A aplicação nasce do sentido do texto: criaturas não ocupam o lugar do Criador e não tratam sua obra como descartável. Isso orienta trabalho, consumo e cuidado ambiental sem transformar Gênesis 1 em um manual moderno de políticas públicas.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-08",
        kind: "summary-sources",
        title: "Síntese e fontes",
        body: "Gênesis 1 apresenta Deus como origem e autoridade; organiza a narrativa por palavra, separação e preenchimento; e chama a criação de boa. Guarde o argumento, não uma lista de respostas. Fonte primária: Gênesis 1:1–31. Critério editorial: Bibliolingo, base editorial e fontes, versão 1. Materiais externos do catálogo permanecem referências para leitura e não foram copiados para esta lição.",
        sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"]
      }
    ]
  },
  "genesis-u01-l02": {
    id: "genesis-u01-l02-study-v1",
    estimatedWords: 720,
    objective: "Explicar imagem de Deus como dignidade recebida, vocação representativa e responsabilidade compartilhada.",
    baseText: genesisReference("Gênesis 1:26–31", 1, 26, 31),
    blocks: [
      { id: "genesis-u01-l02-study-01", kind: "base-text-objective", title: "Texto-base e objetivo", body: "Leia Gênesis 1:26–31 observando quem toma a iniciativa, quem recebe a imagem e quais tarefas acompanham essa identidade. O objetivo é explicar a ligação entre dignidade e vocação sem reduzir a imagem de Deus a aparência física, capacidade isolada ou privilégio de um grupo. Ao final, você deverá distinguir o que o texto afirma diretamente das explicações teológicas construídas para organizar essas afirmações.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l02-study-02", kind: "historical-context", title: "Contexto histórico", body: "No mundo antigo, imagens podiam representar a presença e a autoridade de um rei ou de uma divindade. Gênesis aplica linguagem de imagem à humanidade, não somente a governantes. Essa comparação ajuda a perceber a força pública da vocação humana, mas não prova sozinha todos os detalhes do conceito. O texto bíblico permanece a fonte primária; reconstruções culturais devem ser apresentadas como contexto provável e não como palavras escondidas no versículo.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l02-study-03", kind: "literary-context", title: "Lugar no relato", body: "A criação da humanidade aparece no sexto dia, depois da formação e do preenchimento dos demais domínios. A fórmula deliberativa, a repetição de imagem e semelhança, a menção de homem e mulher e a bênção seguinte dão destaque ao momento. Ao mesmo tempo, seres humanos continuam criaturas: recebem vida, alimento e tarefa. O lugar elevado no relato não autoriza independência do Criador nem desprezo pelas outras criaturas.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l02-study-04", kind: "text-explanation", title: "Dignidade compartilhada", body: "Gênesis 1:27 distribui a dignidade da imagem a homem e mulher. O texto não reserva essa condição a uma classe, etnia ou função religiosa. A imagem é recebida antes de qualquer desempenho narrado. Por isso, valor humano não depende de produtividade, inteligência medida ou posição social. Essa é uma conclusão teológica fundada na abrangência da declaração, não uma licença para ignorar outras passagens sobre relações, pecado e restauração.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l02-study-05", kind: "essential-concepts", title: "Vocação e domínio", body: "A bênção associa a humanidade ao cuidado do mundo vivo. Domínio, dentro de um relato em que Deus chama a criação de boa, deve refletir responsabilidade sob autoridade recebida. O texto permite falar de representação, cultivo e governo responsável. Não permite transformar poder em exploração ilimitada. Dignidade e tarefa caminham juntas: representar o Criador envolve tratar sua obra de modo coerente com a bondade que ele declara.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l02-study-06", kind: "interpretations-limits", title: "Interpretações e limites", body: "Cristãos explicam a imagem de Deus de modos complementares: capacidades relacionais ou morais, posição representativa e vocação. O versículo sustenta identidade e tarefa, mas não escolhe sozinho uma teoria completa. A tradição wesleyana enfatiza dignidade, liberdade responsável e restauração pela graça; essa formulação deve ser nomeada como interpretação teológica. Nenhuma tradição denominacional deve ser apresentada como se fosse a tradução direta da expressão.", sourceIds: ["bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l02-study-07", kind: "application", title: "Aplicação", body: "Reconhecer a imagem de Deus pede respeito concreto por pessoas e responsabilidade diante da criação. A aplicação começa naquilo que o texto une: dignidade compartilhada e vocação. Ela confronta tanto a desumanização quanto o uso predatório do poder. Aplicações políticas ou sociais específicas exigem argumentos adicionais; a lição não as transforma em mandamento literal, mas oferece critérios bíblicos para avaliá-las.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l02-study-08", kind: "summary-sources", title: "Síntese e fontes", body: "A humanidade recebe de Deus uma identidade comum e uma tarefa responsável. Homem e mulher compartilham essa dignidade; o domínio permanece subordinado ao Criador e à bondade de sua obra. Fonte primária: Gênesis 1:26–31. Critério editorial: Bibliolingo, base editorial e fontes, versão 1. Leituras teológicas são identificadas como interpretações e não como acréscimos ao texto bíblico.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] }
    ]
  },
  "genesis-u01-l03": {
    id: "genesis-u01-l03-study-v1",
    estimatedWords: 700,
    objective: "Relacionar descanso, trabalho, limite e confiança na vocação humana de Gênesis 2.",
    baseText: genesisReference("Gênesis 2:1–17", 2, 1, 17),
    blocks: [
      { id: "genesis-u01-l03-study-01", kind: "base-text-objective", title: "Texto-base e objetivo", body: "Leia Gênesis 2:1–17 em dois movimentos: a conclusão da criação no sétimo dia e a colocação do ser humano no jardim. Observe bênção, santificação, formação, provisão, tarefa e limite. O objetivo é perceber que descanso e trabalho pertencem à criação antes da queda e que liberdade humana aparece dentro de uma relação de confiança com Deus.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l03-study-02", kind: "historical-context", title: "Contexto histórico", body: "O texto apresenta imagens conhecidas de terra, jardim, rios, cultivo e alimento. Tentativas de localizar cada detalhe geográfico produzem propostas diferentes; a lição não depende de identificar o jardim em um mapa moderno. O dado principal é narrativo e teológico: Deus prepara um lugar de vida, forma o ser humano, oferece abundância e lhe confia uma tarefa acompanhada de um limite.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l03-study-03", kind: "literary-context", title: "Contexto literário", body: "Gênesis 2 não precisa ser lido como uma segunda criação concorrente. O foco se aproxima: depois da visão ampla de Gênesis 1, a narrativa acompanha o ser humano, o jardim e as relações. O sétimo dia conclui o movimento anterior; a cena do jardim desenvolve vocação e limite. Ler os capítulos em conjunto ajuda a integrar dignidade, trabalho, descanso e dependência.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l03-study-04", kind: "text-explanation", title: "Descanso que completa", body: "Deus conclui sua obra, descansa, abençoa e santifica o sétimo dia. O descanso divino não sugere cansaço físico; marca conclusão e deleite na obra realizada. O texto estabelece um ritmo em que a atividade não possui a última palavra. A aplicação posterior do sábado na Escritura possui desenvolvimento próprio, mas Gênesis já apresenta tempo recebido, limite e reconhecimento de que o mundo depende de Deus, não do esforço humano.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l03-study-05", kind: "essential-concepts", title: "Cultivar, guardar e obedecer", body: "O ser humano é colocado no jardim para cultivar e guardar. Trabalho aparece como vocação boa antes de se tornar penoso após a queda. A abundância das árvores vem antes da proibição: o limite não apaga a generosidade. O mandamento sobre uma árvore situa liberdade dentro da confiança. A criatura não define autonomamente todo bem e mal; é chamada a receber vida e responsabilidade do Criador.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l03-study-06", kind: "interpretations-limits", title: "Interpretações e limites", body: "Leitores cristãos relacionam o jardim a templo, presença e serviço sacerdotal, especialmente a partir de conexões canônicas. Essas relações podem iluminar o texto, mas exigem argumentação além de uma tradução imediata dos verbos. A perspectiva wesleyana pode ler o limite como espaço de liberdade responsável e resposta à graça; novamente, trata-se de síntese teológica, não de uma expressão denominacional escrita em Gênesis 2.", sourceIds: ["bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l03-study-07", kind: "application", title: "Aplicação", body: "Uma vida formada por esta passagem recebe trabalho sem fazer dele um ídolo, acolhe descanso sem confundi-lo com ausência de propósito e reconhece limites como parte da condição criatural. A pergunta prática não é apenas quanto produzir, mas como cultivar e guardar o que foi confiado. Obediência começa com confiança no caráter generoso de Deus.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l03-study-08", kind: "summary-sources", title: "Síntese e fontes", body: "Gênesis 2:1–17 une conclusão, descanso, provisão, trabalho e limite. A vocação humana é ativa, mas dependente; a liberdade é real, mas responsável. Fonte primária: Gênesis 2:1–17. Critério editorial: Bibliolingo, base editorial e fontes, versão 1. Conexões com sábado, templo e graça são apresentadas como desenvolvimento canônico ou interpretação.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] }
    ]
  },
  "genesis-u01-l04": {
    id: "genesis-u01-l04-study-v1",
    estimatedWords: 680,
    objective: "Interpretar comunhão, auxílio correspondente e unidade sem usar o texto para justificar inferioridade.",
    baseText: genesisReference("Gênesis 2:18–25", 2, 18, 25),
    blocks: [
      { id: "genesis-u01-l04-study-01", kind: "base-text-objective", title: "Texto-base e objetivo", body: "Leia Gênesis 2:18–25 observando o problema declarado, a busca narrativa por correspondência, o reconhecimento final e a conclusão sobre unidade. O objetivo é explicar por que a solidão é chamada de não boa e como a passagem descreve parceria, parentesco e aliança. A lição também identifica limites para evitar transformar o texto em justificativa de inferioridade.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l04-study-02", kind: "historical-context", title: "Contexto histórico", body: "Casamento, família e parentesco possuíam dimensões sociais amplas no mundo antigo. A passagem, porém, começa com uma necessidade humana e com a iniciativa de Deus, não com um tratado completo sobre todas as instituições familiares. Informações culturais podem ajudar, mas não substituem a sequência narrativa. O estudo permanece concentrado no que Gênesis 2 afirma sobre correspondência, reconhecimento e unidade.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l04-study-03", kind: "literary-context", title: "Contexto literário", body: "A expressão não é bom rompe a repetição positiva da criação e cria uma tensão: o ser humano está só. Os animais são apresentados e nomeados, mas nenhum é auxílio correspondente. A mulher é então reconhecida como da mesma humanidade. O poema de reconhecimento resolve a busca; a conclusão do narrador amplia a cena para a união conjugal.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l04-study-04", kind: "text-explanation", title: "Auxílio correspondente", body: "Auxílio não significa automaticamente posição inferior. Na Bíblia, linguagem de auxílio pode descrever socorro forte, inclusive vindo de Deus. Correspondente comunica alguém diante do outro, semelhante e adequado. O foco imediato é parceria que responde à solidão. Usar a expressão isoladamente para justificar servidão ignora o reconhecimento de mesma carne e ossos e a solução narrativa apresentada.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l04-study-05", kind: "essential-concepts", title: "Comunhão, aliança e unidade", body: "A passagem reúne comunhão, diferenciação e unidade. O homem deixa pai e mãe, une-se à mulher e os dois se tornam uma carne. Unidade não apaga pessoalidade; descreve vínculo novo e profundo. A nudez sem vergonha conclui a cena com transparência e segurança antes da queda. O capítulo seguinte mostrará como pecado fere justamente confiança, responsabilidade e comunhão.", sourceIds: ["biblical-text-genesis"] },
      { id: "genesis-u01-l04-study-06", kind: "interpretations-limits", title: "Interpretações e limites", body: "Tradições cristãs discutem como esta passagem se relaciona a papéis no casamento e na igreja. O texto sustenta correspondência, parentesco e unidade; conclusões detalhadas sobre estruturas contemporâneas exigem diálogo com outras passagens. Uma apresentação justa nomeia essas divergências e não chama uma aplicação denominacional de significado lexical inevitável. A identidade wesleyana do aplicativo valoriza santidade relacional, amor e responsabilidade mútua.", sourceIds: ["bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l04-study-07", kind: "application", title: "Aplicação", body: "A comunhão descrita confronta isolamento, uso do outro e relações sustentadas por vergonha. Parceria bíblica envolve reconhecimento da dignidade correspondente, compromisso e responsabilidade. A passagem não autoriza ignorar situações de abuso em nome da unidade; cuidado pastoral responsável protege pessoas e aplica o conjunto do testemunho bíblico sobre amor, justiça e verdade.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] },
      { id: "genesis-u01-l04-study-08", kind: "summary-sources", title: "Síntese e fontes", body: "Gênesis 2:18–25 apresenta a solidão como não boa, descreve auxílio correspondente e celebra unidade de aliança. A mesma humanidade e a parceria são centrais; debates posteriores precisam ser identificados como interpretação. Fonte primária: Gênesis 2:18–25. Critério editorial: Bibliolingo, base editorial e fontes, versão 1.", sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"] }
    ]
  }
};
