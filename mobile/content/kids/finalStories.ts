import type { KidsStory } from "./stories";
import { DAY, DESERT, FIELD, NIGHT, STORM, SUNSET } from "./skies";

/** Histórias que completam a trilha: José, Jericó, Elias, os milagres e parábolas de Jesus, a igreja e a nova criação. */
export const FINAL_STORIES: KidsStory[] = [
  {
    id: "jose", title: "José e seus irmãos", ref: "Gênesis 37; 41–45", cover: "🧥", color: "#b0679e",
    scenes: [
      { id: "j1", short: "José ganhou uma túnica colorida.", text: "Jacó deu ao filho José uma túnica bem colorida.", art: { emoji: ["🧥", "🌈"], sky: FIELD } },
      { id: "j2", short: "Os irmãos ficaram com inveja.", text: "Os irmãos ficaram com inveja e venderam José para uns viajantes.", art: { emoji: ["😠", "🐪"], sky: DESERT } },
      { id: "j3", short: "José foi para o Egito.", text: "José foi levado para o Egito, mas Deus estava com ele.", art: { emoji: ["🏜️", "🙏"], sky: DESERT } },
      { id: "j4", short: "José explicou os sonhos.", text: "Deus ajudou José a explicar os sonhos do faraó: viriam sete anos de fome!", art: { emoji: ["💭", "🌾"], sky: DAY } },
      { id: "j5", short: "José guardou comida.", text: "José virou governador e guardou comida para salvar muita gente.", art: { emoji: ["🌾", "🏛️"], sky: SUNSET } },
      { id: "j6", short: "José perdoou os irmãos.", text: "Quando os irmãos vieram buscar comida, José os perdoou e abraçou.", art: { emoji: ["🤗", "💛"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "O que José ganhou do pai?", options: [{ emoji: "🧥", label: "Uma túnica colorida" }, { emoji: "⚽", label: "Uma bola" }, { emoji: "🐴", label: "Um cavalo" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🧥", label: "A túnica" }, { emoji: "🌾", label: "A comida guardada" }, { emoji: "🤗", label: "O perdão" }] },
      { type: "truefalse", statement: "José perdoou os irmãos.", answer: true, explain: "Sim! José escolheu perdoar." }
    ],
    verse: { text: "Vocês planejaram o mal, mas Deus o transformou em bem.", ref: "Gênesis 50:20" },
    family: "José perdoou quem o machucou. Tem alguém que você precisa perdoar?",
    bigStory: "Deus usou José para salvar a família de onde viria Jesus, que perdoa os nossos pecados (Colossenses 3:13)."
  },
  {
    id: "jerico", title: "As muralhas de Jericó", ref: "Josué 6", cover: "🎺", color: "#c98a3a",
    scenes: [
      { id: "jr1", short: "Uma cidade com muralhas altas.", text: "Jericó tinha muralhas enormes, e os portões estavam fechados.", art: { emoji: ["🧱", "🏰"], sky: DESERT } },
      { id: "jr2", short: "Deus deu um plano.", text: "Deus disse a Josué: “Andem em volta da cidade durante sete dias.”", art: { emoji: ["👂", "📜"], sky: DAY } },
      { id: "jr3", short: "O povo marchou.", text: "O povo obedeceu e marchou em volta da cidade, todos os dias.", art: { emoji: ["🚶", "🚶", "🚶"], sky: DESERT } },
      { id: "jr4", short: "As trombetas tocaram.", text: "No sétimo dia, os sacerdotes tocaram as trombetas.", art: { emoji: ["🎺", "🎺"], sky: SUNSET } },
      { id: "jr5", short: "Todos gritaram!", text: "Todo o povo gritou bem alto!", art: { emoji: ["📣", "🙌"], sky: SUNSET } },
      { id: "jr6", short: "As muralhas caíram!", text: "E as muralhas caíram! Deus deu a vitória ao seu povo.", art: { emoji: ["💥", "🧱"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "O que os sacerdotes tocaram?", options: [{ emoji: "🥁", label: "Tambores" }, { emoji: "🎺", label: "Trombetas" }, { emoji: "🎸", label: "Violões" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🚶", label: "A marcha" }, { emoji: "🎺", label: "As trombetas" }, { emoji: "💥", label: "As muralhas caem" }] },
      { type: "truefalse", statement: "O povo derrubou as muralhas com martelos.", answer: false, explain: "Não! Foi Deus quem derrubou as muralhas." }
    ],
    verse: { text: "Seja forte e corajoso, pois o Senhor está com você.", ref: "Josué 1:9" },
    family: "O povo obedeceu mesmo sem entender o plano. Como podemos obedecer a Deus em casa?",
    bigStory: "Deus luta pelo seu povo; em Jesus, Ele venceu o maior inimigo, o pecado (1 Coríntios 15:57)."
  },
  {
    id: "elias", title: "Elias e o fogo do céu", ref: "1 Reis 17–18", cover: "🔥", color: "#d9583b",
    scenes: [
      { id: "e1", short: "Elias, o profeta.", text: "Elias era um profeta que falava as palavras de Deus ao povo.", art: { emoji: ["🧔", "📣"], sky: DESERT } },
      { id: "e2", short: "Os corvos levavam comida.", text: "Quando faltou chuva, Deus mandou corvos levarem pão a Elias.", art: { emoji: ["🐦‍⬛", "🍞"], sky: DAY } },
      { id: "e3", short: "Um desafio no monte.", text: "No monte Carmelo, Elias desafiou os profetas do falso deus Baal.", art: { emoji: ["⛰️", "🪵"], sky: DESERT } },
      { id: "e4", short: "Baal não respondeu.", text: "Eles gritaram o dia inteiro, mas ninguém respondeu.", art: { emoji: ["😩", "🔇"], sky: SUNSET } },
      { id: "e5", short: "Elias orou.", text: "Elias orou: “Senhor, mostra que só Tu és Deus!”", art: { emoji: ["🙏"], sky: SUNSET } },
      { id: "e6", short: "Fogo do céu!", text: "Deus mandou fogo do céu! E o povo disse: “O Senhor é Deus!”", art: { emoji: ["🔥", "🙌"], sky: NIGHT } }
    ],
    activities: [
      { type: "pick", question: "Quem levava comida para Elias?", options: [{ emoji: "🐦‍⬛", label: "Os corvos" }, { emoji: "🐶", label: "Um cachorro" }, { emoji: "🐟", label: "Um peixe" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🍞", label: "O pão dos corvos" }, { emoji: "🙏", label: "Elias ora" }, { emoji: "🔥", label: "O fogo do céu" }] },
      { type: "truefalse", statement: "Só o Senhor é o Deus verdadeiro.", answer: true, explain: "Isso! Só Ele ouve e responde." }
    ],
    verse: { text: "O Senhor é Deus!", ref: "1 Reis 18:39" },
    family: "Deus ouviu a oração de Elias. Pelo que a gente pode orar hoje?",
    bigStory: "Deus mostra que só Ele é Deus; Jesus nos leva até o Pai (João 14:6)."
  },
  {
    id: "criancas", title: "Jesus ama as crianças", ref: "Marcos 10:13–16", cover: "🧒", color: "#f08a5d",
    scenes: [
      { id: "cr1", short: "As famílias vieram ver Jesus.", text: "Muitas famílias levaram suas crianças para perto de Jesus.", art: { emoji: ["👨‍👩‍👧", "🚶"], sky: DAY } },
      { id: "cr2", short: "“Jesus está ocupado!”", text: "Os discípulos disseram: “Jesus está ocupado, levem as crianças embora!”", art: { emoji: ["✋", "😕"], sky: DAY } },
      { id: "cr3", short: "Jesus disse: “Deixem vir!”", text: "Mas Jesus disse: “Deixem as crianças virem a mim!”", art: { emoji: ["🤗", "🧒"], sky: SUNSET } },
      { id: "cr4", short: "Jesus abraçou as crianças.", text: "Jesus pegou as crianças no colo e as abençoou.", art: { emoji: ["🤗", "💛"], sky: SUNSET } },
      { id: "cr5", short: "Cada criança é importante.", text: "Para Jesus, cada criança é muito importante.", art: { emoji: ["🧒", "👧", "👦"], sky: FIELD } }
    ],
    activities: [
      { type: "pick", question: "O que Jesus disse?", options: [{ emoji: "🚪", label: "Vão embora" }, { emoji: "🤗", label: "Deixem as crianças virem" }, { emoji: "😴", label: "Estou com sono" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "👨‍👩‍👧", label: "As famílias chegam" }, { emoji: "✋", label: "Os discípulos dizem não" }, { emoji: "🤗", label: "Jesus abraça" }] },
      { type: "truefalse", statement: "Jesus ama as crianças.", answer: true, explain: "Sim! E Ele ama você também." }
    ],
    verse: { text: "Deixem vir a mim as crianças.", ref: "Marcos 10:14" },
    family: "Jesus tem tempo para você. O que você quer contar para Ele hoje?",
    bigStory: "Jesus recebe todos que vêm a Ele com confiança, como uma criança (Marcos 10:15)."
  },
  {
    id: "paes", title: "Pães e peixes", ref: "João 6:1–14", cover: "🧺", color: "#d9a441",
    scenes: [
      { id: "pp1", short: "Muita gente seguiu Jesus.", text: "Uma multidão enorme seguiu Jesus para ouvir suas palavras.", art: { emoji: ["👥", "👥", "⛰️"], sky: FIELD } },
      { id: "pp2", short: "Todos estavam com fome.", text: "Ficou tarde, e todo mundo estava com fome.", art: { emoji: ["😋", "❓"], sky: SUNSET } },
      { id: "pp3", short: "Um menino ofereceu o lanche.", text: "Um menino ofereceu o que tinha: cinco pães e dois peixinhos.", art: { emoji: ["👦", "🍞", "🐟"], sky: SUNSET } },
      { id: "pp4", short: "Jesus agradeceu.", text: "Jesus agradeceu a Deus e começou a repartir a comida.", art: { emoji: ["🙏", "🍞"], sky: SUNSET } },
      { id: "pp5", short: "Deu para todo mundo!", text: "A comida não acabava! Mais de cinco mil pessoas comeram.", art: { emoji: ["🍞", "🐟", "😊"], sky: FIELD } },
      { id: "pp6", short: "Sobraram doze cestos!", text: "E ainda sobraram doze cestos cheios!", art: { emoji: ["🧺", "🧺", "🧺"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "Quantos pães o menino tinha?", options: [{ emoji: "5️⃣", label: "Cinco" }, { emoji: "🔟", label: "Dez" }, { emoji: "1️⃣", label: "Um" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "👦", label: "O menino oferece" }, { emoji: "🙏", label: "Jesus agradece" }, { emoji: "🧺", label: "Sobram cestos" }] },
      { type: "truefalse", statement: "A comida acabou rapidinho.", answer: false, explain: "Não! Jesus multiplicou, e ainda sobrou." }
    ],
    verse: { text: "Eu sou o pão da vida.", ref: "João 6:35" },
    family: "O menino deu o pouco que tinha. O que você pode dividir com alguém?",
    bigStory: "Jesus é o pão da vida: só Ele satisfaz de verdade (João 6:35)."
  },
  {
    id: "samaritano", title: "O bom samaritano", ref: "Lucas 10:25–37", cover: "🩹", color: "#4aa37f",
    scenes: [
      { id: "s1", short: "Um homem foi machucado.", text: "Um homem viajava pela estrada, foi assaltado e ficou machucado.", art: { emoji: ["🛣️", "🤕"], sky: DESERT } },
      { id: "s2", short: "Um sacerdote passou longe.", text: "Um sacerdote viu o homem, mas passou pelo outro lado.", art: { emoji: ["🚶", "↪️"], sky: DESERT } },
      { id: "s3", short: "Outro também não ajudou.", text: "Um levita também passou e não ajudou.", art: { emoji: ["🚶", "↪️"], sky: DESERT } },
      { id: "s4", short: "Um samaritano parou.", text: "Então um samaritano, de outro povo, parou e teve compaixão.", art: { emoji: ["🫏", "💛"], sky: SUNSET } },
      { id: "s5", short: "Ele cuidou do homem.", text: "Ele cuidou das feridas e levou o homem até uma hospedaria.", art: { emoji: ["🩹", "🏠"], sky: SUNSET } },
      { id: "s6", short: "Faça o mesmo!", text: "Jesus disse: “Vá e faça o mesmo: ame o seu próximo.”", art: { emoji: ["🤝", "😊"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "Quem ajudou o homem machucado?", options: [{ emoji: "🫏", label: "O samaritano" }, { emoji: "🦁", label: "Um leão" }, { emoji: "👑", label: "O rei" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🤕", label: "O homem machucado" }, { emoji: "↪️", label: "Passam longe" }, { emoji: "🩹", label: "O samaritano cuida" }] },
      { type: "truefalse", statement: "O nosso próximo é qualquer pessoa que precisa de ajuda.", answer: true, explain: "Isso! Amar é ajudar quem precisa." }
    ],
    verse: { text: "Ame o seu próximo como a si mesmo.", ref: "Lucas 10:27" },
    family: "Quem perto de nós precisa de ajuda? Como podemos ser bons samaritanos?",
    bigStory: "Jesus é o maior bom samaritano: Ele veio nos socorrer quando não podíamos nos salvar (Romanos 5:8)."
  },
  {
    id: "pentecostes", title: "O Espírito Santo chegou", ref: "Atos 1–2", cover: "🕊️", color: "#e0703f",
    scenes: [
      { id: "pt1", short: "Jesus subiu ao céu.", text: "Depois de ressuscitar, Jesus subiu ao céu e prometeu enviar o Espírito Santo.", art: { emoji: ["☁️", "✨"], sky: DAY } },
      { id: "pt2", short: "Os amigos esperaram orando.", text: "Os amigos de Jesus ficaram juntos em Jerusalém, orando e esperando.", art: { emoji: ["🙏", "🏠"], sky: SUNSET } },
      { id: "pt3", short: "Um vento forte!", text: "De repente, veio do céu um barulho como de um vento muito forte!", art: { emoji: ["💨", "🏠"], sky: DAY } },
      { id: "pt4", short: "Línguas como de fogo.", text: "Apareceram como chamas de fogo sobre cada um. Era o Espírito Santo!", art: { emoji: ["🔥", "🕊️"], sky: SUNSET } },
      { id: "pt5", short: "Falaram de Jesus.", text: "Eles começaram a falar de Jesus em muitas línguas, e todos entendiam.", art: { emoji: ["🗣️", "🌍"], sky: DAY } },
      { id: "pt6", short: "A igreja começou!", text: "Naquele dia, três mil pessoas creram em Jesus. A igreja começou!", art: { emoji: ["👥", "💛"], sky: FIELD } }
    ],
    activities: [
      { type: "pick", question: "Quem veio sobre os amigos de Jesus?", options: [{ emoji: "🕊️", label: "O Espírito Santo" }, { emoji: "🦅", label: "Uma águia" }, { emoji: "🌧️", label: "A chuva" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "☁️", label: "Jesus sobe ao céu" }, { emoji: "💨", label: "O vento forte" }, { emoji: "👥", label: "A igreja começa" }] },
      { type: "truefalse", statement: "O Espírito Santo ajuda a gente a falar de Jesus.", answer: true, explain: "Sim! Ele nos dá coragem." }
    ],
    verse: { text: "Vocês receberão poder quando o Espírito Santo descer sobre vocês.", ref: "Atos 1:8" },
    family: "O Espírito Santo nos ajuda. Para quem você gostaria de contar sobre Jesus?",
    bigStory: "Jesus cumpriu a promessa: o Espírito Santo mora em quem crê e forma a igreja (Atos 2:38–39)."
  },
  {
    id: "paulo", title: "Paulo e Silas cantam", ref: "Atos 16:16–34", cover: "🎶", color: "#6a6fc4",
    scenes: [
      { id: "pa1", short: "Paulo e Silas falavam de Jesus.", text: "Paulo e Silas viajavam contando a boa notícia de Jesus.", art: { emoji: ["🚶", "🚶", "📣"], sky: DAY } },
      { id: "pa2", short: "Foram presos.", text: "Algumas pessoas ficaram bravas, e eles foram presos.", art: { emoji: ["⛓️", "🏚️"], sky: STORM } },
      { id: "pa3", short: "À meia-noite, cantaram!", text: "À meia-noite, mesmo presos, Paulo e Silas oravam e cantavam a Deus.", art: { emoji: ["🎶", "🌙"], sky: NIGHT } },
      { id: "pa4", short: "Um terremoto!", text: "De repente, um terremoto abriu as portas e soltou as correntes!", art: { emoji: ["💥", "🚪"], sky: NIGHT } },
      { id: "pa5", short: "O carcereiro teve medo.", text: "O carcereiro ficou com medo, mas Paulo disse: “Estamos todos aqui!”", art: { emoji: ["😨", "🔦"], sky: NIGHT } },
      { id: "pa6", short: "A família creu em Jesus.", text: "O carcereiro e toda a sua família creram em Jesus e ficaram muito alegres.", art: { emoji: ["👨‍👩‍👧", "😊"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "O que Paulo e Silas fizeram na prisão?", options: [{ emoji: "😭", label: "Choraram" }, { emoji: "🎶", label: "Cantaram a Deus" }, { emoji: "😴", label: "Dormiram" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "⛓️", label: "Presos" }, { emoji: "🎶", label: "Cantam" }, { emoji: "💥", label: "O terremoto" }] },
      { type: "truefalse", statement: "Podemos louvar a Deus mesmo quando as coisas estão difíceis.", answer: true, explain: "Isso! Deus está com a gente sempre." }
    ],
    verse: { text: "Creia no Senhor Jesus, e você e sua família serão salvos.", ref: "Atos 16:31" },
    family: "Paulo e Silas cantaram num momento difícil. Que música podemos cantar juntos para Deus?",
    bigStory: "Nada impede a boa notícia de Jesus de chegar às famílias (2 Timóteo 2:9)."
  },
  {
    id: "tudonovo", title: "Tudo novo!", ref: "Apocalipse 21–22", cover: "🌈", color: "#3fa9b0",
    scenes: [
      { id: "tn1", short: "Jesus prometeu voltar.", text: "Jesus prometeu: “Eu voltarei para buscar vocês.”", art: { emoji: ["☁️", "✨"], sky: DAY } },
      { id: "tn2", short: "João teve uma visão.", text: "Deus mostrou ao apóstolo João como tudo vai ser no final.", art: { emoji: ["👴", "📜"], sky: SUNSET } },
      { id: "tn3", short: "Um novo céu e uma nova terra.", text: "Deus vai fazer um novo céu e uma nova terra, lindos e perfeitos.", art: { emoji: ["🌍", "🌈"], sky: FIELD } },
      { id: "tn4", short: "Nada de choro nem dor.", text: "Lá não vai ter mais choro, nem dor, nem tristeza.", art: { emoji: ["😊", "💛"], sky: DAY } },
      { id: "tn5", short: "O rio da vida.", text: "Vai ter um rio de água da vida e a árvore da vida, para sempre.", art: { emoji: ["🌊", "🌳"], sky: FIELD } },
      { id: "tn6", short: "Deus com o seu povo.", text: "E o melhor: Deus vai morar com o seu povo para sempre!", art: { emoji: ["✨", "👨‍👩‍👧‍👦"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "O que Deus vai fazer no final?", options: [{ emoji: "🌈", label: "Tudo novo" }, { emoji: "🌑", label: "Apagar a luz" }, { emoji: "🏚️", label: "Uma casa velha" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "☁️", label: "Jesus promete voltar" }, { emoji: "🌍", label: "Nova terra" }, { emoji: "✨", label: "Deus com o seu povo" }] },
      { type: "truefalse", statement: "Na nova criação não vai ter mais tristeza.", answer: true, explain: "Sim! Deus vai enxugar todas as lágrimas." }
    ],
    verse: { text: "Eis que faço novas todas as coisas.", ref: "Apocalipse 21:5" },
    family: "Do que você mais gostou em toda a grande história de Deus?",
    bigStory: "A história termina como começou: Deus com o seu povo, num mundo muito bom, por causa de Jesus (Apocalipse 21:3)."
  }
];
