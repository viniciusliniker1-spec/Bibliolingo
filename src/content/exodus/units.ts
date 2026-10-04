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
type PracticeSeed =
  | [
      kind: "fill",
      before: string,
      after: string,
      options: [string, string, string, string],
      correct: number,
      explanation: string
    ]
  | [
      kind: "blocks",
      prompt: string,
      correctWords: string[],
      shuffledIndexes: number[],
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
  practice: PracticeSeed;
}

interface UnitSeed {
  id: string;
  title: string;
  subtitle: string;
  chapters: number[];
  lessons: LessonSeed[];
}

const reference = ([label, startChapter, startVerse, endChapter, endVerse]: RefSeed): BibleReference => ({
  bookId: "exodus",
  label,
  startChapter,
  startVerse,
  endChapter,
  endVerse
});

function makePractice(seed: PracticeSeed, id: string, bibleReference: BibleReference, conceptId: string, difficulty: Exercise["difficulty"]): Exercise {
  if (seed[0] === "fill") {
    const [, sentenceBefore, sentenceAfter, optionTexts, correct, explanation] = seed;
    return {
      id,
      type: "fill-choice",
      prompt: "Complete a ideia conforme a passagem",
      sentenceBefore,
      sentenceAfter,
      options: optionTexts.map((text, index) => ({ id: id + "-a" + (index + 1), text })),
      correctOptionId: id + "-a" + (correct + 1),
      explanation,
      reference: bibleReference,
      conceptId,
      difficulty,
      objective: "Consolidar o conceito estudado por meio do texto bíblico"
    };
  }

  const [, prompt, correctWords, shuffledIndexes, explanation] = seed;
  return {
    id,
    type: "word-blocks",
    prompt,
    blocks: shuffledIndexes.map((originalIndex) => ({
      id: id + "-w" + (originalIndex + 1),
      text: correctWords[originalIndex]
    })),
    correctOrder: correctWords.map((_, index) => id + "-w" + (index + 1)),
    explanation,
    reference: bibleReference,
    conceptId,
    difficulty,
    objective: "Reconstruir uma afirmação central da passagem"
  };
}

function makeUnit(seed: UnitSeed, unitIndex: number): Unit {
  const difficulty: Exercise["difficulty"] = unitIndex < 2 ? "easy" : unitIndex < 6 ? "medium" : "hard";
  const lessons: Lesson[] = seed.lessons.map((item, lessonIndex) => {
    const lessonNumber = String(lessonIndex + 1).padStart(2, "0");
    const id = seed.id + "-l" + lessonNumber;
    const bibleReference = reference(item.reference);
    const learnOne: LearningStep = {
      id: id + "-s01",
      type: "learn",
      title: item.subtitle,
      body: item.teaching,
      layer: "biblical-text",
      keyPoints: item.keyPoints,
      reference: bibleReference
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
      reference: bibleReference,
      conceptId: item.concept[0],
      difficulty,
      objective: "Compreender " + item.concept[1].toLocaleLowerCase("pt-BR")
    };
    const learnTwo: LearningStep = {
      id: id + "-s02",
      type: "learn",
      title: "Compreender e responder",
      body:
        item.application +
        " Observe novamente a referência: identifique o que o texto afirma, o que ele revela no fluxo de Êxodo e como isso orienta uma aplicação responsável.",
      layer: "application",
      keyPoints: [
        "Conceito central: " + item.concept[1],
        "Base textual: " + bibleReference.label
      ],
      reference: bibleReference
    };
    const practice = makePractice(
      item.practice,
      id + "-q02",
      bibleReference,
      item.concept[0],
      difficulty
    );

    return {
      id,
      contentVersion: 1,
      title: item.title,
      subtitle: item.subtitle,
      estimatedMinutes: 8,
      references: [bibleReference],
      conceptIds: [item.concept[0]],
      steps: [learnOne, quiz, learnTwo, practice]
    };
  });

  const checkpointExercises: Exercise[] = lessons.map((lesson, index) => {
    const source = lesson.steps.find((step): step is MultipleChoiceExercise => step.type === "multiple-choice");
    if (!source) throw new Error("Lição sem questão de checkpoint: " + lesson.id);
    const id = seed.id + "-checkpoint-q" + String(index + 1).padStart(2, "0");
    const correctIndex = source.options.findIndex((option) => option.id === source.correctOptionId);
    return {
      ...source,
      id,
      options: source.options.map((option, optionIndex) => ({
        id: id + "-a" + (optionIndex + 1),
        text: option.text
      })),
      correctOptionId: id + "-a" + (correctIndex + 1),
      difficulty: "hard",
      objective: "Demonstrar domínio da unidade: " + source.objective
    };
  });

  return {
    id: seed.id,
    contentVersion: 1,
    title: seed.title,
    subtitle: seed.subtitle,
    bookId: "exodus",
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
      subtitle: "Integre os movimentos centrais desta unidade de Êxodo.",
      passAccuracy: 0.75,
      exercises: checkpointExercises
    },
    sources: [
      {
        id: seed.id + "-biblical-text",
        title: "Livro de Êxodo",
        locator: seed.lessons.map((lesson) => lesson.reference[0]).join("; ")
      }
    ]
  };
}

const unitSeeds: UnitSeed[] = [
  {
    id: "exodus-u01",
    title: "Servidão e chamado",
    subtitle: "Deus ouve o povo e chama Moisés em Êxodo 1–4",
    chapters: [1, 2, 3, 4],
    lessons: [
      {
        title: "Parteiras que temem a Deus",
        subtitle: "Opressão, resistência e preservação da vida",
        reference: ["Êxodo 1", 1, 1, 1, 22],
        concept: ["ex-oppression-midwives", "Temor de Deus diante da opressão"],
        teaching: "Um novo rei transforma a fecundidade de Israel em ameaça política e impõe trabalho forçado. Sifrá e Puá recebem ordem para matar os meninos hebreus, mas temem a Deus e preservam a vida, resistindo a um decreto injusto.",
        application: "Êxodo começa mostrando que poder estatal não torna uma ordem moralmente correta. A fidelidade das parteiras é concreta: elas protegem pessoas vulneráveis mesmo sob risco.",
        keyPoints: ["Faraó usa medo e trabalho forçado", "As parteiras preservam a vida"],
        quiz: ["Por que as parteiras não cumpriram a ordem de Faraó?", ["Temeram a Deus", "Esqueceram a ordem", "Saíram do Egito", "Receberam pagamento de Israel"], 0, "Êxodo 1:17 declara que elas temeram a Deus e não fizeram como o rei ordenara."],
        practice: ["fill", "As parteiras deixaram viver os", "hebreus.", ["reis", "meninos", "soldados", "sacerdotes"], 1, "A preservação dos meninos é o ato de resistência destacado no capítulo."]
      },
      {
        title: "Das águas ao deserto",
        subtitle: "Moisés é preservado e confronta a injustiça",
        reference: ["Êxodo 2", 2, 1, 2, 25],
        concept: ["ex-moses-preserved", "Preservação e formação de Moisés"],
        teaching: "A mãe de Moisés o coloca num cesto entre os juncos; a filha de Faraó o acolhe e sua própria mãe participa de seus primeiros anos. Adulto, Moisés reage à violência contra um hebreu, foge para Midiã e forma ali uma família.",
        application: "O zelo de Moisés contra a opressão aparece antes de sua maturidade como libertador. O capítulo não idealiza sua violência; prepara uma liderança que ainda precisará ser formada por Deus.",
        keyPoints: ["Moisés é preservado por uma rede de mulheres", "Sua fuga o leva a Midiã"],
        quiz: ["Quem encontrou o cesto de Moisés junto ao rio?", ["A filha de Faraó", "Miriã adulta", "Zípora", "A esposa de Arão"], 0, "A filha de Faraó encontra a criança, reconhece que é hebreia e decide criá-la."],
        practice: ["blocks", "Monte a sequência central do fim do capítulo", ["Deus", "ouviu", "o clamor", "do povo"], [2, 0, 3, 1], "Êxodo 2:23–25 apresenta Deus ouvindo, lembrando-se da aliança, vendo e conhecendo a aflição."]
      },
      {
        title: "A sarça e o Nome",
        subtitle: "O Deus da aliança chama Moisés",
        reference: ["Êxodo 3", 3, 1, 3, 22],
        concept: ["ex-burning-bush", "Presença, nome e missão de Deus"],
        teaching: "No Horebe, a sarça arde sem se consumir. Deus se identifica como o Deus de Abraão, Isaque e Jacó, afirma ter visto a aflição do povo e chama Moisés para conduzi-lo para fora do Egito.",
        application: "A santidade divina não é distância indiferente: Deus vê, ouve, conhece e desce para libertar. O nome revelado sustenta a missão na presença fiel de Deus, não na autoconfiança de Moisés.",
        keyPoints: ["O lugar é santo por causa da presença de Deus", "O chamado nasce do clamor ouvido"],
        quiz: ["Qual missão Moisés recebe junto à sarça?", ["Construir um palácio", "Tirar Israel do Egito", "Tornar-se sacerdote de Midiã", "Conquistar Canaã sozinho"], 1, "Deus envia Moisés a Faraó para conduzir os israelitas para fora do Egito."],
        practice: ["fill", "Deus disse a Moisés: EU", "O QUE SOU.", ["TENHO", "SOU", "FAÇO", "VEJO"], 1, "Êxodo 3:14 relaciona o nome divino à presença soberana e fiel de Deus."]
      },
      {
        title: "Objeções e retorno",
        subtitle: "Deus responde às limitações do mensageiro",
        reference: ["Êxodo 4", 4, 1, 4, 31],
        concept: ["ex-moses-objections", "Chamado, capacitação e parceria"],
        teaching: "Moisés pergunta se o povo acreditará, diz ter dificuldade para falar e pede que outro seja enviado. Deus oferece sinais, promete ensinar o que dizer e associa Arão à missão. Moisés então retorna ao Egito.",
        application: "A narrativa leva limitações humanas a sério, mas não permite que elas sejam a palavra final. Deus capacita e também usa parceria; vocação não precisa significar isolamento.",
        keyPoints: ["Deus responde às objeções de Moisés", "Arão participa da missão"],
        quiz: ["Quem é designado para falar com Moisés diante do povo?", ["Josué", "Arão", "Jetro", "Calebe"], 1, "Arão, irmão de Moisés, torna-se seu porta-voz, enquanto Deus orienta ambos."],
        practice: ["blocks", "Monte a resposta do povo à notícia da libertação", ["O povo", "creu", "e adorou", "ao SENHOR"], [1, 3, 0, 2], "Ao saber que Deus visitara os israelitas e vira sua aflição, o povo se inclina e adora."]
      }
    ]
  },
  {
    id: "exodus-u02",
    title: "Deus enfrenta Faraó",
    subtitle: "Confronto, sinais e juízos em Êxodo 5–10",
    chapters: [5, 6, 7, 8, 9, 10],
    lessons: [
      {
        title: "Quando o peso aumenta",
        subtitle: "A primeira audiência e a crise dos tijolos",
        reference: ["Êxodo 5", 5, 1, 5, 23],
        concept: ["ex-bricks-crisis", "Fidelidade em meio ao agravamento da crise"],
        teaching: "Moisés e Arão pedem que Faraó deixe o povo celebrar uma festa ao SENHOR. Faraó responde aumentando o trabalho e retirando a palha dos tijolos. Os oficiais israelitas culpam os líderes, e Moisés leva sua perplexidade a Deus.",
        application: "Obedecer não produz sempre melhora imediata. A oração de Moisés mostra que a fé pode apresentar a Deus o choque entre promessa e sofrimento sem fingir que a crise não existe.",
        keyPoints: ["Faraó aumenta a carga de trabalho", "Moisés leva sua queixa a Deus"],
        quiz: ["O que Faraó retira dos trabalhadores sem reduzir a cota?", ["Água", "Palha", "Ferramentas", "Alimento"], 1, "A palha deixa de ser fornecida, mas a quantidade exigida de tijolos permanece."],
        practice: ["fill", "Moisés voltou-se ao", "com sua queixa.", ["povo", "SENHOR", "deserto", "palácio"], 1, "Ao final do capítulo, Moisés dirige a Deus sua pergunta sobre o sofrimento agravado."]
      },
      {
        title: "Eu vos tirarei",
        subtitle: "Promessa renovada e missão reafirmada",
        reference: ["Êxodo 6:1–7:7", 6, 1, 7, 7],
        concept: ["ex-covenant-promise", "Promessa de redenção e aliança"],
        teaching: "Deus reafirma seu nome e sua aliança, prometendo tirar, livrar, resgatar e tomar Israel como seu povo. A genealogia situa Moisés e Arão dentro da família de Levi antes de retomarem a missão.",
        application: "A esperança do êxodo se apoia no caráter e na aliança de Deus. O povo, abatido pela dura servidão, ainda não consegue ouvir; a promessa, porém, não depende de entusiasmo superficial.",
        keyPoints: ["A promessa usa verbos de ação divina", "Moisés e Arão têm lugar numa história familiar"],
        quiz: ["Por que o povo não ouviu Moisés em Êxodo 6?", ["Porque já estava livre", "Por angústia de espírito e dura servidão", "Porque não conhecia Arão", "Por falta de sinais"], 1, "O texto reconhece que opressão prolongada pode esmagar a capacidade de acolher esperança."],
        practice: ["blocks", "Monte a promessa de relacionamento", ["Eu", "vos tomarei", "por meu povo"], [2, 0, 1], "Êxodo 6 une libertação e aliança: Deus não apenas tira da escravidão, mas forma um povo."]
      },
      {
        title: "O Nilo e os primeiros sinais",
        subtitle: "A autoridade de Deus sobre o Egito",
        reference: ["Êxodo 7:8–8:32", 7, 8, 8, 32],
        concept: ["ex-first-plagues", "Sinais, resistência e reconhecimento de Deus"],
        teaching: "O cajado de Arão, as águas em sangue, as rãs, os piolhos e as moscas expõem os limites do poder egípcio. Os magos imitam alguns sinais, mas chegam a confessar que há ali o dedo de Deus.",
        application: "Os sinais não são entretenimento mágico. Eles confrontam uma ordem que escraviza e demonstram que Faraó não possui autoridade absoluta sobre a criação nem sobre o povo.",
        keyPoints: ["Os sinais confrontam a pretensão de Faraó", "Os magos reconhecem seus limites"],
        quiz: ["O que os magos dizem ao não reproduzir um dos sinais?", ["É o dedo de Deus", "É obra de Moisés apenas", "É uma doença comum", "É força de Faraó"], 0, "Em Êxodo 8:19, os magos reconhecem o dedo de Deus, mas Faraó continua resistente."],
        practice: ["fill", "Faraó prometia deixar o povo ir, mas depois", "o coração.", ["humilhava", "endurecia", "entregava", "purificava"], 1, "A retirada de uma praga é repetidamente seguida por nova resistência de Faraó."]
      },
      {
        title: "Granizo, trevas e resistência",
        subtitle: "Juízo crescente e responsabilidade de Faraó",
        reference: ["Êxodo 9–10", 9, 1, 10, 29],
        concept: ["ex-later-plagues", "Juízo, advertência e endurecimento"],
        teaching: "Peste, úlceras, granizo, gafanhotos e trevas atingem o Egito. Antes do granizo há advertência e alguns egípcios protegem servos e animais. O relato alterna afirmações sobre Faraó endurecer seu coração e Deus confirmá-lo em sua resistência.",
        application: "É inadequado usar o endurecimento para apagar a responsabilidade de Faraó. O texto apresenta advertências reais, decisões persistentes e juízo divino sobre uma recusa que destrói outras vidas.",
        keyPoints: ["Há advertência antes do granizo", "A resistência de Faraó traz consequências coletivas"],
        quiz: ["Quem foi protegido do granizo anunciado?", ["Quem acolheu a advertência e abrigou servos e animais", "Somente a família de Moisés", "Todos sem exceção", "Apenas os magos"], 0, "Alguns servos de Faraó temeram a palavra do SENHOR e colocaram pessoas e animais em segurança."],
        practice: ["blocks", "Monte a lição do confronto", ["Faraó", "resiste", "apesar", "das advertências"], [3, 1, 0, 2], "O ciclo mostra resistência deliberada mesmo depois de sinais, alívio e advertências."]
      }
    ]
  },
  {
    id: "exodus-u03",
    title: "Páscoa e libertação",
    subtitle: "Da última praga ao cântico do mar em Êxodo 11–15",
    chapters: [11, 12, 13, 14, 15],
    lessons: [
      {
        title: "A noite da Páscoa",
        subtitle: "Memória, proteção e saída do Egito",
        reference: ["Êxodo 11–12", 11, 1, 12, 51],
        concept: ["ex-passover", "Páscoa e memória da libertação"],
        teaching: "A última praga é anunciada no contexto do conflito prolongado. Cada família israelita prepara o cordeiro, marca as portas e come pronta para partir. A Páscoa deverá ser ensinada às novas gerações como memória da libertação.",
        application: "O texto combina juízo severo e preservação. Sua memória litúrgica não celebra sofrimento humano, mas a libertação da escravidão e a fidelidade de Deus ao povo oprimido.",
        keyPoints: ["A refeição é preparada para a partida", "A celebração transmite memória às gerações"],
        quiz: ["Que explicação os pais deveriam dar aos filhos sobre a Páscoa?", ["Era uma festa da colheita apenas", "Recordava que Deus poupou as casas e libertou o povo", "Celebrava a coroação de Faraó", "Marcava a chegada a Canaã"], 1, "Êxodo 12 liga o rito ao ato libertador de Deus e à transmissão dessa memória."],
        practice: ["fill", "A Páscoa deveria ser celebrada como", "para as gerações.", ["segredo", "memorial", "castigo", "comércio"], 1, "A celebração preserva e comunica a história da libertação."]
      },
      {
        title: "Consagrados e guiados",
        subtitle: "A coluna no caminho pelo deserto",
        reference: ["Êxodo 13", 13, 1, 13, 22],
        concept: ["ex-guidance", "Consagração, memória e direção divina"],
        teaching: "Os primogênitos são consagrados e a festa dos pães sem fermento mantém viva a saída. Deus não conduz o povo pela rota mais curta; vai adiante em coluna de nuvem durante o dia e de fogo à noite.",
        application: "O caminho mais curto nem sempre é o mais formador. A direção divina considera a fragilidade do povo e oferece presença constante durante uma transição que ainda exigirá confiança.",
        keyPoints: ["A saída deve ser ensinada aos filhos", "A presença divina guia dia e noite"],
        quiz: ["Por que Deus não conduziu o povo pelo caminho mais curto?", ["Porque não conhecia a estrada", "Para que não recuasse diante da guerra", "Porque Moisés perdeu o mapa", "Para visitar Midiã primeiro"], 1, "Êxodo 13 explica que a guerra poderia levar o povo assustado a retornar ao Egito."],
        practice: ["blocks", "Monte os sinais da direção divina", ["Nuvem", "de dia", "e fogo", "de noite"], [2, 0, 3, 1], "As colunas comunicam a presença que acompanha o povo em toda a jornada."]
      },
      {
        title: "Caminho pelo mar",
        subtitle: "Libertação quando não parece haver saída",
        reference: ["Êxodo 14", 14, 1, 14, 31],
        concept: ["ex-red-sea", "Libertação no mar"],
        teaching: "Faraó persegue Israel até o mar. Entre o exército e as águas, o povo teme e acusa Moisés. Deus abre um caminho, Israel atravessa em terra seca e o poder militar perseguidor é derrotado.",
        application: "A cena funda a identidade de um povo libertado, não de conquistadores autossuficientes. A salvação vem da ação de Deus e conduz à confiança e ao serviço.",
        keyPoints: ["O medo do povo é nomeado", "Deus abre caminho através do mar"],
        quiz: ["Como os israelitas atravessaram o mar?", ["Em navios egípcios", "Por terra seca entre as águas", "Nadando durante a noite", "Por uma ponte construída"], 1, "Êxodo 14 descreve as águas como muralha e o chão do caminho como seco."],
        practice: ["fill", "Moisés disse ao povo: O SENHOR", "por vós.", ["pelejará", "esconderá", "negociará", "fugirá"], 0, "A palavra encoraja um povo aterrorizado a reconhecer a ação libertadora de Deus."]
      },
      {
        title: "Cântico e águas amargas",
        subtitle: "Adoração depois da vitória e confiança depois da sede",
        reference: ["Êxodo 15", 15, 1, 15, 27],
        concept: ["ex-song-marah", "Adoração e aprendizagem no deserto"],
        teaching: "Moisés e o povo cantam a vitória do SENHOR; Miriã lidera as mulheres com tamborins. Pouco depois, a falta de água e as águas amargas de Mara revelam que a liberdade precisará ser aprendida no cotidiano.",
        application: "Momentos de celebração não eliminam novas necessidades. A fé amadurece ao levar a sede a Deus, receber provisão e aprender obediência sem romantizar o deserto.",
        keyPoints: ["Miriã participa da liderança do cântico", "Deus torna potáveis as águas de Mara"],
        quiz: ["Quem lidera as mulheres com tamborins após a travessia?", ["Zípora", "Miriã", "Sifrá", "Joquebede"], 1, "Miriã, chamada profetisa, responde ao cântico com as mulheres de Israel."],
        practice: ["blocks", "Monte o movimento desta lição", ["O povo", "cantou", "e depois", "aprendeu a confiar"], [2, 0, 3, 1], "Êxodo 15 une celebração da libertação e formação da confiança diante da sede."]
      }
    ]
  },
  {
    id: "exodus-u04",
    title: "Caminho para o Sinai",
    subtitle: "Provisão, liderança e aliança em Êxodo 16–20",
    chapters: [16, 17, 18, 19, 20],
    lessons: [
      {
        title: "Pão no deserto",
        subtitle: "Maná, dependência diária e descanso",
        reference: ["Êxodo 16", 16, 1, 16, 36],
        concept: ["ex-manna", "Provisão diária e sábado"],
        teaching: "Diante da fome, o povo murmura e relembra o Egito de modo seletivo. Deus envia codornizes e maná, orientando a coleta diária. No sexto dia há porção dobrada para que o sétimo seja descanso.",
        application: "A provisão ensina confiança sem acúmulo ansioso e inclui ritmo de descanso. O sábado aparece como dádiva a um povo que antes era medido apenas por produção.",
        keyPoints: ["O maná é recolhido dia a dia", "O descanso rompe a lógica da escravidão"],
        quiz: ["O que acontecia com o maná guardado indevidamente para o dia seguinte?", ["Virava ouro", "Criava bichos e cheirava mal", "Multiplicava-se", "Transformava-se em água"], 1, "A deterioração confrontava a tentativa de controlar por acúmulo a provisão diária."],
        practice: ["fill", "No sexto dia, o povo recolhia porção", "para o sábado.", ["menor", "dobrada", "nenhuma", "estragada"], 1, "A porção dobrada permitia descansar no sétimo dia."]
      },
      {
        title: "Água e batalha",
        subtitle: "Massá, Meribá e a cooperação na luta",
        reference: ["Êxodo 17", 17, 1, 17, 16],
        concept: ["ex-water-amalek", "Dependência e cooperação"],
        teaching: "Sem água, o povo contende em Refidim e pergunta se Deus está entre eles. Deus manda Moisés ferir a rocha. Depois, Josué enfrenta Amaleque enquanto Arão e Hur sustentam as mãos cansadas de Moisés.",
        application: "Necessidades reais podem se transformar em crise de confiança. A batalha também mostra que liderança fiel precisa de cooperação: ninguém sustenta sozinho uma missão longa.",
        keyPoints: ["Deus provê água da rocha", "Arão e Hur sustentam Moisés"],
        quiz: ["Quem sustentou as mãos de Moisés durante a batalha?", ["Arão e Hur", "Josué e Calebe", "Nadabe e Abiú", "Miriã e Zípora"], 0, "Arão e Hur colocam uma pedra para Moisés sentar e sustentam suas mãos."],
        practice: ["blocks", "Monte a verdade sobre liderança", ["A missão", "é sustentada", "em", "cooperação"], [3, 1, 0, 2], "A vitória envolve Josué no vale, Moisés no monte e o apoio perseverante de Arão e Hur."]
      },
      {
        title: "Conselho de Jetro",
        subtitle: "Justiça compartilhada e limites saudáveis",
        reference: ["Êxodo 18", 18, 1, 18, 27],
        concept: ["ex-jethro", "Liderança compartilhada"],
        teaching: "Jetro celebra o que Deus fez e observa Moisés julgando sozinho desde manhã até a tarde. Ele aconselha formar pessoas capazes, tementes a Deus, confiáveis e avessas à corrupção para repartir as causas.",
        application: "Centralizar toda decisão esgota o líder e prejudica o povo. Delegar com critérios morais não é abandonar responsabilidade; é construir cuidado sustentável e acessível.",
        keyPoints: ["Jetro reconhece o peso excessivo", "A autoridade é repartida com critérios"],
        quiz: ["Qual problema Jetro identifica na rotina de Moisés?", ["Moisés não conhecia o povo", "Ele tentava julgar tudo sozinho", "Não havia nenhuma causa", "Arão assumira todas as decisões"], 1, "Jetro afirma que tanto Moisés quanto o povo se cansariam com aquele modelo centralizado."],
        practice: ["fill", "Jetro aconselhou Moisés a escolher homens capazes e", ".", ["ricos", "confiáveis", "estrangeiros", "guerreiros"], 1, "Capacidade e caráter aparecem juntos nos critérios da liderança."]
      },
      {
        title: "Aliança no Sinai",
        subtitle: "Um povo santo e as Dez Palavras",
        reference: ["Êxodo 19–20", 19, 1, 20, 26],
        concept: ["ex-sinai-commandments", "Aliança, vocação e mandamentos"],
        teaching: "Deus lembra que carregou Israel como sobre asas de águia e o chama a ser reino sacerdotal e nação santa. Os Dez Mandamentos começam pela graça: o Deus que ordena é aquele que tirou o povo da escravidão.",
        application: "Na sequência do texto, obediência não compra libertação; responde a ela. Os mandamentos formam relações de adoração exclusiva, descanso, honra, verdade e proteção da vida e do próximo.",
        keyPoints: ["A graça da libertação antecede os mandamentos", "A aliança dá vocação ao povo"],
        quiz: ["Como Deus se apresenta antes dos Dez Mandamentos?", ["Como quem tirou Israel do Egito", "Como uma divindade desconhecida", "Como rei de Canaã", "Como criação do povo"], 0, "Êxodo 20:2 fundamenta os mandamentos na ação libertadora já realizada."],
        practice: ["blocks", "Monte a ordem teológica do Sinai", ["Deus", "liberta", "e então", "ensina a viver"], [2, 0, 3, 1], "A obediência é resposta à graça libertadora, não preço pago para obtê-la."]
      }
    ]
  },
  {
    id: "exodus-u05",
    title: "Uma comunidade de aliança",
    subtitle: "Justiça e compromisso comunitário em Êxodo 21–24",
    chapters: [21, 22, 23, 24],
    lessons: [
      {
        title: "Casos de justiça",
        subtitle: "Limites numa sociedade antiga",
        reference: ["Êxodo 21", 21, 1, 21, 36],
        concept: ["ex-covenant-cases", "Responsabilidade e limites da violência"],
        teaching: "As leis de caso tratam de servidão por dívida, agressões, danos e negligência dentro de uma sociedade antiga muito diferente da atual. Elas limitam abusos e exigem responsabilidade proporcional, sem representar o ideal final de toda ética bíblica.",
        application: "Ler essas leis exige contexto histórico e atenção à trajetória canônica da dignidade humana. O texto não deve ser usado para legitimar escravidão moderna nem vingança privada.",
        keyPoints: ["As leis respondem a casos concretos", "Responsabilidade inclui danos por negligência"],
        quiz: ["Que princípio aparece repetidamente nas leis sobre danos?", ["Ninguém responde por nada", "Há reparação proporcional e responsabilidade", "Somente estrangeiros respondem", "A riqueza elimina a culpa"], 1, "Os casos procuram conter ciclos de violência e atribuir responsabilidade por dano causado."],
        practice: ["fill", "A expressão olho por olho estabelece um limite de", ".", ["proporcionalidade", "crueldade", "riqueza", "silêncio"], 0, "No contexto jurídico, a fórmula limita a pena ao dano e não autoriza escalada ilimitada de vingança."]
      },
      {
        title: "Restituição e cuidado",
        subtitle: "Propriedade, vulneráveis e empréstimos",
        reference: ["Êxodo 22", 22, 1, 22, 31],
        concept: ["ex-restitution-vulnerable", "Restituição e proteção do vulnerável"],
        teaching: "Êxodo 22 combina restituição por furto ou dano com proteção ao estrangeiro, à viúva e ao órfão. Empréstimos ao pobre não deveriam se tornar instrumento de exploração, e o manto tomado em penhor deveria voltar antes da noite.",
        application: "A santidade comunitária alcança economia e poder social. Deus ouve o clamor vulnerável; por isso, práticas aparentemente legais também precisam ser avaliadas por seus efeitos sobre pessoas frágeis.",
        keyPoints: ["Restituição procura reparar danos", "O vulnerável não deve ser explorado"],
        quiz: ["Por que Israel não deveria oprimir o estrangeiro?", ["Porque estrangeiros eram sempre ricos", "Porque conhecia a experiência de ser estrangeiro no Egito", "Porque Faraó ordenou", "Porque não havia leis para eles"], 1, "A própria memória de opressão deveria formar empatia e justiça no povo liberto."],
        practice: ["blocks", "Monte o princípio social do capítulo", ["Deus", "ouve", "o clamor", "do vulnerável"], [2, 0, 3, 1], "A advertência sobre viúvas, órfãos e pobres se apoia na atenção de Deus ao clamor."]
      },
      {
        title: "Justiça sem favoritismo",
        subtitle: "Verdade, inimigos, descanso e festas",
        reference: ["Êxodo 23", 23, 1, 23, 33],
        concept: ["ex-impartial-justice", "Justiça imparcial e descanso"],
        teaching: "O capítulo proíbe boatos falsos, maiorias injustas, suborno e favoritismo tanto ao pobre quanto ao poderoso. Ordena ajudar até o animal do inimigo e dá descanso sabático a trabalhadores, estrangeiros e animais.",
        application: "Justiça bíblica não é lealdade cega ao próprio grupo. Verdade, imparcialidade e cuidado concreto com o inimigo testam uma ética que vai além da simpatia pessoal.",
        keyPoints: ["A maioria não transforma injustiça em justiça", "O descanso alcança pessoas e animais"],
        quiz: ["O que fazer ao encontrar perdido o animal de um inimigo?", ["Ignorá-lo", "Devolvê-lo", "Vendê-lo", "Ferí-lo"], 1, "Êxodo 23 ordena um ato concreto de cuidado mesmo em relação ao inimigo."],
        practice: ["fill", "Não seguirás a", "para fazer o mal.", ["maioria", "família", "festa", "colheita"], 0, "A decisão coletiva não absolve participação numa injustiça."]
      },
      {
        title: "Aliança confirmada",
        subtitle: "Palavra, sangue e comunhão no monte",
        reference: ["Êxodo 24", 24, 1, 24, 18],
        concept: ["ex-covenant-ratified", "Ratificação da aliança"],
        teaching: "Moisés lê o Livro da Aliança, o povo se compromete a obedecer e o sangue sela o pacto. Moisés, Arão, Nadabe, Abiú e os anciãos sobem, contemplam uma manifestação de Deus e participam de uma refeição.",
        application: "A aliança envolve palavra ouvida, compromisso público, sacrifício e comunhão. A resposta do povo é séria, mas os capítulos seguintes mostrarão que entusiasmo inicial precisa tornar-se fidelidade perseverante.",
        keyPoints: ["A palavra é lida diante do povo", "A refeição sinaliza comunhão de aliança"],
        quiz: ["O que Moisés fez antes de aspergir o sangue da aliança?", ["Leu o Livro da Aliança ao povo", "Destruiu as tábuas", "Construiu o bezerro", "Voltou ao Egito"], 0, "A leitura e a resposta do povo antecedem o rito que confirma o pacto."],
        practice: ["blocks", "Monte os movimentos da aliança", ["Palavra", "compromisso", "e comunhão"], [1, 2, 0], "Êxodo 24 reúne revelação, resposta comunitária e comunhão diante de Deus."]
      }
    ]
  },
  {
    id: "exodus-u06",
    title: "O santuário e a presença",
    subtitle: "Deus habita no meio do povo em Êxodo 25–31",
    chapters: [25, 26, 27, 28, 29, 30, 31],
    lessons: [
      {
        title: "Uma oferta voluntária",
        subtitle: "Arca, mesa e candelabro",
        reference: ["Êxodo 25", 25, 1, 25, 40],
        concept: ["ex-tabernacle-purpose", "Santuário para a presença divina"],
        teaching: "A construção começa com ofertas de coração voluntário. O propósito declarado é que Deus habite no meio do povo. A arca, a mesa e o candelabro recebem instruções cuidadosas, e o propiciatório ocupa lugar central.",
        application: "O santuário não aprisiona Deus nem compra sua presença. Ele dá forma comunitária à adoração do povo que já foi alcançado pela graça e precisa aprender reverência e generosidade.",
        keyPoints: ["As ofertas vêm de coração disposto", "O santuário aponta para Deus no meio do povo"],
        quiz: ["Qual propósito Deus declara para o santuário?", ["Guardar tesouros de Faraó", "Habitar no meio do povo", "Servir como fortaleza militar", "Substituir toda a criação"], 1, "Êxodo 25:8 apresenta a presença divina entre o povo como finalidade do santuário."],
        practice: ["fill", "A oferta deveria vir de quem tivesse coração", ".", ["constrangido", "voluntário", "indiferente", "medroso"], 1, "A contribuição para o santuário é apresentada como resposta voluntária."]
      },
      {
        title: "Um espaço para adorar",
        subtitle: "Cortinas, altar e pátio",
        reference: ["Êxodo 26–27", 26, 1, 27, 21],
        concept: ["ex-tabernacle-space", "Santidade e acesso ordenado"],
        teaching: "Cortinas, tábuas e véus organizam o tabernáculo em espaços distintos. O altar e o pátio situam sacrifício e aproximação; a lâmpada deveria permanecer acesa conforme o serviço estabelecido.",
        application: "A repetição de medidas e materiais ensina que adoração não é improviso centrado no gosto individual. Beleza, ordem e limites servem à consciência da santidade e da presença.",
        keyPoints: ["O véu distingue espaços do santuário", "O altar fica no caminho de aproximação"],
        quiz: ["O que o véu separava no tabernáculo?", ["Egito e Canaã", "O Santo Lugar e o Santíssimo", "O povo e o deserto", "A tenda e o acampamento de Faraó"], 1, "Êxodo 26 atribui ao véu a função de separar os dois espaços internos."],
        practice: ["blocks", "Monte a ênfase do projeto", ["Santidade", "beleza", "e ordem", "servem à adoração"], [2, 0, 3, 1], "Os detalhes arquitetônicos dão forma visível a uma adoração reverente e comunitária."]
      },
      {
        title: "Sacerdotes para servir",
        subtitle: "Vestes, consagração e representação",
        reference: ["Êxodo 28–29", 28, 1, 29, 46],
        concept: ["ex-priesthood", "Sacerdócio e representação do povo"],
        teaching: "Arão e seus filhos são separados para o sacerdócio. As vestes trazem os nomes das tribos nos ombros e no peitoral, simbolizando que o sacerdote leva o povo diante de Deus. A consagração envolve lavagem, vestes, unção e sacrifícios.",
        application: "A liderança cultual é serviço representativo, não status privado. Carregar nomes junto ao coração expressa memória, responsabilidade e cuidado por toda a comunidade.",
        keyPoints: ["As tribos são representadas nas vestes", "A consagração prepara para servir"],
        quiz: ["O que o peitoral do sacerdote carregava simbolicamente?", ["As riquezas do Egito", "Os nomes das tribos de Israel", "Os mapas de Canaã", "As leis de Faraó"], 1, "As pedras com os nomes mantêm Israel diante do SENHOR no serviço sacerdotal."],
        practice: ["fill", "As vestes eram feitas para glória e", ".", ["formosura", "guerra", "comércio", "luto"], 0, "Êxodo 28 associa beleza e dignidade ao serviço santo."]
      },
      {
        title: "Artesãos cheios do Espírito",
        subtitle: "Incenso, serviço habilidoso e sábado",
        reference: ["Êxodo 30–31", 30, 1, 31, 18],
        concept: ["ex-spirit-craftsmanship", "Vocação, habilidade e descanso"],
        teaching: "Instruções sobre incenso, lavagem e contribuição completam o serviço. Bezalel e Aoliabe são capacitados pelo Espírito de Deus com sabedoria e habilidade artística. O bloco termina reafirmando o sábado antes da entrega das tábuas.",
        application: "O Espírito capacita também trabalho artístico e técnico. Excelência manual, colaboração e descanso pertencem à vocação do povo; produtividade nunca substitui comunhão com Deus.",
        keyPoints: ["Bezalel e Aoliabe recebem habilidade para a obra", "O sábado encerra as instruções"],
        quiz: ["Para qual tarefa Bezalel foi especialmente capacitado?", ["Comandar o exército", "Criar artisticamente os elementos do santuário", "Negociar com Faraó", "Dividir o mar"], 1, "Êxodo 31 relaciona o Espírito de Deus à sabedoria, inteligência e perícia artesanal."],
        practice: ["blocks", "Monte a visão bíblica do trabalho", ["O Espírito", "capacita", "habilidade", "para servir"], [2, 0, 3, 1], "A habilidade artesanal é apresentada como dom usado para a missão comunitária."]
      }
    ]
  },
  {
    id: "exodus-u07",
    title: "Ruptura e renovação",
    subtitle: "O bezerro de ouro e a graça que restaura em Êxodo 32–34",
    chapters: [32, 33, 34],
    lessons: [
      {
        title: "O bezerro de ouro",
        subtitle: "Impaciência e culto fabricado",
        reference: ["Êxodo 32:1–14", 32, 1, 32, 14],
        concept: ["ex-golden-calf", "Idolatria e impaciência"],
        teaching: "Com a demora de Moisés, o povo pede deuses visíveis. Arão recolhe ouro e fabrica o bezerro, atribuindo ao objeto a libertação do Egito. No monte, Moisés intercede apelando à promessa e ao nome de Deus entre as nações.",
        application: "A idolatria reutiliza dons recebidos e reescreve a história da graça para produzir algo controlável. Esperar fielmente faz parte da aliança; pressa religiosa pode fabricar falsos substitutos.",
        keyPoints: ["O ouro da libertação é usado no ídolo", "Moisés intercede pela preservação do povo"],
        quiz: ["O que levou o povo a pedir um objeto de culto?", ["A demora de Moisés no monte", "A falta de ouro", "Uma ordem de Josué", "A chegada de Faraó"], 0, "Êxodo 32:1 liga o pedido à demora percebida e à incerteza sobre Moisés."],
        practice: ["fill", "Moisés pediu que Deus se lembrasse da", "feita aos patriarcas.", ["promessa", "pirâmide", "batalha", "festa"], 0, "Sua intercessão se apoia na aliança com Abraão, Isaque e Israel."]
      },
      {
        title: "Tábua quebrada e intercessão",
        subtitle: "Consequências reais e solidariedade de Moisés",
        reference: ["Êxodo 32:15–35", 32, 15, 32, 35],
        concept: ["ex-broken-covenant", "Ruptura, juízo e intercessão"],
        teaching: "Ao ver o culto ao bezerro, Moisés quebra as tábuas ao pé do monte, sinalizando a aliança violada. A resposta inclui juízo severo. Depois, Moisés volta a Deus e se oferece solidariamente em favor do povo.",
        application: "O capítulo não minimiza o dano da idolatria nem torna a violência fácil de explicar. Ele exige leitura sóbria: pecado coletivo tem consequências, e a liderança de Moisés assume o peso de interceder, não apenas acusar.",
        keyPoints: ["As tábuas quebradas simbolizam a aliança rompida", "Moisés retorna para interceder"],
        quiz: ["O que Moisés faz com as tábuas ao ver o bezerro?", ["Esconde-as na tenda", "Quebra-as ao pé do monte", "Entrega-as a Arão", "Leva-as ao Egito"], 1, "O gesto torna visível a ruptura da aliança recém-confirmada."],
        practice: ["blocks", "Monte o movimento de Moisés", ["Ele confronta", "o pecado", "e volta", "a interceder"], [2, 0, 3, 1], "Moisés combina oposição ao pecado com solidariedade intercessora pelo povo."]
      },
      {
        title: "Mostra-me a tua glória",
        subtitle: "A presença que distingue o povo",
        reference: ["Êxodo 33", 33, 1, 33, 23],
        concept: ["ex-presence-glory", "Presença e favor de Deus"],
        teaching: "A tenda é colocada fora do acampamento enquanto a relação está ferida. Moisés insiste que não vale avançar sem a presença de Deus e pede para conhecer seus caminhos e ver sua glória.",
        application: "Ter destino, recursos e proteção não substitui a presença de Deus. A oração de Moisés procura comunhão e caráter: conhecer os caminhos de Deus para caminhar de modo coerente.",
        keyPoints: ["A presença de Deus distingue o povo", "Moisés pede para conhecer os caminhos divinos"],
        quiz: ["O que Moisés afirma ser indispensável para seguir viagem?", ["Um exército maior", "A presença de Deus", "Mais ouro", "Uma nova rota egípcia"], 1, "Moisés prefere não avançar se a presença de Deus não acompanhar o povo."],
        practice: ["fill", "Moisés pediu: Rogo-te que me mostres a tua", ".", ["glória", "riqueza", "cidade", "arma"], 0, "O pedido prepara a revelação do caráter de Deus em Êxodo 34."]
      },
      {
        title: "O Nome proclamado",
        subtitle: "Aliança renovada e rosto resplandecente",
        reference: ["Êxodo 34", 34, 1, 34, 35],
        concept: ["ex-covenant-renewal", "Misericórdia, justiça e renovação"],
        teaching: "Moisés sobe com novas tábuas. Deus proclama seu nome como compassivo, misericordioso, paciente e rico em fidelidade, sem tratar a culpa como irrelevante. A aliança é renovada, e o rosto de Moisés resplandece após falar com Deus.",
        application: "Misericórdia e justiça não são opostas no caráter proclamado. Na leitura wesleyana, a graça que perdoa também restaura relação e chama novamente à obediência santa.",
        keyPoints: ["O caráter de Deus fundamenta a renovação", "A comunhão transforma visivelmente Moisés"],
        quiz: ["Qual atributo aparece na proclamação do nome de Deus?", ["Indiferença", "Misericórdia", "Instabilidade", "Crueldade"], 1, "Êxodo 34:6–7 destaca compaixão, graça, paciência, amor leal e justiça."],
        practice: ["blocks", "Monte o centro da renovação", ["A graça", "perdoa", "restaura", "e chama à fidelidade"], [2, 0, 3, 1], "A renovação não ignora a ruptura; ela reabre o caminho de relacionamento e obediência."]
      }
    ]
  },
  {
    id: "exodus-u08",
    title: "O tabernáculo erguido",
    subtitle: "O povo obedece e a glória enche a tenda em Êxodo 35–40",
    chapters: [35, 36, 37, 38, 39, 40],
    lessons: [
      {
        title: "Corações dispostos",
        subtitle: "Sábado, ofertas e participação comunitária",
        reference: ["Êxodo 35", 35, 1, 35, 35],
        concept: ["ex-willing-hearts", "Generosidade e participação"],
        teaching: "Moisés começa lembrando o sábado e convida ofertas para a obra. Homens e mulheres trazem materiais; pessoas habilidosas se apresentam, e Bezalel e Aoliabe são reconhecidos para ensinar e executar.",
        application: "A obra reúne recursos, habilidade e ensino sem apagar o descanso. O santuário não é projeto de uma elite: a comunidade participa livremente com aquilo que possui e sabe fazer.",
        keyPoints: ["O sábado permanece antes da construção", "Corações dispostos oferecem e trabalham"],
        quiz: ["Como o texto descreve quem trouxe ofertas?", ["Pessoas coagidas", "Pessoas de coração disposto", "Somente os anciãos", "Apenas sacerdotes"], 1, "Êxodo 35 repete a disposição voluntária como marca da contribuição comunitária."],
        practice: ["fill", "Bezalel e Aoliabe também receberam capacidade para", ".", ["ensinar", "reinar", "guerrear", "julgar Faraó"], 0, "A habilidade inclui transmitir conhecimento para que outros participem da obra."]
      },
      {
        title: "Trabalho conforme o modelo",
        subtitle: "Construção, transparência e oferta suficiente",
        reference: ["Êxodo 36–38", 36, 1, 38, 31],
        concept: ["ex-faithful-construction", "Obediência cuidadosa e transparência"],
        teaching: "Os artesãos constroem cortinas, estruturas, móveis, altar e pátio conforme as instruções. As ofertas se tornam mais que suficientes, e Moisés manda interromper a coleta. Ao final, os materiais empregados são contabilizados.",
        application: "Generosidade responsável sabe dizer que já há o bastante. Obediência cuidadosa e prestação de contas protegem a confiança comunitária e impedem que uma obra sagrada justifique arrecadação sem limites.",
        keyPoints: ["A oferta excedente é interrompida", "Os materiais usados são registrados"],
        quiz: ["O que aconteceu quando os materiais se tornaram suficientes?", ["A coleta continuou indefinidamente", "Moisés mandou parar as ofertas", "Os artesãos abandonaram a obra", "O ouro foi enviado a Faraó"], 1, "Êxodo 36 registra uma ordem pública para que ninguém trouxesse mais material."],
        practice: ["blocks", "Monte o princípio de administração", ["Generosidade", "precisa", "de transparência", "e limites"], [2, 0, 3, 1], "A suficiência reconhecida e o inventário dos materiais demonstram responsabilidade."]
      },
      {
        title: "Tudo estava concluído",
        subtitle: "Vestes sacerdotais e inspeção de Moisés",
        reference: ["Êxodo 39", 39, 1, 39, 43],
        concept: ["ex-work-completed", "Fidelidade na conclusão"],
        teaching: "As vestes sacerdotais são confeccionadas com os materiais e símbolos ordenados. A frase conforme o SENHOR ordenara se repete. Moisés examina toda a obra, reconhece que foi realizada e abençoa os trabalhadores.",
        application: "Começar com entusiasmo é diferente de concluir com fidelidade. Inspeção e bênção valorizam tanto a conformidade da obra quanto as pessoas que serviram nela.",
        keyPoints: ["A obediência é repetidamente destacada", "Moisés examina e abençoa a obra"],
        quiz: ["O que Moisés fez ao ver que a obra fora concluída como ordenado?", ["Desmontou tudo", "Abençoou os trabalhadores", "Escondeu os objetos", "Voltou a Midiã"], 1, "Êxodo 39 termina a inspeção com a bênção de Moisés sobre quem realizou o trabalho."],
        practice: ["fill", "A frase repetida afirma que fizeram conforme o SENHOR havia", ".", ["ordenado", "esquecido", "ocultado", "mudado"], 0, "A repetição conecta habilidade artística e obediência à palavra recebida."]
      },
      {
        title: "A glória enche a tenda",
        subtitle: "Presença que habita e guia",
        reference: ["Êxodo 40", 40, 1, 40, 38],
        concept: ["ex-glory-fills", "Presença divina no centro da jornada"],
        teaching: "Moisés levanta o tabernáculo, organiza seus elementos e consagra o serviço. A nuvem cobre a tenda e a glória do SENHOR a enche. A mesma presença que guiou a saída agora habita no centro do acampamento e dirige as partidas.",
        application: "Êxodo termina sem o povo chegar a Canaã, mas com a presença de Deus no meio dele. A meta da libertação não é apenas sair da opressão; é tornar-se comunidade que adora, caminha e vive com Deus.",
        keyPoints: ["A glória enche o tabernáculo", "A nuvem orienta quando partir e quando permanecer"],
        quiz: ["O que indicava ao povo quando deveria partir?", ["Uma ordem de Faraó", "A nuvem levantando-se do tabernáculo", "O som do Nilo", "A posição das estrelas apenas"], 1, "A nuvem da presença divina ordena o ritmo da jornada no encerramento do livro."],
        practice: ["blocks", "Monte a mensagem final de Êxodo", ["Deus", "liberta", "para habitar", "com seu povo"], [2, 0, 3, 1], "O livro caminha da servidão para uma comunidade guiada pela presença divina."]
      }
    ]
  }
];

export const exodusUnits: Unit[] = unitSeeds.map(makeUnit);
