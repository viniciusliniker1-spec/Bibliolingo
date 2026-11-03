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

const NIGHT: [string, string] = ["#1b2a5a", "#3b3f8f"];
const DAY: [string, string] = ["#7cc8ff", "#d9f1ff"];
const FIELD: [string, string] = ["#8fd3ff", "#c9f0b4"];
const SEA: [string, string] = ["#2d6fb5", "#7cc0e8"];
const STORM: [string, string] = ["#38475e", "#6f7f96"];
const SUNSET: [string, string] = ["#ffb37a", "#ffe1a8"];
const DESERT: [string, string] = ["#f3c98b", "#fbe7c3"];

export const KIDS_STORIES: KidsStory[] = [
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

export const kidsStoryById = new Map(KIDS_STORIES.map((story) => [story.id, story]));

export const KIDS_AGES: { id: KidsAge; label: string; note: string }[] = [
  { id: "3-5", label: "3 a 5 anos", note: "Só ouvir e tocar: frases curtas e narração sempre" },
  { id: "6-8", label: "6 a 8 anos", note: "Frases simples, narração e todas as atividades" },
  { id: "9-11", label: "9 a 11 anos", note: "Lê sozinho; narração quando quiser" }
];
