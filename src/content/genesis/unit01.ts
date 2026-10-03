import type {
  BibleReference,
  Exercise,
  LearningStep,
  Lesson,
  Unit
} from "../../types/content";

const reference = (label: string, chapter: number, startVerse: number, endVerse = startVerse): BibleReference => ({
  bookId: "genesis",
  startChapter: chapter,
  startVerse,
  endVerse,
  label
});

const learn = (
  id: string,
  title: string,
  body: string,
  layer: LearningStep["layer"],
  verse: BibleReference,
  keyPoints?: string[]
): LearningStep => ({ id, type: "learn", title, body, layer, reference: verse, keyPoints });

const mc = (
  id: string,
  prompt: string,
  options: string[],
  correct: number,
  explanation: string,
  verse: BibleReference,
  conceptId: string,
  difficulty: Exercise["difficulty"],
  objective: string
): Exercise => ({
  id,
  type: "multiple-choice",
  prompt,
  options: options.map((text, index) => ({ id: id + "-a" + (index + 1), text })),
  correctOptionId: id + "-a" + (correct + 1),
  explanation,
  reference: verse,
  conceptId,
  difficulty,
  objective
});

const fill = (
  id: string,
  before: string,
  after: string,
  options: string[],
  correct: number,
  explanation: string,
  verse: BibleReference,
  conceptId: string,
  difficulty: Exercise["difficulty"],
  objective: string
): Exercise => ({
  id,
  type: "fill-choice",
  prompt: "Complete a frase",
  sentenceBefore: before,
  sentenceAfter: after,
  options: options.map((text, index) => ({ id: id + "-a" + (index + 1), text })),
  correctOptionId: id + "-a" + (correct + 1),
  explanation,
  reference: verse,
  conceptId,
  difficulty,
  objective
});

const blocks = (
  id: string,
  prompt: string,
  words: string[],
  correctOrder: number[],
  explanation: string,
  verse: BibleReference,
  conceptId: string,
  difficulty: Exercise["difficulty"],
  objective: string
): Exercise => ({
  id,
  type: "word-blocks",
  prompt,
  blocks: words.map((text, index) => ({ id: id + "-b" + (index + 1), text })),
  correctOrder: correctOrder.map((index) => id + "-b" + (index + 1)),
  explanation,
  reference: verse,
  conceptId,
  difficulty,
  objective
});

const lessons: Lesson[] = [
  {
    id: "genesis-u01-l01",
    contentVersion: 1,
    title: "Deus cria com propósito",
    subtitle: "Ordem, bondade e vida em Gênesis 1",
    estimatedMinutes: 6,
    references: [reference("Gênesis 1:1–25", 1, 1, 25)],
    conceptIds: ["creation", "order", "goodness"],
    steps: [
      learn(
        "genesis-u01-l01-s01",
        "Uma abertura sobre Deus",
        "Gênesis começa apresentando Deus como o Criador. O foco não é explicar cada mecanismo físico, mas afirmar quem dá origem, ordem e propósito a tudo.",
        "biblical-text",
        reference("Gênesis 1:1–2", 1, 1, 2),
        ["Deus antecede a criação", "A criação depende da iniciativa divina"]
      ),
      mc(
        "genesis-u01-l01-q01",
        "Qual afirmação resume melhor a abertura de Gênesis?",
        ["A matéria sempre existiu", "Deus é o Criador de todas as coisas", "O sol criou a vida", "A humanidade organizou o caos"],
        1,
        "Gênesis 1 apresenta Deus como aquele que inicia e governa a criação.",
        reference("Gênesis 1:1", 1, 1),
        "creation",
        "easy",
        "Reconhecer a afirmação teológica central do relato"
      ),
      learn(
        "genesis-u01-l01-s02",
        "Separar, nomear, preencher",
        "O relato avança em uma sequência organizada: Deus separa espaços, dá nomes e depois os preenche. A repetição comunica ordem, intenção e autoridade.",
        "biblical-text",
        reference("Gênesis 1:3–25", 1, 3, 25)
      ),
      fill(
        "genesis-u01-l01-q02",
        "Deus viu tudo quanto fizera, e eis que era muito",
        ".",
        ["antigo", "difícil", "bom", "misterioso"],
        2,
        "A avaliação divina destaca a bondade da criação, não apenas sua existência.",
        reference("Gênesis 1:31", 1, 31),
        "goodness",
        "easy",
        "Identificar a avaliação divina da criação"
      ),
      blocks(
        "genesis-u01-l01-q03",
        "Monte a ideia na ordem correta.",
        ["luz", "Deus", "haja", "disse"],
        [1, 3, 2, 0],
        "A palavra de Deus produz aquilo que ordena; o padrão reaparece ao longo do capítulo.",
        reference("Gênesis 1:3", 1, 3),
        "order",
        "medium",
        "Reconhecer o papel da palavra divina"
      )
    ]
  },
  {
    id: "genesis-u01-l02",
    contentVersion: 1,
    title: "Imagem e semelhança",
    subtitle: "Dignidade, vocação e responsabilidade",
    estimatedMinutes: 7,
    references: [reference("Gênesis 1:26–31", 1, 26, 31)],
    conceptIds: ["image-of-god", "vocation", "stewardship"],
    steps: [
      learn(
        "genesis-u01-l02-s01",
        "Dignidade recebida",
        "Homem e mulher são criados à imagem de Deus. No texto, essa dignidade não pertence apenas a reis ou elites: ela é compartilhada pela humanidade.",
        "biblical-text",
        reference("Gênesis 1:26–27", 1, 26, 27)
      ),
      mc(
        "genesis-u01-l02-q01",
        "Quem é descrito como imagem de Deus em Gênesis 1?",
        ["Somente os governantes", "Somente os sacerdotes", "Homem e mulher", "Os seres celestiais"],
        2,
        "O paralelismo de Gênesis 1:27 inclui explicitamente homem e mulher na mesma dignidade.",
        reference("Gênesis 1:27", 1, 27),
        "image-of-god",
        "easy",
        "Identificar o alcance humano da imagem de Deus"
      ),
      learn(
        "genesis-u01-l02-s02",
        "Representar cuidando",
        "O domínio humano deve ser lido dentro da bondade da criação e da vocação recebida de Deus. É autoridade responsável, não licença para destruir.",
        "application",
        reference("Gênesis 1:28–30", 1, 28, 30),
        ["Representação", "Responsabilidade", "Cuidado da criação"]
      ),
      mc(
        "genesis-u01-l02-q02",
        "Qual leitura combina melhor imagem de Deus e domínio?",
        ["Explorar sem limites", "Representar Deus com responsabilidade", "Evitar qualquer trabalho", "Buscar poder sobre outras pessoas"],
        1,
        "A vocação humana reflete o governo do Criador quando promove cuidado e vida.",
        reference("Gênesis 1:26–28", 1, 26, 28),
        "stewardship",
        "medium",
        "Relacionar dignidade humana e responsabilidade"
      ),
      blocks(
        "genesis-u01-l02-q03",
        "Organize a declaração central.",
        ["imagem", "o ser humano", "Deus", "sua", "criou", "à"],
        [2, 4, 1, 5, 3, 0],
        "A identidade humana começa como dom: ser criado à imagem de Deus.",
        reference("Gênesis 1:27", 1, 27),
        "image-of-god",
        "medium",
        "Fixar a formulação central de Gênesis 1:27"
      )
    ]
  },
  {
    id: "genesis-u01-l03",
    contentVersion: 1,
    title: "Descanso e vocação",
    subtitle: "O sétimo dia e o jardim",
    estimatedMinutes: 7,
    references: [reference("Gênesis 2:1–17", 2, 1, 17)],
    conceptIds: ["sabbath", "work", "obedience"],
    steps: [
      learn(
        "genesis-u01-l03-s01",
        "O descanso completa a obra",
        "O sétimo dia é abençoado e separado. Descanso bíblico não é falta de propósito; é reconhecer a obra de Deus, seus limites e sua presença.",
        "biblical-text",
        reference("Gênesis 2:1–3", 2, 1, 3)
      ),
      fill(
        "genesis-u01-l03-q01",
        "Deus abençoou o",
        "dia e o santificou.",
        ["primeiro", "terceiro", "sexto", "sétimo"],
        3,
        "O sétimo dia recebe destaque especial como conclusão do ritmo da criação.",
        reference("Gênesis 2:3", 2, 3),
        "sabbath",
        "easy",
        "Reconhecer o lugar do sétimo dia"
      ),
      learn(
        "genesis-u01-l03-s02",
        "Cultivar e guardar",
        "Antes da queda, o ser humano já recebe trabalho: cultivar e guardar o jardim. Trabalho e cuidado pertencem à vocação original, embora depois sejam atingidos pelo pecado.",
        "biblical-text",
        reference("Gênesis 2:15", 2, 15)
      ),
      mc(
        "genesis-u01-l03-q02",
        "Qual tarefa é dada ao ser humano no jardim?",
        ["Construir uma cidade", "Cultivar e guardar", "Nomear estrelas", "Procurar outro jardim"],
        1,
        "Gênesis 2:15 une produtividade e proteção na vocação humana.",
        reference("Gênesis 2:15", 2, 15),
        "work",
        "easy",
        "Identificar a vocação humana no jardim"
      ),
      mc(
        "genesis-u01-l03-q03",
        "O mandamento sobre a árvore mostra principalmente que:",
        ["A liberdade humana não possui limites", "A criatura é chamada a confiar e obedecer", "O conhecimento é sempre mau", "O jardim era uma prisão"],
        1,
        "A abundância do jardim vem acompanhada de um limite que convida à confiança no Criador.",
        reference("Gênesis 2:16–17", 2, 16, 17),
        "obedience",
        "hard",
        "Compreender o limite como parte da relação com Deus"
      )
    ]
  },
  {
    id: "genesis-u01-l04",
    contentVersion: 1,
    title: "Comunhão e aliança",
    subtitle: "Solidão, auxílio e unidade",
    estimatedMinutes: 6,
    references: [reference("Gênesis 2:18–25", 2, 18, 25)],
    conceptIds: ["community", "covenant", "dignity"],
    steps: [
      learn(
        "genesis-u01-l04-s01",
        "Não é bom estar só",
        "A primeira realidade chamada de não boa é a solidão humana. A vida criada por Deus aponta para relacionamento, parceria e comunhão.",
        "biblical-text",
        reference("Gênesis 2:18", 2, 18)
      ),
      mc(
        "genesis-u01-l04-q01",
        "O que Deus declara não ser bom em Gênesis 2?",
        ["O trabalho", "O jardim", "O ser humano estar só", "A existência dos animais"],
        2,
        "Gênesis 2:18 destaca a necessidade humana de relação e parceria.",
        reference("Gênesis 2:18", 2, 18),
        "community",
        "easy",
        "Identificar o problema narrativo de Gênesis 2"
      ),
      learn(
        "genesis-u01-l04-s02",
        "Auxílio correspondente",
        "A expressão traduzida como auxílio não indica inferioridade. É uma parceria correspondente, capaz de estar diante do outro com a mesma humanidade e dignidade.",
        "history",
        reference("Gênesis 2:18–23", 2, 18, 23)
      ),
      mc(
        "genesis-u01-l04-q02",
        "No contexto, “auxílio correspondente” comunica:",
        ["Servidão inferior", "Parceria adequada e digna", "Distância permanente", "Competição por autoridade"],
        1,
        "A narrativa celebra reconhecimento mútuo, correspondência e comunhão.",
        reference("Gênesis 2:18–23", 2, 18, 23),
        "dignity",
        "medium",
        "Evitar uma leitura de inferioridade"
      ),
      blocks(
        "genesis-u01-l04-q03",
        "Monte a expressão que resume a união.",
        ["uma", "os", "carne", "dois", "serão", "só"],
        [1, 3, 4, 0, 5, 2],
        "A expressão descreve uma nova unidade de aliança sem apagar a pessoalidade.",
        reference("Gênesis 2:24", 2, 24),
        "covenant",
        "medium",
        "Fixar a linguagem de unidade da passagem"
      )
    ]
  },
  {
    id: "genesis-u01-l05",
    contentVersion: 1,
    title: "A voz da serpente",
    subtitle: "Distorção, desejo e desobediência",
    estimatedMinutes: 7,
    references: [reference("Gênesis 3:1–7", 3, 1, 7)],
    conceptIds: ["temptation", "sin", "shame"],
    steps: [
      learn(
        "genesis-u01-l05-s01",
        "A palavra é distorcida",
        "A serpente começa alterando o mandamento e semeando desconfiança sobre o caráter de Deus. A tentação torna a dádiva invisível e amplia a proibição.",
        "biblical-text",
        reference("Gênesis 3:1–5", 3, 1, 5)
      ),
      mc(
        "genesis-u01-l05-q01",
        "Qual estratégia aparece primeiro na fala da serpente?",
        ["Negar que o jardim existe", "Distorcer a palavra de Deus", "Ordenar a saída do jardim", "Prometer riqueza material"],
        1,
        "A pergunta inicial exagera a proibição e prepara a desconfiança.",
        reference("Gênesis 3:1", 3, 1),
        "temptation",
        "medium",
        "Reconhecer a dinâmica inicial da tentação"
      ),
      learn(
        "genesis-u01-l05-s02",
        "Do desejo ao ato",
        "A narrativa descreve uma progressão: ver, desejar, tomar e comer. Depois, o casal percebe sua nudez e tenta produzir cobertura para a vergonha.",
        "biblical-text",
        reference("Gênesis 3:6–7", 3, 6, 7)
      ),
      blocks(
        "genesis-u01-l05-q02",
        "Ordene a progressão narrativa.",
        ["comeu", "tomou", "viu", "desejou"],
        [2, 3, 1, 0],
        "O texto mostra como a atenção desordenada se transforma em decisão e ação.",
        reference("Gênesis 3:6", 3, 6),
        "sin",
        "hard",
        "Compreender a sequência da desobediência"
      ),
      mc(
        "genesis-u01-l05-q03",
        "Qual é a reação imediata após comerem?",
        ["Constroem um altar", "Fogem do jardim", "Percebem a nudez e fazem coberturas", "Confessam espontaneamente"],
        2,
        "A vergonha e a tentativa de se cobrir aparecem antes do encontro com Deus.",
        reference("Gênesis 3:7", 3, 7),
        "shame",
        "easy",
        "Identificar a consequência narrativa imediata"
      )
    ]
  },
  {
    id: "genesis-u01-l06",
    contentVersion: 1,
    title: "Queda, graça e esperança",
    subtitle: "Deus procura, confronta e cobre",
    estimatedMinutes: 8,
    references: [reference("Gênesis 3:8–24", 3, 8, 24)],
    conceptIds: ["accountability", "grace", "hope"],
    steps: [
      learn(
        "genesis-u01-l06-s01",
        "Onde você está?",
        "Deus procura o ser humano escondido e faz perguntas que expõem a ruptura. Adão culpa Eva; Eva aponta para a serpente. O pecado fragmenta comunhão e responsabilidade.",
        "biblical-text",
        reference("Gênesis 3:8–13", 3, 8, 13)
      ),
      mc(
        "genesis-u01-l06-q01",
        "Como o casal reage à presença de Deus?",
        ["Com celebração", "Escondendo-se", "Com sacrifício", "Saindo para trabalhar"],
        1,
        "A tentativa de esconder-se revela a ruptura causada pela desobediência.",
        reference("Gênesis 3:8", 3, 8),
        "accountability",
        "easy",
        "Reconhecer a ruptura relacional"
      ),
      learn(
        "genesis-u01-l06-s02",
        "Juízo não é a última palavra",
        "As consequências são reais, mas Deus também procura, promete conflito contra o mal e veste o casal. Na leitura wesleyana, essa iniciativa antecipa a graça que busca pessoas antes de sua resposta.",
        "theology",
        reference("Gênesis 3:14–21", 3, 14, 21),
        ["Esta é uma interpretação teológica", "A iniciativa divina precede a restauração humana"]
      ),
      mc(
        "genesis-u01-l06-q02",
        "Qual ação de Deus demonstra cuidado mesmo após a desobediência?",
        ["Apagar a criação", "Ignorar o casal", "Fazer vestimentas para o casal", "Remover toda consequência"],
        2,
        "Gênesis 3:21 registra que Deus providencia vestimentas, um gesto de cuidado em meio ao juízo.",
        reference("Gênesis 3:21", 3, 21),
        "grace",
        "medium",
        "Identificar graça e cuidado na narrativa"
      ),
      mc(
        "genesis-u01-l06-q03",
        "Qual alternativa diferencia corretamente texto e interpretação?",
        ["“Deus fez vestimentas” é texto; “antecipa a graça preveniente” é interpretação", "Ambas são tradução literal", "Ambas são apenas história moderna", "A graça preveniente aparece como termo hebraico"],
        0,
        "A ação de vestir está no relato; relacioná-la à graça preveniente é uma leitura teológica identificada como tal.",
        reference("Gênesis 3:21", 3, 21),
        "hope",
        "hard",
        "Distinguir afirmação textual de interpretação teológica"
      )
    ]
  }
];

const checkpointExercises: Exercise[] = [
  mc("genesis-u01-cp-q01", "Quem é apresentado como Criador?", ["A humanidade", "Deus", "O sol", "O jardim"], 1, "Gênesis abre com a ação criadora de Deus.", reference("Gênesis 1:1", 1, 1), "creation", "easy", "Revisar a afirmação de abertura"),
  mc("genesis-u01-cp-q02", "Imagem de Deus implica principalmente:", ["Dignidade e vocação", "Ausência de limites", "Superioridade de um sexo", "Rejeição do mundo material"], 0, "A imagem de Deus fundamenta dignidade compartilhada e responsabilidade.", reference("Gênesis 1:26–28", 1, 26, 28), "image-of-god", "medium", "Integrar identidade e vocação"),
  fill("genesis-u01-cp-q03", "O ser humano foi colocado no jardim para o cultivar e", ".", ["vender", "abandonar", "guardar", "dividir"], 2, "Cultivar e guardar reúne produção e cuidado.", reference("Gênesis 2:15", 2, 15), "work", "easy", "Revisar a vocação no jardim"),
  mc("genesis-u01-cp-q04", "A primeira realidade chamada de não boa é:", ["A noite", "O limite", "A solidão humana", "O trabalho"], 2, "Gênesis 2:18 destaca que não é bom que o ser humano esteja só.", reference("Gênesis 2:18", 2, 18), "community", "medium", "Reconhecer a importância da comunhão"),
  blocks("genesis-u01-cp-q05", "Ordene a progressão da queda.", ["tomar", "ver", "comer", "desejar"], [1, 3, 0, 2], "A narrativa conduz da percepção ao desejo e à ação.", reference("Gênesis 3:6", 3, 6), "sin", "hard", "Reconstituir a progressão narrativa"),
  mc("genesis-u01-cp-q06", "O que aparece depois da desobediência?", ["Vergonha e ocultação", "Uma nova criação", "Ausência de consequências", "Celebração pública"], 0, "O casal tenta cobrir-se e esconder-se.", reference("Gênesis 3:7–8", 3, 7, 8), "shame", "easy", "Relacionar pecado e ruptura"),
  mc("genesis-u01-cp-q07", "Qual afirmação é interpretação teológica, e não citação direta?", ["Deus fez vestimentas", "O casal se escondeu", "A iniciativa de Deus antecipa a graça preveniente", "A serpente falou"], 2, "A relação com graça preveniente é uma leitura wesleyana explicitamente identificada.", reference("Gênesis 3:8–21", 3, 8, 21), "grace", "hard", "Distinguir camadas de conteúdo"),
  mc("genesis-u01-cp-q08", "Qual tema une Gênesis 1–3?", ["Deus cria, chama e busca a humanidade", "A humanidade não possui responsabilidade", "A criação é apresentada como má", "O descanso é rejeitado"], 0, "Os capítulos unem criação, vocação, ruptura e iniciativa divina.", reference("Gênesis 1–3", 1, 1, 24), "hope", "hard", "Sintetizar a unidade")
];

export const genesisUnit01: Unit = {
  id: "genesis-u01",
  contentVersion: 1,
  title: "O princípio",
  subtitle: "Criação, vocação, queda e esperança",
  bookId: "genesis",
  chapters: [1, 2, 3],
  concepts: [
    ["creation", "Criação", 3], ["order", "Ordem", 2], ["goodness", "Bondade", 3],
    ["image-of-god", "Imagem de Deus", 3], ["vocation", "Vocação", 2], ["stewardship", "Mordomia", 2],
    ["sabbath", "Descanso", 2], ["work", "Trabalho", 2], ["obedience", "Obediência", 3],
    ["community", "Comunhão", 2], ["covenant", "Aliança", 2], ["dignity", "Dignidade", 3],
    ["temptation", "Tentação", 2], ["sin", "Pecado", 3], ["shame", "Vergonha", 2],
    ["accountability", "Responsabilidade", 2], ["grace", "Graça", 3], ["hope", "Esperança", 3]
  ].map(([id, title, importance]) => ({ id: String(id), title: String(title), importance: importance as 1 | 2 | 3 })),
  lessons,
  checkpoint: {
    id: "genesis-u01-checkpoint",
    contentVersion: 1,
    title: "Checkpoint: O princípio",
    subtitle: "Demonstre domínio de Gênesis 1–3",
    passAccuracy: 0.75,
    exercises: checkpointExercises
  },
  sources: [
    {
      id: "biblical-text-genesis",
      title: "Texto bíblico de Gênesis 1–3",
      locator: "Referências; nenhuma tradução integral incorporada"
    }
  ]
};
