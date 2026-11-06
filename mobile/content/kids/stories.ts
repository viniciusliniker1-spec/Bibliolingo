/**
 * Histórias do modo criança (piloto). Cada cena tem texto para 6–11 anos e uma
 * versão curta para 3–5 anos. Enquanto as ilustrações não chegam, a cena é
 * desenhada com emojis sobre um céu colorido ("art"); quando houver imagem, ela
 * entra em `image` (veja KIDS_ILLUSTRATIONS.md).
 *
 * Princípios: a Bíblia como uma grande história que aponta para Jesus; texto
 * fiel e simples; nada de "moral solta" no lugar do que Deus fez.
 */
import type { ImageSourcePropType } from "react-native";
import { FINAL_STORIES } from "./finalStories";
import { DAY, DESERT, FIELD, NIGHT, SEA, STORM, SUNSET } from "./skies";

export type KidsAge = "3-5" | "6-8" | "9-11";

export interface KidsScene {
  id: string;
  text: string;
  short: string;
  art: { emoji: string[]; sky: [string, string] };
  image?: ImageSourcePropType;
}

export type KidsActivity =
  | { type: "pick"; question: string; options: { emoji: string; label: string }[]; answer: number }
  | { type: "order"; question: string; items: { emoji: string; label: string }[] }
  | { type: "truefalse"; statement: string; answer: boolean; explain: string };

export interface KidsStory {
  id: string;
  title: string;
  ref: string;
  cover: string;
  color: string;
  scenes: KidsScene[];
  activities: KidsActivity[];
  verse: { text: string; ref: string };
  family: string;
  /** Como esta história aponta para Jesus (para os pais). */
  bigStory: string;
}


const BASE_STORIES: KidsStory[] = [
  {
    id: "criacao", title: "Deus cria o mundo", ref: "Gênesis 1–2", cover: "🌍", color: "#4caf6a",
    scenes: [
      { id: "c1", short: "No começo, só Deus existia.", text: "No começo, não havia nada. Só Deus existia.", art: { emoji: ["✨"], sky: NIGHT } },
      { id: "c2", short: "Deus fez a luz!", text: "Deus disse: “Haja luz!” E a luz apareceu. Ele fez o dia e a noite.", art: { emoji: ["☀️", "🌙"], sky: DAY } },
      { id: "c3", short: "Deus fez o mar e as plantas.", text: "Deus fez o céu, o mar e a terra, com árvores e flores bonitas.", art: { emoji: ["🌊", "🌳", "🌸"], sky: FIELD } },
      { id: "c4", short: "Deus fez os animais.", text: "Depois, Deus encheu o mundo de peixes, pássaros e animais de todo tipo.", art: { emoji: ["🐟", "🐦", "🦁"], sky: FIELD } },
      { id: "c5", short: "Deus fez as pessoas.", text: "Por último, Deus fez o homem e a mulher, parecidos com Ele, para cuidar de tudo.", art: { emoji: ["👫", "🌿"], sky: FIELD } },
      { id: "c6", short: "Tudo era muito bom!", text: "Deus viu tudo o que tinha feito, e era muito bom! No sétimo dia, Ele descansou.", art: { emoji: ["😊", "🌈"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "Quem criou o mundo?", options: [{ emoji: "🙏", label: "Deus" }, { emoji: "🦁", label: "O leão" }, { emoji: "🌊", label: "O mar" }], answer: 0 },
      { type: "order", question: "Toque na ordem em que Deus criou", items: [{ emoji: "☀️", label: "A luz" }, { emoji: "🐟", label: "Os animais" }, { emoji: "👫", label: "As pessoas" }] },
      { type: "truefalse", statement: "Deus achou o mundo muito bom.", answer: true, explain: "Sim! Deus viu que tudo era muito bom." }
    ],
    verse: { text: "No princípio, Deus criou os céus e a terra.", ref: "Gênesis 1:1" },
    family: "Qual parte da criação de Deus você mais gosta? Vamos agradecer a Deus por ela?",
    bigStory: "O Deus que criou tudo com a palavra é o mesmo que, em Jesus, faz novas todas as coisas (João 1:1–3)."
  },
  {
    id: "noe", title: "Noé e a arca", ref: "Gênesis 6–9", cover: "🚢", color: "#3b82c4",
    scenes: [
      { id: "n1", short: "Noé amava a Deus.", text: "Noé amava a Deus e obedecia a Ele, mesmo quando ninguém mais obedecia.", art: { emoji: ["👴", "🙏"], sky: FIELD } },
      { id: "n2", short: "Deus pediu um barco grande.", text: "Deus disse: “Noé, construa um barco bem grande, a arca!”", art: { emoji: ["🔨", "🚢"], sky: DAY } },
      { id: "n3", short: "Os animais entraram.", text: "Os animais entraram na arca, de dois em dois.", art: { emoji: ["🐘", "🦒", "🐑"], sky: FIELD } },
      { id: "n4", short: "Choveu muito!", text: "Choveu muitos e muitos dias. Mas a arca boiava, e todos estavam seguros lá dentro.", art: { emoji: ["🌧️", "🚢"], sky: STORM } },
      { id: "n5", short: "A pomba trouxe uma folha.", text: "Uma pomba voltou com uma folha de oliveira: a terra estava secando!", art: { emoji: ["🕊️", "🌿"], sky: DAY } },
      { id: "n6", short: "Deus fez o arco-íris.", text: "Deus colocou o arco-íris no céu como sinal da sua promessa.", art: { emoji: ["🌈"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "O que Noé construiu?", options: [{ emoji: "🏰", label: "Um castelo" }, { emoji: "🚢", label: "Uma arca" }, { emoji: "🚗", label: "Um carro" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🔨", label: "Noé constrói" }, { emoji: "🌧️", label: "A chuva" }, { emoji: "🌈", label: "O arco-íris" }] },
      { type: "truefalse", statement: "Os animais entraram na arca de dois em dois.", answer: true, explain: "Isso mesmo! De dois em dois." }
    ],
    verse: { text: "Noé andava com Deus.", ref: "Gênesis 6:9" },
    family: "Noé obedeceu mesmo quando era difícil. Em que você pode obedecer hoje?",
    bigStory: "Como a arca guardou Noé, Jesus nos guarda e nos salva (1 Pedro 3:20–21)."
  },
  {
    id: "davi", title: "Davi e o gigante", ref: "1 Samuel 17", cover: "🪨", color: "#e0943b",
    scenes: [
      { id: "d1", short: "Davi cuidava das ovelhas.", text: "Davi era um menino pastor. Ele cuidava das ovelhas e tocava harpa para Deus.", art: { emoji: ["👦", "🐑"], sky: FIELD } },
      { id: "d2", short: "Um gigante apareceu.", text: "Um gigante chamado Golias assustava o povo de Deus todos os dias.", art: { emoji: ["🛡️", "😠"], sky: DESERT } },
      { id: "d3", short: "Todos tinham medo.", text: "Os soldados tinham medo. Ninguém queria enfrentar o gigante.", art: { emoji: ["😨", "😨"], sky: DESERT } },
      { id: "d4", short: "Davi confiou em Deus.", text: "Davi disse: “Eu não tenho medo! Deus está comigo.”", art: { emoji: ["👦", "🙏"], sky: DAY } },
      { id: "d5", short: "Cinco pedrinhas.", text: "Davi pegou cinco pedrinhas lisas no riacho e a sua funda.", art: { emoji: ["🪨", "🪨", "🪨"], sky: DAY } },
      { id: "d6", short: "Deus deu a vitória!", text: "Com a ajuda de Deus, Davi venceu o gigante, e o povo comemorou!", art: { emoji: ["🎉", "👦"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "Quem venceu o gigante?", options: [{ emoji: "🦁", label: "Um leão" }, { emoji: "👑", label: "O rei" }, { emoji: "👦", label: "Davi" }], answer: 2 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🐑", label: "Davi pastor" }, { emoji: "🪨", label: "As pedrinhas" }, { emoji: "🎉", label: "A vitória" }] },
      { type: "truefalse", statement: "Davi venceu porque era o mais forte.", answer: false, explain: "Davi venceu porque Deus estava com ele!" }
    ],
    verse: { text: "O Senhor é a minha luz e a minha salvação; de quem terei medo?", ref: "Salmo 27:1" },
    family: "Do que você tem medo? Vamos orar juntos e lembrar que Deus está com a gente?",
    bigStory: "Davi venceu o gigante pelo povo; Jesus venceu o maior inimigo, o pecado e a morte, por nós (1 Coríntios 15:57)."
  },
  {
    id: "jonas", title: "Jonas e o grande peixe", ref: "Jonas 1–3", cover: "🐋", color: "#2aa6a0",
    scenes: [
      { id: "j1", short: "Deus chamou Jonas.", text: "Deus pediu para Jonas ir à cidade de Nínive falar do amor de Deus.", art: { emoji: ["📣", "🏙️"], sky: DAY } },
      { id: "j2", short: "Jonas fugiu.", text: "Mas Jonas fugiu num barco para bem longe.", art: { emoji: ["🚢", "💨"], sky: SEA } },
      { id: "j3", short: "Veio uma tempestade!", text: "Veio uma tempestade enorme! Os marinheiros ficaram com muito medo.", art: { emoji: ["⛈️", "🌊"], sky: STORM } },
      { id: "j4", short: "Um grande peixe!", text: "Jonas caiu no mar, e Deus mandou um grande peixe engolir Jonas.", art: { emoji: ["🐋"], sky: SEA } },
      { id: "j5", short: "Jonas orou.", text: "Dentro do peixe, Jonas orou e pediu perdão a Deus.", art: { emoji: ["🙏"], sky: SEA } },
      { id: "j6", short: "Jonas obedeceu.", text: "O peixe deixou Jonas na praia. Ele foi a Nínive, e o povo se arrependeu!", art: { emoji: ["🏖️", "🏙️"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "Quem engoliu Jonas?", options: [{ emoji: "🐋", label: "Um grande peixe" }, { emoji: "🐘", label: "Um elefante" }, { emoji: "🐦", label: "Um pássaro" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🚢", label: "Jonas foge" }, { emoji: "🐋", label: "O grande peixe" }, { emoji: "🏙️", label: "Nínive" }] },
      { type: "truefalse", statement: "Dentro do peixe, Jonas orou a Deus.", answer: true, explain: "Sim! E Deus deu outra chance a ele." }
    ],
    verse: { text: "A salvação vem do Senhor.", ref: "Jonas 2:9" },
    family: "Jonas fugiu, mas Deus deu outra chance. Você já precisou pedir perdão a alguém?",
    bigStory: "Jesus disse que Jonas três dias no peixe apontava para Ele, que ressuscitou ao terceiro dia (Mateus 12:40)."
  },
  {
    id: "natal", title: "Jesus nasceu!", ref: "Lucas 1–2; Mateus 2", cover: "⭐", color: "#9b7be0",
    scenes: [
      { id: "x1", short: "Um anjo visitou Maria.", text: "Um anjo visitou Maria: “Você vai ter um bebê, o Filho de Deus!”", art: { emoji: ["👼", "✨"], sky: DAY } },
      { id: "x2", short: "Viagem até Belém.", text: "Maria e José fizeram uma longa viagem até Belém.", art: { emoji: ["🫏", "🌙"], sky: NIGHT } },
      { id: "x3", short: "Não havia lugar.", text: "Não havia lugar na hospedaria. Eles ficaram onde os animais dormiam.", art: { emoji: ["🏠", "🐄"], sky: NIGHT } },
      { id: "x4", short: "Jesus nasceu!", text: "Ali nasceu Jesus! Maria o deitou numa manjedoura.", art: { emoji: ["👶", "⭐"], sky: NIGHT } },
      { id: "x5", short: "Os pastores vieram.", text: "Os anjos contaram a boa notícia aos pastores, que foram correndo ver o bebê.", art: { emoji: ["🐑", "👼"], sky: NIGHT } },
      { id: "x6", short: "Os magos trouxeram presentes.", text: "Magos seguiram uma estrela e trouxeram presentes para Jesus.", art: { emoji: ["⭐", "🎁"], sky: NIGHT } }
    ],
    activities: [
      { type: "pick", question: "Onde Jesus nasceu?", options: [{ emoji: "🏰", label: "Num palácio" }, { emoji: "⭐", label: "Em Belém" }, { emoji: "🚢", label: "Num barco" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "👼", label: "O anjo" }, { emoji: "👶", label: "Jesus nasce" }, { emoji: "🎁", label: "Os presentes" }] },
      { type: "truefalse", statement: "Jesus nasceu num palácio de rei.", answer: false, explain: "Jesus nasceu num lugar simples, onde os animais dormiam." }
    ],
    verse: { text: "Hoje vos nasceu o Salvador, que é Cristo, o Senhor.", ref: "Lucas 2:11" },
    family: "Jesus é o maior presente de Deus. Que presente você pode dar a alguém hoje: um abraço, uma ajuda?",
    bigStory: "Toda a Bíblia esperava por este momento: Deus veio morar com a gente (João 1:14)."
  }
];


const EXTRA_STORIES: KidsStory[] = [
  {
    id: "abraao", title: "A promessa a Abraão", ref: "Gênesis 12; 15; 21", cover: "⭐", color: "#d9a441",
    scenes: [
      { id: "a1", short: "Deus chamou Abraão.", text: "Deus chamou Abraão: “Saia da sua terra e vá para onde eu vou mostrar.”", art: { emoji: ["👴", "🏕️"], sky: DESERT } },
      { id: "a2", short: "Abraão partiu com a família.", text: "Abraão obedeceu e partiu com a família, os camelos e as ovelhas.", art: { emoji: ["🐪", "🐑"], sky: DESERT } },
      { id: "a3", short: "Conte as estrelas!", text: "Deus disse: “Olhe para as estrelas. Sua família será assim, sem conta!”", art: { emoji: ["✨", "⭐", "✨"], sky: NIGHT } },
      { id: "a4", short: "Abraão confiou em Deus.", text: "Abraão e Sara já eram velhinhos, mas confiaram na promessa de Deus.", art: { emoji: ["👴", "👵"], sky: SUNSET } },
      { id: "a5", short: "Nasceu o bebê Isaque!", text: "Deus cumpriu a promessa: nasceu Isaque, e Sara riu de alegria!", art: { emoji: ["👶", "😂"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "Para onde Abraão olhou para lembrar a promessa?", options: [{ emoji: "🌊", label: "O mar" }, { emoji: "⭐", label: "As estrelas" }, { emoji: "🌳", label: "As árvores" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🐪", label: "A viagem" }, { emoji: "⭐", label: "As estrelas" }, { emoji: "👶", label: "Isaque nasce" }] },
      { type: "truefalse", statement: "Deus cumpriu a promessa a Abraão.", answer: true, explain: "Sim! Deus sempre cumpre o que promete." }
    ],
    verse: { text: "Abraão creu no Senhor.", ref: "Gênesis 15:6" },
    family: "Deus cumpre as promessas. Que promessa de Deus você conhece?",
    bigStory: "Deus prometeu abençoar todas as famílias da terra pela família de Abraão, e cumpriu isso em Jesus (Gálatas 3:8)."
  },
  {
    id: "moises", title: "Moisés e o mar aberto", ref: "Êxodo 2; 3; 14", cover: "🌊", color: "#2f86c9",
    scenes: [
      { id: "m1", short: "Moisés no cestinho.", text: "Para proteger o bebê Moisés, a mãe dele o colocou num cestinho no rio.", art: { emoji: ["👶", "🧺"], sky: FIELD } },
      { id: "m2", short: "A princesa achou o bebê.", text: "A filha do faraó encontrou o cesto e cuidou do bebê.", art: { emoji: ["👸", "👶"], sky: DAY } },
      { id: "m3", short: "O arbusto em fogo.", text: "Já adulto, Moisés viu um arbusto que pegava fogo, mas não se queimava. Deus falou com ele!", art: { emoji: ["🔥", "🌿"], sky: DESERT } },
      { id: "m4", short: "Deixe o povo sair!", text: "Moisés pediu ao faraó: “Deixe o povo de Deus sair!”", art: { emoji: ["📣", "👑"], sky: DESERT } },
      { id: "m5", short: "Deus abriu o mar!", text: "Deus abriu o mar, e o povo passou pelo chão seco!", art: { emoji: ["🌊", "🚶", "🌊"], sky: SEA } },
      { id: "m6", short: "Todos cantaram para Deus.", text: "Do outro lado, todos cantaram para agradecer a Deus.", art: { emoji: ["🎶", "🎉"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "Onde o bebê Moisés ficou no rio?", options: [{ emoji: "🧺", label: "Num cestinho" }, { emoji: "🐟", label: "Num peixe" }, { emoji: "🏠", label: "Numa casa" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🧺", label: "O cestinho" }, { emoji: "🔥", label: "O arbusto" }, { emoji: "🌊", label: "O mar aberto" }] },
      { type: "truefalse", statement: "Deus abriu o mar para o povo passar.", answer: true, explain: "Isso! Deus abriu um caminho no mar." }
    ],
    verse: { text: "O Senhor lutará por vocês.", ref: "Êxodo 14:14" },
    family: "Deus cuidou do bebê Moisés. Como Deus cuida da nossa família?",
    bigStory: "Deus libertou seu povo do Egito; Jesus nos liberta do pecado (João 8:36)."
  },
  {
    id: "daniel", title: "Daniel e os leões", ref: "Daniel 6", cover: "🦁", color: "#c9773a",
    scenes: [
      { id: "dn1", short: "Daniel orava todo dia.", text: "Daniel orava a Deus três vezes por dia, perto da janela.", art: { emoji: ["🙏", "🪟"], sky: DAY } },
      { id: "dn2", short: "Uma lei contra orar.", text: "Homens invejosos fizeram uma lei: ninguém podia orar a Deus.", art: { emoji: ["📜", "😠"], sky: DESERT } },
      { id: "dn3", short: "Daniel continuou orando.", text: "Mas Daniel continuou orando, como sempre fazia.", art: { emoji: ["🙏"], sky: SUNSET } },
      { id: "dn4", short: "A cova dos leões.", text: "Por isso, ele foi jogado na cova dos leões.", art: { emoji: ["🦁", "🦁"], sky: NIGHT } },
      { id: "dn5", short: "Deus fechou a boca dos leões!", text: "Deus mandou um anjo e fechou a boca dos leões!", art: { emoji: ["👼", "🦁"], sky: NIGHT } },
      { id: "dn6", short: "Daniel estava bem!", text: "De manhã, o rei viu Daniel bem e louvou a Deus.", art: { emoji: ["👑", "😊"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "O que Daniel fazia todos os dias?", options: [{ emoji: "⚽", label: "Jogava bola" }, { emoji: "🎨", label: "Pintava" }, { emoji: "🙏", label: "Orava a Deus" }], answer: 2 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🙏", label: "Daniel ora" }, { emoji: "🦁", label: "Os leões" }, { emoji: "👑", label: "O rei feliz" }] },
      { type: "truefalse", statement: "Os leões machucaram Daniel.", answer: false, explain: "Não! Deus protegeu Daniel." }
    ],
    verse: { text: "O meu Deus enviou o seu anjo e fechou a boca dos leões.", ref: "Daniel 6:22" },
    family: "Daniel orava todos os dias. Qual é uma boa hora para a nossa família orar?",
    bigStory: "Daniel saiu vivo da cova; Jesus saiu vivo do túmulo para sempre (Romanos 6:9)."
  },
  {
    id: "tempestade", title: "Jesus acalma a tempestade", ref: "Marcos 4:35–41", cover: "⛵", color: "#4f7fc4",
    scenes: [
      { id: "t1", short: "Jesus no barco.", text: "Jesus e os discípulos atravessavam o lago num barco.", art: { emoji: ["⛵"], sky: SUNSET } },
      { id: "t2", short: "Jesus dormiu.", text: "Jesus estava cansado e dormiu.", art: { emoji: ["😴", "⛵"], sky: SUNSET } },
      { id: "t3", short: "Uma tempestade!", text: "Veio uma tempestade forte! As ondas entravam no barco.", art: { emoji: ["⛈️", "🌊"], sky: STORM } },
      { id: "t4", short: "Socorro, Jesus!", text: "Os discípulos acordaram Jesus: “Mestre, vamos afundar!”", art: { emoji: ["😨", "📣"], sky: STORM } },
      { id: "t5", short: "O mar ficou calmo.", text: "Jesus disse: “Silêncio! Fique quieto!” E o mar ficou calmo.", art: { emoji: ["✋", "🌊"], sky: DAY } },
      { id: "t6", short: "Até o vento obedece!", text: "Todos perguntaram: “Quem é este, que até o vento e o mar obedecem?”", art: { emoji: ["😮", "🙏"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "Quem acalmou a tempestade?", options: [{ emoji: "🙌", label: "Jesus" }, { emoji: "🐋", label: "Um peixe" }, { emoji: "☀️", label: "O sol" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "⛵", label: "O barco" }, { emoji: "⛈️", label: "A tempestade" }, { emoji: "🌊", label: "O mar calmo" }] },
      { type: "truefalse", statement: "Jesus tem poder sobre o vento e o mar.", answer: true, explain: "Sim! Jesus é o Filho de Deus." }
    ],
    verse: { text: "Até o vento e o mar lhe obedecem!", ref: "Marcos 4:41" },
    family: "Quando você tem medo, o que pode dizer a Jesus?",
    bigStory: "Jesus faz o que só Deus faz: Ele é o Filho de Deus (Marcos 4:41)."
  },
  {
    id: "ovelha", title: "A ovelha perdida", ref: "Lucas 15:3–7", cover: "🐑", color: "#5fa86a",
    scenes: [
      { id: "o1", short: "O pastor e as ovelhas.", text: "Um pastor tinha cem ovelhas e cuidava de todas.", art: { emoji: ["🐑", "🐑", "🐑"], sky: FIELD } },
      { id: "o2", short: "Uma ovelha se perdeu.", text: "Um dia, uma ovelhinha se perdeu.", art: { emoji: ["🐑", "❓"], sky: SUNSET } },
      { id: "o3", short: "O pastor foi procurar.", text: "O pastor deixou as outras seguras e saiu procurando.", art: { emoji: ["🚶", "⛰️"], sky: SUNSET } },
      { id: "o4", short: "Encontrou!", text: "Procurou nas pedras, nos morros… até que encontrou!", art: { emoji: ["🪨", "🐑"], sky: DAY } },
      { id: "o5", short: "No colo do pastor.", text: "Ele colocou a ovelha nos ombros, todo feliz.", art: { emoji: ["🤗", "🐑"], sky: DAY } },
      { id: "o6", short: "Uma festa!", text: "Em casa, fez uma festa: “Achei a minha ovelha!”", art: { emoji: ["🎉", "🏠"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "Quantas ovelhas se perderam?", options: [{ emoji: "☝️", label: "Uma" }, { emoji: "✌️", label: "Duas" }, { emoji: "🔟", label: "Dez" }], answer: 0 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🐑", label: "A ovelha se perde" }, { emoji: "🚶", label: "O pastor procura" }, { emoji: "🎉", label: "A festa" }] },
      { type: "truefalse", statement: "O pastor desistiu da ovelhinha.", answer: false, explain: "Não! Ele procurou até encontrar." }
    ],
    verse: { text: "Eu sou o bom pastor.", ref: "João 10:11" },
    family: "Jesus é o Bom Pastor que nunca desiste da gente. Como você se sente sabendo disso?",
    bigStory: "Jesus contou essa história para mostrar como Deus ama e procura cada pessoa (Lucas 19:10)."
  },
  {
    id: "zaqueu", title: "Zaqueu na árvore", ref: "Lucas 19:1–10", cover: "🌳", color: "#7aa83a",
    scenes: [
      { id: "z1", short: "Zaqueu, o cobrador.", text: "Zaqueu era cobrador de impostos e pegava dinheiro demais das pessoas.", art: { emoji: ["🧍", "💰"], sky: DESERT } },
      { id: "z2", short: "Muita gente!", text: "Jesus chegou à cidade com muita gente. Zaqueu era baixinho e não via nada!", art: { emoji: ["👥", "👥"], sky: DAY } },
      { id: "z3", short: "Zaqueu subiu na árvore.", text: "Então ele subiu numa árvore para ver Jesus.", art: { emoji: ["🌳", "👀"], sky: DAY } },
      { id: "z4", short: "Zaqueu, desça!", text: "Jesus parou e disse: “Zaqueu, desça! Hoje vou ficar na sua casa.”", art: { emoji: ["👋", "🌳"], sky: DAY } },
      { id: "z5", short: "Jesus na casa de Zaqueu.", text: "Zaqueu recebeu Jesus com alegria na sua casa.", art: { emoji: ["🏠", "🍞"], sky: SUNSET } },
      { id: "z6", short: "Zaqueu mudou!", text: "Ele mudou: devolveu o dinheiro e ajudou os pobres.", art: { emoji: ["💰", "🤝"], sky: SUNSET } }
    ],
    activities: [
      { type: "pick", question: "Onde Zaqueu subiu para ver Jesus?", options: [{ emoji: "🏔️", label: "Num monte" }, { emoji: "🌳", label: "Numa árvore" }, { emoji: "🏠", label: "No telhado" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "🌳", label: "Na árvore" }, { emoji: "🏠", label: "Jesus na casa" }, { emoji: "🤝", label: "Zaqueu muda" }] },
      { type: "truefalse", statement: "Depois de conhecer Jesus, Zaqueu mudou.", answer: true, explain: "Sim! Jesus mudou o coração dele." }
    ],
    verse: { text: "O Filho do Homem veio buscar e salvar o que estava perdido.", ref: "Lucas 19:10" },
    family: "Jesus quis ser amigo de Zaqueu. Com quem você pode ser bondoso esta semana?",
    bigStory: "Jesus muda o coração das pessoas: a salvação chegou à casa de Zaqueu (Lucas 19:9)."
  },
  {
    id: "pascoa", title: "Jesus está vivo!", ref: "Lucas 22–24", cover: "🌅", color: "#e86f8a",
    scenes: [
      { id: "p1", short: "Jesus chega a Jerusalém.", text: "Jesus entrou em Jerusalém num jumentinho, e o povo cantava.", art: { emoji: ["🫏", "🌿"], sky: DAY } },
      { id: "p2", short: "O jantar com os amigos.", text: "Jesus jantou com os amigos e disse que ia dar a sua vida por eles.", art: { emoji: ["🍞", "🤝"], sky: SUNSET } },
      { id: "p3", short: "Jesus morreu por amor.", text: "Jesus morreu na cruz por amor a nós, para nos perdoar.", art: { emoji: ["✝️"], sky: STORM } },
      { id: "p4", short: "Os amigos ficaram tristes.", text: "Os amigos ficaram tristes, e Jesus foi colocado num túmulo.", art: { emoji: ["🪨", "😢"], sky: NIGHT } },
      { id: "p5", short: "O túmulo vazio!", text: "No terceiro dia, a pedra estava fora do lugar. O túmulo estava vazio!", art: { emoji: ["🌅", "🪨"], sky: SUNSET } },
      { id: "p6", short: "Jesus está vivo!", text: "Jesus ressuscitou! Ele está vivo, e os amigos se alegraram muito.", art: { emoji: ["🙌", "🎉"], sky: DAY } }
    ],
    activities: [
      { type: "pick", question: "O que aconteceu no terceiro dia?", options: [{ emoji: "😴", label: "Todos dormiram" }, { emoji: "🙌", label: "Jesus ressuscitou" }, { emoji: "🌧️", label: "Choveu muito" }], answer: 1 },
      { type: "order", question: "Toque na ordem da história", items: [{ emoji: "✝️", label: "A cruz" }, { emoji: "🪨", label: "O túmulo" }, { emoji: "🙌", label: "Jesus vivo" }] },
      { type: "truefalse", statement: "Jesus está vivo!", answer: true, explain: "Sim! Jesus ressuscitou e vive para sempre." }
    ],
    verse: { text: "Ele não está aqui; ressuscitou!", ref: "Lucas 24:6" },
    family: "Jesus morreu e ressuscitou por amor a nós. Vamos agradecer juntos a Ele?",
    bigStory: "Este é o centro de toda a grande história da Bíblia: Jesus venceu a morte (1 Coríntios 15:3–4)."
  }
];

/** Capítulos da grande história, da Criação à nova criação. */
export const KIDS_CHAPTERS: { id: string; title: string; subtitle: string; emoji: string; stories: string[] }[] = [
  { id: "comeco", title: "No começo", subtitle: "Deus cria e faz promessas", emoji: "🌍", stories: ["criacao", "noe", "abraao", "jose"] },
  { id: "povo", title: "O povo de Deus", subtitle: "Deus cuida e salva o seu povo", emoji: "⛺", stories: ["moises", "jerico", "davi", "elias", "jonas", "daniel"] },
  { id: "jesus", title: "Jesus, o Salvador", subtitle: "Deus veio morar com a gente", emoji: "✨", stories: ["natal", "criancas", "tempestade", "paes", "ovelha", "samaritano", "zaqueu", "pascoa"] },
  { id: "igreja", title: "A igreja e a promessa", subtitle: "Jesus está vivo e vai voltar", emoji: "🕊️", stories: ["pentecostes", "paulo", "tudonovo"] }
];

const STORY_ORDER = KIDS_CHAPTERS.flatMap((chapter) => chapter.stories);
const ALL_STORIES = [...BASE_STORIES, ...EXTRA_STORIES, ...FINAL_STORIES];

export const KIDS_STORIES: KidsStory[] = STORY_ORDER.map((id) => ALL_STORIES.find((story) => story.id === id)!);

export const kidsStoryById = new Map(KIDS_STORIES.map((story) => [story.id, story]));

export const KIDS_AGES: { id: KidsAge; label: string; note: string }[] = [
  { id: "3-5", label: "3 a 5 anos", note: "Só ouvir e tocar: frases curtas e narração sempre" },
  { id: "6-8", label: "6 a 8 anos", note: "Frases simples, narração e todas as atividades" },
  { id: "9-11", label: "9 a 11 anos", note: "Lê sozinho; narração quando quiser" }
];
