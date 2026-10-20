import type {
  BibleReference,
  Exercise,
  LearningStep,
  Lesson,
  MultipleChoiceExercise,
  Unit
} from "../../types/content";

type RefSeed = [label: string, startChapter: number, startVerse?: number, endChapter?: number, endVerse?: number];
type QuizSeed = [
  prompt: string,
  options: [string, string, string, string],
  correct: number,
  explanation: string
];
type FillSeed = [
  before: string,
  after: string,
  options: [string, string, string, string],
  correct: number,
  explanation: string
];

interface LessonSeed {
  title: string;
  subtitle: string;
  reference: RefSeed;
  concept: [id: string, title: string];
  teaching: string;
  application: string;
  keyPoints: [string, string];
  quiz: QuizSeed;
  fill: FillSeed;
}

interface UnitSeed {
  id: string;
  title: string;
  subtitle: string;
  chapters: number[];
  lessons: LessonSeed[];
}

const r = ([label, startChapter, startVerse, endChapter, endVerse]: RefSeed): BibleReference => ({
  bookId: "genesis",
  label,
  startChapter,
  startVerse,
  endChapter,
  endVerse
});

function makeUnit(seed: UnitSeed, unitIndex: number): Unit {
  const lessons: Lesson[] = seed.lessons.map((item, lessonIndex) => {
    const number = String(lessonIndex + 1).padStart(2, "0");
    const id = seed.id + "-l" + number;
    const reference = r(item.reference);
    const difficulty: Exercise["difficulty"] = unitIndex < 3 ? "medium" : unitIndex < 7 ? "medium" : "hard";
    const learnOne: LearningStep = {
      id: id + "-s01",
      type: "learn",
      title: item.subtitle,
      body: item.teaching,
      layer: "biblical-text",
      keyPoints: item.keyPoints,
      reference
    };
    const learnTwo: LearningStep = {
      id: id + "-s02",
      type: "learn",
      title: "Leitura guiada: compreender e viver",
      body:
        item.application +
        " Antes de responder, volte à passagem e observe quem age, qual conflito move a narrativa e que conclusão o próprio texto sustenta.",
      layer: "application",
      keyPoints: [
        "Conceito central: " + item.concept[1],
        "Base textual para a resposta: " + reference.label
      ],
      reference
    };
    const [prompt, optionTexts, correct, explanation] = item.quiz;
    const quizId = id + "-q01";
    const quiz: MultipleChoiceExercise = {
      id: quizId,
      type: "multiple-choice",
      prompt,
      options: optionTexts.map((text, index) => ({ id: quizId + "-a" + (index + 1), text })),
      correctOptionId: quizId + "-a" + (correct + 1),
      explanation,
      reference,
      conceptId: item.concept[0],
      difficulty,
      objective: "Compreender " + item.concept[1].toLowerCase()
    };
    const [before, after, fillOptions, fillCorrect, fillExplanation] = item.fill;
    const fillId = id + "-q02";
    const fill: Exercise = {
      id: fillId,
      type: "fill-choice",
      prompt: "Complete a ideia conforme a passagem",
      sentenceBefore: before,
      sentenceAfter: after,
      options: fillOptions.map((text, index) => ({ id: fillId + "-a" + (index + 1), text })),
      correctOptionId: fillId + "-a" + (fillCorrect + 1),
      explanation: fillExplanation,
      reference,
      conceptId: item.concept[0],
      difficulty,
      objective: "Consolidar " + item.concept[1].toLowerCase()
    };
    return {
      id,
      contentVersion: 2,
      title: item.title,
      subtitle: item.subtitle,
      estimatedMinutes: 8,
      references: [reference],
      conceptIds: [item.concept[0]],
      steps: [learnOne, quiz, learnTwo, fill]
    };
  });

  const checkpointExercises: Exercise[] = lessons.map((lesson, index) => {
    const source = lesson.steps.find((step): step is MultipleChoiceExercise => step.type === "multiple-choice");
    if (!source) throw new Error("Lição sem questão objetiva: " + lesson.id);
    const id = seed.id + "-checkpoint-q" + String(index + 1).padStart(2, "0");
    const correctIndex = source.options.findIndex((option) => option.id === source.correctOptionId);
    return {
      ...source,
      id,
      options: source.options.map((option, optionIndex) => ({ id: id + "-a" + (optionIndex + 1), text: option.text })),
      correctOptionId: id + "-a" + (correctIndex + 1),
      difficulty: "hard",
      objective: "Demonstrar domínio da unidade: " + source.objective
    };
  });

  return {
    id: seed.id,
    contentVersion: 2,
    title: seed.title,
    subtitle: seed.subtitle,
    bookId: "genesis",
    chapters: seed.chapters,
    concepts: seed.lessons.map((lesson) => ({
      id: lesson.concept[0],
      title: lesson.concept[1],
      importance: 3
    })),
    lessons,
    checkpoint: {
      id: seed.id + "-checkpoint",
      contentVersion: 1,
      title: "Checkpoint: " + seed.title,
      subtitle: "Revise os principais movimentos desta unidade.",
      passAccuracy: 0.75,
      exercises: checkpointExercises
    },
    sources: [
      {
        id: seed.id + "-biblical-text",
        title: "Livro de Gênesis",
        locator: seed.lessons.map((lesson) => lesson.reference[0]).join("; ")
      }
    ]
  };
}

const unitSeeds: UnitSeed[] = [
  {
    id: "genesis-u02",
    title: "Depois do Éden",
    subtitle: "Pecado, juízo, aliança e povos em Gênesis 4–11",
    chapters: [4, 5, 6, 7, 8, 9, 10, 11],
    lessons: [
      {
        title: "Caim e Abel",
        subtitle: "O pecado à porta e a responsabilidade humana",
        reference: ["Gênesis 4:1–16", 4, 1, 4, 16],
        concept: ["cain-abel", "Responsabilidade diante do pecado"],
        teaching: "Deus adverte Caim antes do assassinato: o pecado deseja dominá-lo, mas ele é chamado a responder corretamente. Depois do crime, Deus julga Caim e também limita a vingança contra ele.",
        application: "A passagem não reduz o mal a um impulso inevitável. Ela chama à vigilância, à responsabilidade e ao cuidado pelo próximo, sem transformar a proteção de Deus em aprovação do pecado.",
        keyPoints: ["A advertência vem antes do ato", "Juízo e contenção da violência aparecem juntos"],
        quiz: ["O que Deus faz antes de Caim matar Abel?", ["Ignora sua ira", "Adverte sobre o pecado", "Expulsa Abel", "Retira toda escolha"], 1, "Gênesis 4:6–7 registra uma advertência que chama Caim a lidar com sua ira e agir bem."],
        fill: ["Caim perguntou: Sou eu o", "do meu irmão?", ["juiz", "servo", "guardador", "vizinho"], 2, "A pergunta tenta fugir da responsabilidade fraterna que a narrativa evidencia."]
      },
      {
        title: "Duas linhagens",
        subtitle: "Cultura, violência e a caminhada de Enoque",
        reference: ["Gênesis 4:17–5:32", 4, 17, 5, 32],
        concept: ["genealogies-life-death", "Vida, morte e comunhão com Deus"],
        teaching: "As genealogias preservam nomes, continuidade e memória. Em meio ao avanço cultural também cresce a violência de Lameque; em contraste, Enoque é lembrado por andar com Deus.",
        application: "Desenvolvimento humano e maturidade moral não são a mesma coisa. Gênesis convida a avaliar realizações pela fidelidade, pela justiça e pela comunhão com Deus.",
        keyPoints: ["Genealogias conectam gerações", "Enoque contrasta com a escalada de violência"],
        quiz: ["Qual personagem de Gênesis 5 é descrito como alguém que andou com Deus?", ["Lameque", "Enoque", "Jabal", "Tubalcaim"], 1, "Enoque recebe essa descrição singular em Gênesis 5:22–24."],
        fill: ["A repetição nas genealogias lembra que a", "entrou na experiência humana.", ["riqueza", "morte", "cidade", "música"], 1, "A fórmula sobre a morte ressalta a gravidade da ruptura narrada em Gênesis 3."]
      },
      {
        title: "Noé e a aliança",
        subtitle: "Juízo sobre a violência e preservação da vida",
        reference: ["Gênesis 6–9", 6, 1, 9, 29],
        concept: ["noah-covenant", "Aliança com Noé e preservação"],
        teaching: "A violência enche a terra, mas Noé encontra favor diante de Deus e obedece à ordem de construir a arca. Após o dilúvio, Deus estabelece aliança com Noé, seus descendentes e os seres vivos.",
        application: "A história mantém juntas a seriedade do mal, a obediência perseverante e a graça preservadora. O arco aponta para o compromisso divino com a continuidade da criação.",
        keyPoints: ["A violência é o problema moral destacado", "A aliança inclui a criação vivente"],
        quiz: ["Com quem a aliança de Gênesis 9 é estabelecida?", ["Somente com Noé", "Com Noé, seus descendentes e os seres vivos", "Somente com Israel", "Apenas com os animais da arca"], 1, "O texto amplia deliberadamente o alcance da aliança para descendentes e criaturas vivas."],
        fill: ["O sinal da aliança após o dilúvio é o", "nas nuvens.", ["altar", "arco", "incenso", "cajado"], 1, "Gênesis 9 apresenta o arco nas nuvens como sinal da aliança."]
      },
      {
        title: "Nações e Babel",
        subtitle: "Diversidade dos povos e orgulho imperial",
        reference: ["Gênesis 10–11", 10, 1, 11, 32],
        concept: ["babel-nations", "Dispersão das nações e Babel"],
        teaching: "A tabela das nações descreve povos espalhados pela terra. Em Babel, a humanidade busca concentrar poder, fazer um nome para si e evitar a dispersão; Deus confunde a língua e os espalha.",
        application: "A unidade humana pode servir à cooperação ou ao orgulho centralizador. A narrativa questiona projetos que procuram segurança e fama à custa do propósito de Deus.",
        keyPoints: ["Os povos são apresentados em sua diversidade", "Babel concentra poder e busca fama"],
        quiz: ["Qual motivação é declarada pelos construtores de Babel?", ["Servir às nações", "Fazer um nome e evitar a dispersão", "Encontrar Abraão", "Construir uma arca"], 1, "Gênesis 11:4 registra o desejo de fama e de impedir a dispersão."],
        fill: ["Em Babel, Deus confundiu a", "dos construtores.", ["memória", "linhagem", "língua", "visão"], 2, "A confusão das línguas interrompe o projeto centralizador e leva à dispersão."]
      }
    ]
  },
  {
    id: "genesis-u03",
    title: "Chamado e promessa",
    subtitle: "A jornada de Abrão em Gênesis 12–17",
    chapters: [12, 13, 14, 15, 16, 17],
    lessons: [
      {
        title: "Sai da tua terra",
        subtitle: "Chamado para ser bênção",
        reference: ["Gênesis 12", 12, 1, 12, 20],
        concept: ["abram-call", "Chamado e bênção às famílias"],
        teaching: "Deus chama Abrão a deixar terra, parentela e casa paterna. A promessa tem alcance missionário: por meio dele, todas as famílias da terra seriam abençoadas.",
        application: "Fé começa como resposta confiante à iniciativa de Deus. A bênção recebida não termina no indivíduo; ela aponta para o bem de outros povos.",
        keyPoints: ["Abrão responde ao chamado", "A promessa alcança todas as famílias"],
        quiz: ["Qual é o horizonte da promessa feita a Abrão em Gênesis 12?", ["Somente riqueza pessoal", "Bênção para todas as famílias da terra", "Domínio sobre o Egito", "Fim imediato de toda dificuldade"], 1, "A promessa pessoal e familiar está ligada ao propósito de abençoar todas as famílias da terra."],
        fill: ["Abrão partiu como o SENHOR lhe havia", ".", ["ordenado", "escondido", "negado", "esquecido"], 0, "A partida demonstra uma resposta concreta ao chamado divino."]
      },
      {
        title: "Altares e escolhas",
        subtitle: "Abrão, Ló e a terra",
        reference: ["Gênesis 13–14", 13, 1, 14, 24],
        concept: ["abram-lot", "Fé, generosidade e escolhas"],
        teaching: "Abrão permite que Ló escolha primeiro a região onde habitar. Mais tarde, resgata o sobrinho e recusa enriquecer às custas do rei de Sodoma, reconhecendo o Deus Altíssimo.",
        application: "A confiança na promessa liberta Abrão para agir com generosidade. A narrativa também mostra que prosperidade aparente não é o único critério para uma decisão sábia.",
        keyPoints: ["Abrão evita conflito com generosidade", "Ele recusa depender do rei de Sodoma"],
        quiz: ["Como Abrão procura resolver o conflito entre seus pastores e os de Ló?", ["Expulsa Ló", "Oferece a Ló a primeira escolha", "Vende todos os rebanhos", "Pede ajuda ao Egito"], 1, "Abrão propõe separação pacífica e permite que Ló escolha a direção."],
        fill: ["Melquisedeque é apresentado como sacerdote do Deus", ".", ["desconhecido", "Altíssimo", "distante", "local"], 1, "Gênesis 14 liga a bênção de Melquisedeque ao Deus Altíssimo, criador dos céus e da terra."]
      },
      {
        title: "Creu no SENHOR",
        subtitle: "Promessa, fé e aliança",
        reference: ["Gênesis 15", 15, 1, 15, 21],
        concept: ["abram-faith", "Fé e justiça"],
        teaching: "Diante da demora, Abrão expõe sua dúvida. Deus reafirma a promessa, e Abrão crê. A aliança é confirmada por um rito no qual a iniciativa divina fica em primeiro plano.",
        application: "A fé bíblica pode levar perguntas honestas a Deus. Na leitura wesleyana, a resposta humana de fé depende da graça que chama e capacita, sem eliminar a responsabilidade de confiar.",
        keyPoints: ["Abrão apresenta sua inquietação", "Deus reafirma e formaliza a promessa"],
        quiz: ["Como Gênesis 15 descreve a resposta de Abrão à promessa?", ["Ele exigiu um rei", "Ele creu no SENHOR", "Ele voltou para Harã", "Ele abandonou a aliança"], 1, "Gênesis 15:6 une a confiança de Abrão ao reconhecimento de justiça."],
        fill: ["Deus comparou a descendência prometida às", "do céu.", ["nuvens", "aves", "estrelas", "chuvas"], 2, "A imagem das estrelas comunica uma descendência além da capacidade de Abrão contar."]
      },
      {
        title: "Hagar e o sinal",
        subtitle: "O Deus que vê e a aliança marcada",
        reference: ["Gênesis 16–17", 16, 1, 17, 27],
        concept: ["hagar-circumcision", "Deus vê e confirma a aliança"],
        teaching: "Hagar, afligida no deserto, encontra o mensageiro do SENHOR e confessa o Deus que a vê. Depois, Deus muda os nomes de Abrão e Sarai e dá a circuncisão como sinal da aliança.",
        application: "A narrativa não esconde decisões familiares dolorosas. Deus vê a pessoa vulnerável e, ao mesmo tempo, reafirma seu propósito de aliança com Abraão e Sara.",
        keyPoints: ["Hagar é vista por Deus", "Novos nomes acompanham a promessa"],
        quiz: ["Que verdade Hagar reconhece em Gênesis 16?", ["Deus a esqueceu", "Deus é aquele que a vê", "Somente Abrão pode ajudá-la", "O deserto encerrou a promessa"], 1, "Hagar nomeia Deus a partir da experiência de ser vista em sua aflição."],
        fill: ["Abrão passou a chamar-se", ".", ["Israel", "Abraão", "Isaque", "Esaú"], 1, "A mudança de nome acompanha a reafirmação da promessa de muitos descendentes."]
      }
    ]
  },
  {
    id: "genesis-u04",
    title: "A promessa provada",
    subtitle: "Hospitalidade, intercessão e confiança em Gênesis 18–22",
    chapters: [18, 19, 20, 21, 22],
    lessons: [
      {
        title: "Nada é difícil demais",
        subtitle: "A promessa visita a tenda",
        reference: ["Gênesis 18:1–15", 18, 1, 18, 15],
        concept: ["sarah-promise", "Promessa do nascimento de Isaque"],
        teaching: "Abraão acolhe visitantes junto aos carvalhais de Manre. A promessa do filho é reafirmada para Sara, cuja risada revela o choque entre limites humanos e a palavra divina.",
        application: "A pergunta sobre o que seria difícil demais para Deus convida à esperança, sem negar a longa espera nem transformar fé em controle do tempo divino.",
        keyPoints: ["Hospitalidade abre a cena", "A promessa confronta a impossibilidade percebida"],
        quiz: ["Por que Sara ri ao ouvir a promessa?", ["Porque não queria filhos", "Porque considerava impossível em sua idade", "Porque Abraão saiu da tenda", "Porque os visitantes partiram"], 1, "A idade avançada de Sara torna a promessa humanamente improvável."],
        fill: ["A pergunta central é: Haveria coisa alguma", "ao SENHOR?", ["oculta", "difícil", "agradável", "antiga"], 1, "A pergunta retórica orienta o leitor a confiar na capacidade de Deus cumprir a promessa."]
      },
      {
        title: "Intercessão e juízo",
        subtitle: "Abraão diante de Sodoma",
        reference: ["Gênesis 18:16–19:38", 18, 16, 19, 38],
        concept: ["sodom-intercession", "Justiça, misericórdia e intercessão"],
        teaching: "Abraão intercede por Sodoma apelando ao caráter justo de Deus. Gênesis 19 retrata uma sociedade marcada por violência e abuso, e o resgate de Ló acontece em meio ao juízo.",
        application: "A passagem deve ser lida com seriedade moral e cuidado pastoral: ela condena violência, arrogância e opressão, e não autoriza hostilidade contra pessoas usadas como alvo por intérpretes.",
        keyPoints: ["Abraão intercede com reverência", "A violência coletiva recebe juízo"],
        quiz: ["Em que atributo de Deus Abraão baseia sua intercessão?", ["Na indiferença", "Na justiça do Juiz de toda a terra", "Na força de Ló", "Na riqueza da cidade"], 1, "Abraão pergunta se o Juiz de toda a terra não faria justiça."],
        fill: ["Abraão se colocou diante de Deus para", "pela cidade.", ["competir", "interceder", "negociar terras", "pedir riquezas"], 1, "O diálogo de Gênesis 18 é um exemplo marcante de intercessão."]
      },
      {
        title: "O filho da promessa",
        subtitle: "Isaque nasce e Hagar é ouvida",
        reference: ["Gênesis 20–21", 20, 1, 21, 34],
        concept: ["isaac-ishmael", "Fidelidade de Deus em conflitos humanos"],
        teaching: "Apesar das falhas de Abraão em Gerar, Deus preserva Sara. Isaque nasce conforme a promessa. Quando Hagar e Ismael são enviados ao deserto, Deus ouve o menino e provê água.",
        application: "A fidelidade divina não torna corretas todas as ações dos personagens. O texto permite reconhecer falhas reais e, ao mesmo tempo, a atenção de Deus aos que sofrem.",
        keyPoints: ["Isaque nasce no tempo anunciado", "Deus ouve Ismael no deserto"],
        quiz: ["O nome Isaque está ligado a qual reação recorrente na narrativa?", ["Choro", "Riso", "Silêncio", "Temor"], 1, "O nascimento transforma em alegria o riso antes ligado à incredulidade e surpresa."],
        fill: ["No deserto, Deus ouviu a voz do", ".", ["rei", "menino", "servo", "pastor"], 1, "Gênesis 21 destaca que Deus ouviu Ismael e abriu os olhos de Hagar para a provisão."]
      },
      {
        title: "Deus proverá",
        subtitle: "Abraão e Isaque no monte",
        reference: ["Gênesis 22", 22, 1, 22, 24],
        concept: ["binding-isaac", "Provação, obediência e provisão"],
        teaching: "Abraão é provado ao receber a ordem envolvendo Isaque, o filho da promessa. No momento decisivo, Deus impede o sacrifício e provê um carneiro.",
        application: "A narrativa culmina na provisão de Deus, não na legitimação do sacrifício humano. A confiança de Abraão é testada dentro da promessa que o próprio Deus havia dado.",
        keyPoints: ["O texto identifica a cena como prova", "Deus interrompe e provê o sacrifício"],
        quiz: ["O que acontece antes que Abraão fira Isaque?", ["Isaque foge", "O mensageiro de Deus o impede", "Sara chega ao monte", "Abraão muda de lugar"], 1, "A voz divina interrompe a ação, e um carneiro é oferecido no lugar de Isaque."],
        fill: ["Abraão chamou aquele lugar: O SENHOR", ".", ["julgará", "proverá", "ocultará", "partirá"], 1, "O nome do lugar interpreta a experiência pela provisão divina."]
      }
    ]
  },
  {
    id: "genesis-u05",
    title: "A promessa continua",
    subtitle: "Terra, casamento e gerações em Gênesis 23–26",
    chapters: [23, 24, 25, 26],
    lessons: [
      {
        title: "Uma sepultura na terra",
        subtitle: "Luto, dignidade e o campo de Macpela",
        reference: ["Gênesis 23", 23, 1, 23, 20],
        concept: ["sarah-burial", "Luto e posse da terra"],
        teaching: "Abraão chora a morte de Sara e negocia publicamente a compra do campo de Macpela. A primeira propriedade familiar na terra prometida é um lugar de sepultamento.",
        application: "Fé não elimina o luto. Abraão lamenta, honra Sara e age com transparência, ligando esperança futura a uma responsabilidade concreta no presente.",
        keyPoints: ["Abraão lamenta Sara", "A compra é confirmada publicamente"],
        quiz: ["Qual foi a primeira propriedade adquirida por Abraão na terra?", ["Um palácio", "O campo e a caverna de Macpela", "Uma torre", "Um porto"], 1, "Gênesis 23 registra cuidadosamente a compra do campo e da caverna para sepultamento."],
        fill: ["Abraão entrou para", "Sara antes de tratar da sepultura.", ["lamentar e chorar", "esquecer", "substituir", "celebrar"], 0, "O texto reconhece abertamente o luto de Abraão."]
      },
      {
        title: "Rebeca responde",
        subtitle: "Providência e disposição para a jornada",
        reference: ["Gênesis 24", 24, 1, 24, 67],
        concept: ["rebekah-call", "Providência e resposta de Rebeca"],
        teaching: "O servo de Abraão ora por direção e encontra Rebeca, cuja hospitalidade excede o pedido. A família a consulta, e ela decide partir para encontrar Isaque.",
        application: "A providência aparece por meio de oração, caráter, decisões e encontros comuns. Rebeca não é mero objeto da história: sua resposta move a promessa adiante.",
        keyPoints: ["Hospitalidade identifica o caráter de Rebeca", "Rebeca consente em partir"],
        quiz: ["Que ação de Rebeca corresponde ao sinal pedido pelo servo?", ["Oferecer água a ele e aos camelos", "Entregar um mapa", "Vender o rebanho", "Construir um altar"], 0, "A iniciativa de dar água também aos camelos revela generosidade e disposição."],
        fill: ["Ao ser consultada, Rebeca respondeu: Eu", ".", ["ficarei", "irei", "voltarei", "duvidarei"], 1, "Sua resposta direta demonstra participação ativa na jornada."]
      },
      {
        title: "Dois povos no ventre",
        subtitle: "Jacó, Esaú e o valor da primogenitura",
        reference: ["Gênesis 25", 25, 1, 25, 34],
        concept: ["jacob-esau-birthright", "Primogenitura e escolhas imediatas"],
        teaching: "Após a morte de Abraão, a narrativa acompanha Isaque e Rebeca. Os gêmeos Esaú e Jacó já aparecem em tensão, e Esaú troca a primogenitura por uma refeição.",
        application: "Necessidades imediatas podem obscurecer bens de longo alcance. O texto prepara conflitos futuros sem apresentar a manipulação de Jacó como virtude.",
        keyPoints: ["A promessa segue para outra geração", "Esaú despreza a primogenitura"],
        quiz: ["O que Esaú entrega em troca da refeição?", ["Seu arco", "Sua primogenitura", "Sua tenda", "Seu rebanho inteiro"], 1, "Gênesis 25 conclui dizendo que Esaú desprezou a primogenitura."],
        fill: ["Os filhos de Isaque e Rebeca chamavam-se Jacó e", ".", ["José", "Esaú", "Judá", "Ismael"], 1, "Jacó e Esaú tornam-se o centro da geração seguinte."]
      },
      {
        title: "Poços de paz",
        subtitle: "Isaque entre conflito e provisão",
        reference: ["Gênesis 26", 26, 1, 26, 35],
        concept: ["isaac-wells", "Paz, perseverança e provisão"],
        teaching: "Isaque repete parte dos erros de Abraão, mas também recebe a promessa. Diante de disputas por poços, ele se afasta até encontrar espaço e depois firma paz com Abimeleque.",
        application: "Perseverança nem sempre exige vencer toda disputa. Isaque abre mão de confrontos sucessivos sem abandonar o trabalho nem a confiança na provisão de Deus.",
        keyPoints: ["A promessa é reafirmada a Isaque", "Ele busca espaço sem prolongar conflitos"],
        quiz: ["Como Isaque reage às primeiras disputas pelos poços?", ["Inicia uma guerra", "Muda-se e cava novamente", "Abandona a região para sempre", "Entrega seu povo como servos"], 1, "Isaque evita escalar o conflito e continua cavando até encontrar Reobote."],
        fill: ["O poço sem disputa recebeu o nome", ".", ["Betel", "Reobote", "Moriá", "Babel"], 1, "Reobote expressa a ideia de espaço concedido para prosperar."]
      }
    ]
  },
  {
    id: "genesis-u06",
    title: "Jacó em transformação",
    subtitle: "Engano, encontro e retorno em Gênesis 27–31",
    chapters: [27, 28, 29, 30, 31],
    lessons: [
      {
        title: "A bênção tomada",
        subtitle: "Favoritismo e engano dentro da família",
        reference: ["Gênesis 27", 27, 1, 27, 46],
        concept: ["jacob-deception", "Consequências do engano familiar"],
        teaching: "Rebeca e Jacó enganam Isaque para obter a bênção destinada a Esaú. O plano alcança seu objetivo imediato, mas produz dor, ira e separação.",
        application: "Gênesis descreve ações de seus personagens sem aprová-las. A promessa de Deus não transforma meios enganosos em meios justos.",
        keyPoints: ["O favoritismo divide a casa", "O engano produz exílio e ressentimento"],
        quiz: ["Qual consequência imediata do engano leva Jacó a partir?", ["A fome no Egito", "A ameaça de Esaú", "Uma ordem de Faraó", "A perda de todos os rebanhos"], 1, "Esaú planeja matar Jacó, e Rebeca organiza sua partida."],
        fill: ["Jacó se apresentou a Isaque fingindo ser", ".", ["Labão", "Esaú", "Ismael", "José"], 1, "A identidade falsa é o centro do engano narrado."]
      },
      {
        title: "A escada de Betel",
        subtitle: "Presença de Deus no caminho",
        reference: ["Gênesis 28", 28, 1, 28, 22],
        concept: ["bethel-presence", "Presença e promessa em Betel"],
        teaching: "Em fuga e sozinho, Jacó sonha com uma escada entre terra e céu. Deus reafirma a promessa e declara que estará com ele e o fará voltar.",
        application: "A presença de Deus encontra Jacó antes de sua maturidade. Graça preveniente descreve bem essa iniciativa que alcança, chama e sustenta antes de uma resposta plenamente formada.",
        keyPoints: ["Deus reafirma a promessa", "Jacó descobre que Deus está naquele lugar"],
        quiz: ["Que promessa pessoal Deus faz a Jacó em Betel?", ["Nunca enfrentará conflitos", "Estará com ele e o trará de volta", "Será rei do Egito", "Não precisará trabalhar"], 1, "Gênesis 28:15 reúne presença, proteção e retorno."],
        fill: ["Jacó chamou aquele lugar de", ".", ["Betel", "Hebrom", "Siquém", "Gósen"], 0, "Betel significa casa de Deus e marca o encontro no caminho."]
      },
      {
        title: "Lea e Raquel",
        subtitle: "Amor, disputa e o Deus que vê",
        reference: ["Gênesis 29", 29, 1, 29, 35],
        concept: ["leah-rachel", "Deus vê a pessoa desprezada"],
        teaching: "Labão engana Jacó, que se casa primeiro com Lea e depois com Raquel. Em uma família marcada por comparação e dor, Deus vê que Lea é desprezada.",
        application: "A narrativa não idealiza a competição familiar. Ela chama atenção para a dignidade de quem é menos amado e para os danos causados quando pessoas são tratadas como meios.",
        keyPoints: ["O enganador também é enganado", "Deus vê a dor de Lea"],
        quiz: ["Quem engana Jacó na questão dos casamentos?", ["Isaque", "Labão", "Esaú", "José"], 1, "Labão substitui Raquel por Lea e exige novo período de trabalho."],
        fill: ["O texto afirma que o SENHOR viu que", "era desprezada.", ["Raquel", "Lea", "Rebeca", "Hagar"], 1, "Gênesis 29 direciona atenção à dor de Lea."]
      },
      {
        title: "Hora de voltar",
        subtitle: "Trabalho, conflito e separação de Labão",
        reference: ["Gênesis 30–31", 30, 1, 31, 55],
        concept: ["jacob-return", "Retorno e limites no conflito"],
        teaching: "A casa de Jacó cresce em meio a rivalidades, e seus rebanhos prosperam durante o serviço a Labão. Deus manda Jacó voltar, e o conflito termina com uma aliança de limites.",
        application: "Sair de uma relação exploradora pode exigir prudência, confronto e limites claros. A aliança final não apaga o dano, mas impede nova agressão.",
        keyPoints: ["Jacó é chamado a retornar", "O marco estabelece limites entre as famílias"],
        quiz: ["Qual direção Deus dá a Jacó em Gênesis 31?", ["Ir ao Egito", "Voltar à terra de seus pais", "Permanecer para sempre com Labão", "Construir uma cidade"], 1, "O retorno retoma a promessa feita em Betel."],
        fill: ["Jacó e Labão levantaram um", "como testemunho de seus limites.", ["navio", "monte de pedras", "trono", "muro de bronze"], 1, "O marco de pedras testemunha o acordo e a separação."]
      }
    ]
  },
  {
    id: "genesis-u07",
    title: "Encontro e reconciliação",
    subtitle: "Identidade, paz e renovação em Gênesis 32–36",
    chapters: [32, 33, 34, 35, 36],
    lessons: [
      {
        title: "A luta no vau",
        subtitle: "Jacó recebe um novo nome",
        reference: ["Gênesis 32", 32, 1, 32, 32],
        concept: ["jacob-israel", "Novo nome e dependência"],
        teaching: "Temendo o encontro com Esaú, Jacó ora, organiza presentes e passa a noite em luta misteriosa. Ele sai ferido e abençoado, recebendo o nome Israel.",
        application: "Transformação não é apresentada como autossuficiência. Jacó atravessa a noite reconhecendo sua fragilidade e dependendo da bênção que não pode tomar por engano.",
        keyPoints: ["Jacó ora com base na promessa", "O novo nome marca uma identidade transformada"],
        quiz: ["Que novo nome Jacó recebe após a luta?", ["Abraão", "Israel", "Edom", "Benjamim"], 1, "O nome Israel marca o encontro e acompanha o povo que virá de Jacó."],
        fill: ["Jacó chamou o lugar de", "porque disse ter visto Deus face a face.", ["Peniel", "Betel", "Berseba", "Macpela"], 0, "Peniel interpreta o lugar a partir do encontro vivido."]
      },
      {
        title: "Irmãos face a face",
        subtitle: "Esaú corre ao encontro de Jacó",
        reference: ["Gênesis 33", 33, 1, 33, 20],
        concept: ["jacob-esau-reconcile", "Reconciliação entre irmãos"],
        teaching: "Jacó se aproxima com temor, mas Esaú corre, abraça e chora com ele. O reencontro rompe a expectativa de vingança, embora os irmãos mantenham caminhos distintos.",
        application: "Reconciliação pode incluir perdão, humildade e também limites prudentes. A paz não exige fingir que a história dolorosa nunca existiu.",
        keyPoints: ["Esaú responde com abraço", "Os irmãos seguem caminhos distintos em paz"],
        quiz: ["Como Esaú recebe Jacó?", ["Com uma emboscada", "Com abraço e lágrimas", "Com silêncio absoluto", "Com uma cobrança de terras"], 1, "A acolhida de Esaú surpreende Jacó e inverte seu medo de vingança."],
        fill: ["Jacó se inclinou à terra", "vezes ao aproximar-se.", ["três", "cinco", "sete", "doze"], 2, "O gesto repetido comunica humildade diante do irmão."]
      },
      {
        title: "Violência em Siquém",
        subtitle: "Dor real e vingança desmedida",
        reference: ["Gênesis 34", 34, 1, 34, 31],
        concept: ["shechem-violence", "Abuso, vingança e justiça"],
        teaching: "Diná sofre violência, e seus irmãos respondem com engano e massacre contra uma cidade inteira. O capítulo expõe uma cadeia de abuso e vingança sem oferecer os atos dos personagens como modelo.",
        application: "A dor de uma vítima precisa ser levada a sério, mas justiça não se confunde com violência indiscriminada. Leitura responsável deve evitar culpar Diná e deve nomear tanto o abuso quanto a vingança.",
        keyPoints: ["Diná é vítima, não culpada", "A vingança atinge pessoas indiscriminadamente"],
        quiz: ["Como Gênesis 34 apresenta a reação dos irmãos de Diná?", ["Como uma simples conversa", "Como engano seguido de violência coletiva", "Como ordem direta de Deus", "Como reparação pacífica"], 1, "Simeão e Levi usam o acordo como armadilha e atacam a cidade."],
        fill: ["O capítulo exige distinguir justiça de", "indiscriminada.", ["oração", "vingança", "memória", "hospitalidade"], 1, "A resposta dos irmãos amplia a violência em vez de repará-la."]
      },
      {
        title: "Volta a Betel",
        subtitle: "Renovação, perdas e novas gerações",
        reference: ["Gênesis 35–36", 35, 1, 36, 43],
        concept: ["bethel-renewal", "Renovação da aliança e continuidade"],
        teaching: "Jacó remove deuses estrangeiros e retorna a Betel, onde a promessa é reafirmada. A jornada também inclui as mortes de Raquel e Isaque; Gênesis 36 registra a linhagem de Esaú.",
        application: "Renovação espiritual envolve abandonar lealdades rivais e retornar ao chamado. A fidelidade atravessa perdas e reconhece que outras famílias também possuem história e lugar.",
        keyPoints: ["Betel se torna lugar de renovação", "As genealogias preservam também a linhagem de Esaú"],
        quiz: ["Que preparação Jacó ordena antes de subir a Betel?", ["Construir um exército", "Remover deuses estrangeiros e purificar-se", "Voltar a Labão", "Vender toda a terra"], 1, "A casa de Jacó abandona os ídolos antes de renovar o culto em Betel."],
        fill: ["Raquel deu ao filho o nome Benoni, mas Jacó o chamou", ".", ["Benjamim", "Judá", "Levi", "Dã"], 0, "Benjamim é o filho mais novo de Jacó, nascido no caminho."]
      }
    ]
  },
  {
    id: "genesis-u08",
    title: "José: da cova ao palácio",
    subtitle: "Providência e fidelidade em Gênesis 37–41",
    chapters: [37, 38, 39, 40, 41],
    lessons: [
      {
        title: "Sonhos e uma túnica",
        subtitle: "Favoritismo, inveja e José vendido",
        reference: ["Gênesis 37", 37, 1, 37, 36],
        concept: ["joseph-sold", "Favoritismo e inveja"],
        teaching: "O favoritismo de Jacó e os sonhos de José intensificam o ódio dos irmãos. Eles o lançam numa cova, vendem-no e enganam o pai com a túnica manchada.",
        application: "Famílias feridas podem repetir padrões antigos. O capítulo permite reconhecer como favoritismo, inveja e mentira se combinam para desumanizar o irmão.",
        keyPoints: ["O favoritismo alimenta a rivalidade", "José é vendido e levado ao Egito"],
        quiz: ["O que os irmãos fazem com José depois de tirá-lo da cova?", ["Coroam-no líder", "Vendem-no a mercadores", "Levam-no de volta ao pai", "Mandam-no para Betel"], 1, "José é vendido e termina no Egito, enquanto os irmãos enganam Jacó."],
        fill: ["Os irmãos usaram a", "para enganar o pai.", ["túnica", "carta", "tenda", "arca"], 0, "A túnica manchada se torna a falsa evidência apresentada a Jacó."]
      },
      {
        title: "Judá e Tamar",
        subtitle: "Responsabilidade reconhecida",
        reference: ["Gênesis 38", 38, 1, 38, 30],
        concept: ["judah-tamar", "Responsabilidade e justiça para Tamar"],
        teaching: "Judá deixa de assegurar a Tamar a proteção familiar que havia prometido. Quando os fatos são revelados, ele reconhece: ela é mais justa do que eu.",
        application: "A narrativa expõe a vulnerabilidade de Tamar e a falha de Judá. Arrependimento começa quando alguém deixa de condenar o outro e reconhece a própria responsabilidade.",
        keyPoints: ["Judá falha em cumprir seu dever", "Ele reconhece publicamente sua culpa"],
        quiz: ["O que Judá reconhece quando vê os objetos apresentados por Tamar?", ["Que Tamar era estrangeira", "Que ela era mais justa do que ele", "Que Selá já era rei", "Que José havia voltado"], 1, "Judá admite que não cumpriu sua responsabilidade para com Tamar."],
        fill: ["Tamar preservou como prova o selo, o cordão e o", "de Judá.", ["cajado", "manto", "anel de ouro", "sapato"], 0, "Os objetos identificam Judá e tornam possível a verdade vir à luz."]
      },
      {
        title: "Fiel na casa e na prisão",
        subtitle: "José resiste e Deus permanece com ele",
        reference: ["Gênesis 39", 39, 1, 39, 23],
        concept: ["joseph-integrity", "Integridade em circunstâncias injustas"],
        teaching: "José serve com competência na casa de Potifar e recusa a proposta da mulher de seu senhor. Acusado falsamente, vai para a prisão, onde o SENHOR continua com ele.",
        application: "Integridade não garante recompensa imediata. A presença de Deus sustenta José tanto no sucesso quanto na injustiça que ele não causou.",
        keyPoints: ["José recusa trair a confiança recebida", "A presença divina continua na prisão"],
        quiz: ["Qual razão José apresenta para recusar a proposta da mulher de Potifar?", ["Temia viajar", "Não queria pecar contra Deus e trair a confiança", "Planejava voltar a Canaã", "Não compreendia a língua"], 1, "José entende o ato como mal contra seu senhor e pecado contra Deus."],
        fill: ["Mesmo na prisão, o SENHOR estava com", ".", ["Potifar", "José", "Faraó", "Judá"], 1, "A frase repetida sustenta o tema da presença divina em condições adversas."]
      },
      {
        title: "Sonhos diante de Faraó",
        subtitle: "Sabedoria para preservar vidas",
        reference: ["Gênesis 40–41", 40, 1, 41, 57],
        concept: ["joseph-pharaoh", "Sabedoria e providência no Egito"],
        teaching: "José interpreta sonhos na prisão, é esquecido por um tempo e depois chamado por Faraó. Ele atribui a interpretação a Deus e propõe um plano para os anos de fome.",
        application: "Dom recebido se torna serviço público. José não apenas explica o problema; oferece administração prudente para preservar vidas durante a crise.",
        keyPoints: ["José atribui a interpretação a Deus", "A sabedoria resulta em planejamento responsável"],
        quiz: ["A quem José atribui a resposta aos sonhos de Faraó?", ["À magia egípcia", "A Deus", "Ao copeiro", "À própria experiência"], 1, "José recusa tomar para si o crédito e afirma que Deus dará resposta."],
        fill: ["Os sete anos de abundância seriam seguidos por sete anos de", ".", ["guerra", "fome", "chuva", "festa"], 1, "O planejamento de José responde à fome representada nos sonhos."]
      }
    ]
  },
  {
    id: "genesis-u09",
    title: "Reconciliação e provisão",
    subtitle: "José reencontra sua família em Gênesis 42–47",
    chapters: [42, 43, 44, 45, 46, 47],
    lessons: [
      {
        title: "Os irmãos descem ao Egito",
        subtitle: "Memória, culpa e prova",
        reference: ["Gênesis 42", 42, 1, 42, 38],
        concept: ["brothers-return", "Consciência e verdade"],
        teaching: "A fome leva os irmãos ao Egito, onde se curvam diante de José sem reconhecê-lo. Quando são postos à prova, eles relacionam a angústia presente ao que fizeram contra o irmão.",
        application: "Culpa reconhecida pode abrir caminho para arrependimento, mas José ainda procura saber se houve mudança real. Reconciliação responsável busca verdade, não apenas alívio rápido.",
        keyPoints: ["Os sonhos antigos começam a se cumprir", "Os irmãos reconhecem sua culpa"],
        quiz: ["Por que os irmãos vão ao Egito?", ["Para conquistar terras", "Para comprar alimento durante a fome", "Para procurar Esaú", "Para servir a Faraó"], 1, "A fome em Canaã os leva aos celeiros administrados por José."],
        fill: ["José exigiu que trouxessem o irmão mais novo, chamado", ".", ["Benjamim", "Levi", "Dã", "Rúben"], 0, "A presença de Benjamim torna-se parte central da prova."]
      },
      {
        title: "Judá se oferece",
        subtitle: "Responsabilidade no lugar do irmão",
        reference: ["Gênesis 43–44", 43, 1, 44, 34],
        concept: ["judah-substitution", "Mudança de caráter e responsabilidade"],
        teaching: "Judá assume responsabilidade por Benjamim e, diante de José, oferece-se como escravo no lugar do irmão para poupar a dor do pai.",
        application: "O Judá que antes participou da venda de José agora aceita sofrer pelo irmão. Mudança de caráter se torna visível quando escolhas novas enfrentam situações parecidas.",
        keyPoints: ["Judá garante a segurança de Benjamim", "Ele se oferece no lugar do irmão"],
        quiz: ["O que Judá propõe ao final de Gênesis 44?", ["Abandonar Benjamim", "Ficar como escravo no lugar de Benjamim", "Lutar contra o Egito", "Esconder a taça novamente"], 1, "A oferta de Judá demonstra responsabilidade e mudança em relação ao passado."],
        fill: ["Judá teme que a perda de Benjamim leve seu", "à morte de tristeza.", ["pai", "servo", "filho", "rei"], 0, "Seu discurso considera a dor de Jacó, não apenas a própria segurança."]
      },
      {
        title: "Eu sou José",
        subtitle: "Verdade, lágrimas e reconciliação",
        reference: ["Gênesis 45", 45, 1, 45, 28],
        concept: ["joseph-reveals", "Reconciliação e providência"],
        teaching: "José revela sua identidade em lágrimas e manda os irmãos se aproximarem. Ele reconhece a maldade que sofreu, mas também percebe a providência de Deus preservando vidas.",
        application: "Providência não chama o mal de bem nem absolve automaticamente os responsáveis. Ela afirma que Deus pode agir redentoramente sem ser o autor da violência humana.",
        keyPoints: ["José nomeia o que os irmãos fizeram", "Ele vê um propósito de preservação além do mal"],
        quiz: ["Como José interpreta sua presença no Egito?", ["Como prova de que os irmãos agiram bem", "Como meio usado por Deus para preservar vidas", "Como abandono completo da promessa", "Como acaso sem significado"], 1, "José distingue a ação culpável dos irmãos do propósito preservador de Deus."],
        fill: ["José disse aos irmãos: Eu sou", ".", ["Moisés", "José", "Faraó", "Israel"], 1, "A revelação direta transforma a cena e inicia a reconciliação."]
      },
      {
        title: "Israel desce ao Egito",
        subtitle: "Gósen, provisão e tensão econômica",
        reference: ["Gênesis 46–47", 46, 1, 47, 31],
        concept: ["jacob-egypt", "Preservação da família no Egito"],
        teaching: "Deus encoraja Jacó a descer ao Egito e promete acompanhá-lo. A família se estabelece em Gósen; durante a fome, José administra alimentos e amplia o poder econômico de Faraó.",
        application: "A passagem combina cuidado providencial com uma política econômica de forte concentração. Leitura madura pode reconhecer a preservação da família e também examinar criticamente seus efeitos sociais.",
        keyPoints: ["Deus promete acompanhar Jacó ao Egito", "A família recebe terra em Gósen"],
        quiz: ["Que segurança Deus dá a Jacó antes da descida ao Egito?", ["Que não haverá fome", "Que estará com ele e fará dele uma grande nação", "Que voltará no dia seguinte", "Que Faraó deixará o trono"], 1, "Gênesis 46 reafirma presença e promessa na mudança para o Egito."],
        fill: ["A família de Jacó se estabeleceu na região de", ".", ["Gósen", "Babel", "Moriá", "Edom"], 0, "Gósen torna-se o lugar de habitação da família no Egito."]
      }
    ]
  },
  {
    id: "genesis-u10",
    title: "Bênção e esperança",
    subtitle: "O encerramento de Gênesis em capítulos 48–50",
    chapters: [48, 49, 50],
    lessons: [
      {
        title: "Efraim e Manassés",
        subtitle: "Bênção que inverte expectativas",
        reference: ["Gênesis 48", 48, 1, 48, 22],
        concept: ["ephraim-manasseh", "Bênção da geração seguinte"],
        teaching: "Jacó adota Efraim e Manassés como seus e cruza as mãos ao abençoá-los, dando precedência ao mais novo. José tenta corrigir o gesto, mas Jacó insiste conscientemente.",
        application: "Gênesis repete inversões que mostram a liberdade da graça diante das convenções humanas. Isso não autoriza favoritismo; lembra que bênção não é posse controlada por status.",
        keyPoints: ["Os filhos de José são incorporados à família", "Jacó abençoa conscientemente o mais novo"],
        quiz: ["Qual filho de José recebe a mão direita de Jacó?", ["Manassés", "Efraim", "Benjamim", "Judá"], 1, "Jacó cruza as mãos e dá a Efraim a posição de destaque."],
        fill: ["Jacó declarou que Efraim e Manassés seriam seus como Rúben e", ".", ["Simeão", "José", "Levi", "Dã"], 0, "A declaração incorpora os dois filhos de José entre as tribos."]
      },
      {
        title: "Palavras sobre os filhos",
        subtitle: "Caráter, consequências e futuro",
        reference: ["Gênesis 49", 49, 1, 49, 33],
        concept: ["jacob-blessings", "Bênçãos e futuro das tribos"],
        teaching: "Jacó reúne os filhos e pronuncia palavras que combinam bênção, avaliação de caráter e perspectiva futura. Judá recebe destaque real; José recebe uma bênção de fecundidade.",
        application: "As palavras finais levam a sério escolhas passadas e possibilidades futuras. Herança espiritual não apaga responsabilidade moral.",
        keyPoints: ["As palavras diferem para cada filho", "Judá e José recebem destaque particular"],
        quiz: ["Qual filho é associado ao cetro na bênção de Gênesis 49?", ["Judá", "Rúben", "Dã", "Naftali"], 0, "A imagem do cetro em Judá se torna importante na leitura canônica posterior."],
        fill: ["Jacó pediu para ser sepultado na caverna de", ".", ["Macpela", "Adulão", "Babel", "Gósen"], 0, "O pedido liga o fim de Jacó à propriedade adquirida por Abraão em Gênesis 23."]
      },
      {
        title: "Luto e sepultamento",
        subtitle: "A família leva Jacó de volta a Canaã",
        reference: ["Gênesis 50:1–14", 50, 1, 50, 14],
        concept: ["jacob-burial", "Luto, memória e promessa"],
        teaching: "José chora por Jacó, e um grande cortejo leva o corpo até a caverna de Macpela. Mesmo vivendo no Egito, a família mantém a ligação com a terra prometida.",
        application: "Ritos de luto preservam memória e permitem que uma comunidade atravesse a perda. A esperança futura não elimina a necessidade de chorar e honrar quem morreu.",
        keyPoints: ["José lamenta seu pai", "O sepultamento cumpre o pedido de Jacó"],
        quiz: ["Onde Jacó é sepultado?", ["No palácio de Faraó", "Na caverna de Macpela", "Junto ao Nilo", "Em Siquém"], 1, "A família cumpre o pedido e o sepulta no túmulo ancestral em Canaã."],
        fill: ["O cortejo saiu do", "para sepultar Jacó em Canaã.", ["Egito", "deserto de Parã", "monte Sinai", "vale do Jordão"], 0, "A viagem pública honra Jacó e reafirma a ligação familiar com Canaã."]
      },
      {
        title: "Deus tornou em bem",
        subtitle: "Perdão, providência e esperança do êxodo",
        reference: ["Gênesis 50:15–26", 50, 15, 50, 26],
        concept: ["joseph-forgiveness", "Perdão e esperança futura"],
        teaching: "Após a morte de Jacó, os irmãos temem vingança. José chora, recusa ocupar o lugar de Deus e reafirma cuidado. Antes de morrer, pede que seus ossos sejam levados quando Deus visitar o povo.",
        application: "José não nega a intenção má dos irmãos; afirma que Deus a encaminhou para preservação. O perdão renuncia à vingança e assume compromisso concreto com o bem.",
        keyPoints: ["José distingue mal humano e propósito divino", "Seus ossos apontam para a saída futura do Egito"],
        quiz: ["Como José responde ao medo de vingança dos irmãos?", ["Ordena sua prisão", "Promete sustentá-los e fala com bondade", "Expulsa-os de Gósen", "Recusa qualquer conversa"], 1, "José renuncia à vingança e confirma cuidado para os irmãos e seus filhos."],
        fill: ["José pediu que levassem seus", "quando Deus conduzisse o povo para fora.", ["livros", "ossos", "rebanhos", "tesouros"], 1, "O pedido final expressa confiança no cumprimento futuro da promessa."]
      }
    ]
  }
];

export const genesisExpandedUnits: Unit[] = unitSeeds.map(makeUnit);
