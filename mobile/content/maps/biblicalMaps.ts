/**
 * Mapas bíblicos: lugares com coordenadas reais (aproximadas quando a
 * localização é debatida), rotas, rios e regiões. O litoral vem de
 * coastlines.ts (Natural Earth). Rotas do Êxodo e de Abraão são tradicionais
 * e didáticas: a localização exata de várias etapas é debatida.
 */
export type LonLat = [number, number];

export interface MapPlace {
  id: string;
  name: string;
  at: LonLat;
  note: string;
  refs: string[];
  /** Ponto principal (ganha rótulo maior). */
  major?: boolean;
  /** Lado do rótulo em relação ao ponto. */
  label?: "right" | "left" | "top" | "bottom";
}

export interface MapRoute { id: string; name: string; color: string; stops: string[]; note?: string }
export interface MapRegion { name: string; at: LonLat; size?: number }

export interface BiblicalMap {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  places: MapPlace[];
  routes: MapRoute[];
  regions: MapRegion[];
  caution?: string;
}

// ---------- Águas (comuns a vários mapas) ----------
export const RIVERS: Record<string, LonLat[]> = {
  nilo: [[32.9, 24.09], [32.65, 25.7], [31.8, 27.18], [31.25, 29.0], [31.23, 30.05], [31.1, 30.4], [30.9, 30.8], [30.42, 31.4]],
  niloLeste: [[31.1, 30.4], [31.4, 30.9], [31.81, 31.42]],
  eufrates: [[38.5, 38.2], [38.0, 37.2], [38.0, 36.83], [38.4, 36.1], [39.0, 35.95], [40.15, 35.4], [41.0, 34.5], [41.9, 34.25], [42.5, 33.8], [43.4, 33.25], [44.42, 32.54], [45.2, 31.9], [46.1, 31.1], [46.9, 30.95], [47.6, 30.5], [48.2, 30.0]],
  tigre: [[40.2, 38.0], [41.2, 37.6], [42.3, 37.25], [43.15, 36.36], [43.3, 35.5], [43.85, 34.6], [44.4, 33.35], [45.0, 32.9], [45.9, 32.4], [46.7, 31.6], [47.4, 31.0], [47.8, 30.6], [48.2, 30.0]],
  jordao: [[35.64, 33.25], [35.61, 33.05], [35.6, 32.9], [35.57, 32.71], [35.58, 32.5], [35.55, 32.25], [35.53, 31.95], [35.55, 31.77]]
};

export const LAKES: Record<string, LonLat[]> = {
  galileia: [[35.52, 32.88], [35.57, 32.9], [35.64, 32.86], [35.65, 32.78], [35.62, 32.72], [35.57, 32.71], [35.52, 32.76], [35.5, 32.82]],
  mortoMar: [[35.4, 31.77], [35.55, 31.76], [35.59, 31.55], [35.55, 31.3], [35.47, 31.08], [35.39, 31.15], [35.38, 31.45]]
};

// ---------- Lugares ----------
const P: Record<string, MapPlace> = {
  jerusalem: { id: "jerusalem", name: "Jerusalém", at: [35.235, 31.778], major: true, note: "Cidade de Davi, do templo, da cruz e da ressurreição.", refs: ["2 Samuel 5", "Lucas 24"] },
  belem: { id: "belem", name: "Belém", at: [35.2, 31.705], label: "left", note: "Cidade de Davi e lugar do nascimento de Jesus.", refs: ["Rute 1", "Lucas 2"] },
  nazare: { id: "nazare", name: "Nazaré", at: [35.3, 32.7], label: "left", note: "Onde Jesus cresceu.", refs: ["Lucas 2", "Lucas 4"] },
  cafarnaum: { id: "cafarnaum", name: "Cafarnaum", at: [35.575, 32.88], label: "top", major: true, note: "Base do ministério de Jesus na Galileia.", refs: ["Mateus 4", "Marcos 2"] },
  betsaida: { id: "betsaida", name: "Betsaida", at: [35.63, 32.91], label: "right", note: "Cidade de Pedro, André e Filipe.", refs: ["João 1", "Marcos 8"] },
  cana: { id: "cana", name: "Caná", at: [35.34, 32.75], label: "top", note: "Primeiro sinal de Jesus: a água vira vinho.", refs: ["João 2"] },
  tabor: { id: "tabor", name: "Monte Tabor", at: [35.39, 32.69], label: "bottom", note: "Lugar tradicional da transfiguração.", refs: ["Mateus 17"] },
  cesareiaFilipe: { id: "cesareiaFilipe", name: "Cesareia de Filipe", at: [35.69, 33.25], label: "right", note: "“Tu és o Cristo, o Filho do Deus vivo.”", refs: ["Mateus 16"] },
  sicar: { id: "sicar", name: "Sicar (Siquém)", at: [35.28, 32.21], label: "right", note: "Jesus e a mulher samaritana no poço de Jacó.", refs: ["João 4", "Gênesis 12"] },
  jerico: { id: "jerico", name: "Jericó", at: [35.44, 31.87], label: "right", note: "Muralhas que caíram; Zaqueu e Bartimeu.", refs: ["Josué 6", "Lucas 19"] },
  betania: { id: "betania", name: "Betânia", at: [35.26, 31.77], label: "right", note: "Casa de Marta, Maria e Lázaro.", refs: ["João 11"] },
  emaus: { id: "emaus", name: "Emaús", at: [35.0, 31.84], label: "left", note: "O Ressuscitado caminha com dois discípulos.", refs: ["Lucas 24"] },
  cesareia: { id: "cesareia", name: "Cesareia", at: [34.89, 32.5], label: "left", note: "Porto romano; Cornélio crê; Paulo preso.", refs: ["Atos 10", "Atos 23"] },
  jope: { id: "jope", name: "Jope", at: [34.75, 32.05], label: "left", note: "Jonas foge; Pedro tem a visão do lençol.", refs: ["Jonas 1", "Atos 10"] },
  samaria: { id: "samaria", name: "Samaria", at: [35.2, 32.28], label: "left", major: true, note: "Capital do Reino do Norte.", refs: ["1 Reis 16", "2 Reis 17"] },
  siquem: { id: "siquem", name: "Siquém", at: [35.28, 32.21], label: "right", note: "Promessa a Abraão; renovação da aliança.", refs: ["Gênesis 12", "Josué 24"] },
  betel: { id: "betel", name: "Betel", at: [35.22, 31.93], label: "right", note: "Escada de Jacó; santuário do Norte.", refs: ["Gênesis 28", "1 Reis 12"] },
  dan: { id: "dan", name: "Dã", at: [35.65, 33.25], label: "right", note: "Extremo norte de Israel; santuário de Jeroboão.", refs: ["1 Reis 12"] },
  hebrom: { id: "hebrom", name: "Hebrom", at: [35.1, 31.53], label: "left", note: "Abraão em Manre; Davi ungido rei.", refs: ["Gênesis 13", "2 Samuel 2"] },
  berseba: { id: "berseba", name: "Berseba", at: [34.79, 31.24], label: "left", note: "Extremo sul: “de Dã a Berseba”.", refs: ["Gênesis 21", "1 Reis 4"] },
  megido: { id: "megido", name: "Megido", at: [35.18, 32.585], label: "left", note: "Fortaleza que guardava o vale de Jezreel.", refs: ["1 Reis 9"] },
  carmelo: { id: "carmelo", name: "Monte Carmelo", at: [35.05, 32.73], label: "left", note: "Elias e os profetas de Baal.", refs: ["1 Reis 18"] },
  silo: { id: "silo", name: "Siló", at: [35.29, 32.05], label: "right", note: "Lugar do tabernáculo; Ana ora por Samuel.", refs: ["1 Samuel 1"] },
  gaza: { id: "gaza", name: "Gaza", at: [34.47, 31.5], label: "left", note: "Cidade filisteia; Sansão.", refs: ["Juízes 16"] },
  tiro: { id: "tiro", name: "Tiro", at: [35.2, 33.27], label: "left", note: "Porto fenício; Hirão ajuda Salomão.", refs: ["1 Reis 5"] },
  sidom: { id: "sidom", name: "Sidom", at: [35.37, 33.56], label: "left", note: "Cidade fenícia; Elias e a viúva de Sarepta.", refs: ["1 Reis 17"] },
  damasco: { id: "damasco", name: "Damasco", at: [36.29, 33.51], major: true, note: "Capital da Síria; conversão de Paulo.", refs: ["2 Reis 5", "Atos 9"] },
  nebo: { id: "nebo", name: "Monte Nebo", at: [35.73, 31.77], label: "bottom", note: "Moisés vê a terra prometida.", refs: ["Deuteronômio 34"] },
  ramesses: { id: "ramesses", name: "Ramessés", at: [31.83, 30.8], label: "left", major: true, note: "Cidade-armazém construída pelos hebreus.", refs: ["Êxodo 1", "Êxodo 12"] },
  sucote: { id: "sucote", name: "Sucote", at: [32.1, 30.55], label: "bottom", note: "Primeira parada da saída do Egito.", refs: ["Êxodo 12"] },
  travessia: { id: "travessia", name: "Travessia do mar", at: [32.55, 29.95], label: "right", note: "O mar se abre. O lugar exato é debatido.", refs: ["Êxodo 14"] },
  mara: { id: "mara", name: "Mara", at: [32.9, 29.3], label: "left", note: "Águas amargas que se tornam doces.", refs: ["Êxodo 15"] },
  sinai: { id: "sinai", name: "Monte Sinai", at: [33.97, 28.54], major: true, label: "bottom", note: "A Lei e a aliança (localização tradicional).", refs: ["Êxodo 19", "Êxodo 20"] },
  cades: { id: "cades", name: "Cades-Barneia", at: [34.42, 30.65], label: "right", note: "Os espias; 40 anos no deserto.", refs: ["Números 13", "Números 14"] },
  eziom: { id: "eziom", name: "Eziom-Geber", at: [34.97, 29.55], label: "right", note: "Parada no golfo de Ácaba.", refs: ["Números 33"] },
  menfis: { id: "menfis", name: "Mênfis", at: [31.25, 29.85], label: "bottom", note: "Grande cidade do Egito antigo.", refs: ["Oseias 9"] },
  alexandria: { id: "alexandria", name: "Alexandria", at: [29.92, 31.2], label: "left", note: "Onde o AT foi traduzido para o grego (Septuaginta).", refs: ["Atos 18"] },
  ur: { id: "ur", name: "Ur", at: [46.1, 30.96], major: true, label: "left", note: "Terra natal de Abraão.", refs: ["Gênesis 11"] },
  hara: { id: "hara", name: "Harã", at: [39.03, 36.87], label: "top", note: "Abraão recebe o chamado para partir.", refs: ["Gênesis 12"] },
  babilonia: { id: "babilonia", name: "Babilônia", at: [44.42, 32.54], major: true, label: "right", note: "Império do exílio; Daniel na corte.", refs: ["2 Reis 25", "Daniel 1"] },
  ninive: { id: "ninive", name: "Nínive", at: [43.15, 36.36], major: true, label: "right", note: "Capital da Assíria; pregação de Jonas.", refs: ["Jonas 3", "2 Reis 17"] },
  susa: { id: "susa", name: "Susã", at: [48.25, 32.19], label: "left", note: "Palácio persa: Ester e Neemias.", refs: ["Ester 1", "Neemias 1"] },
  carquemis: { id: "carquemis", name: "Carquemis", at: [38.01, 36.83], label: "left", note: "Babilônia vence o Egito (605 a.C.).", refs: ["Jeremias 46"] },
  hamate: { id: "hamate", name: "Hamate", at: [36.75, 35.13], label: "right", note: "Cidade síria no caminho do exílio.", refs: ["2 Reis 23"] },
  antioquia: { id: "antioquia", name: "Antioquia", at: [36.16, 36.2], major: true, label: "right", note: "Primeiros “cristãos”; ponto de partida das viagens.", refs: ["Atos 11", "Atos 13"] },
  tarso: { id: "tarso", name: "Tarso", at: [34.9, 36.92], label: "top", note: "Cidade natal de Paulo.", refs: ["Atos 22"] },
  salamina: { id: "salamina", name: "Salamina", at: [33.9, 35.18], label: "right", note: "Chipre: início da 1ª viagem.", refs: ["Atos 13"] },
  pafos: { id: "pafos", name: "Pafos", at: [32.42, 34.76], label: "bottom", note: "O procônsul Sérgio Paulo crê.", refs: ["Atos 13"] },
  perge: { id: "perge", name: "Perge", at: [30.85, 36.96], label: "bottom", note: "Chegada à Ásia Menor.", refs: ["Atos 13"] },
  antioquiaPisidia: { id: "antioquiaPisidia", name: "Antioquia da Pisídia", at: [31.19, 38.3], label: "top", note: "Paulo prega na sinagoga.", refs: ["Atos 13"] },
  iconio: { id: "iconio", name: "Icônio", at: [32.49, 37.87], label: "right", note: "Muitos creem; há perseguição.", refs: ["Atos 14"] },
  listra: { id: "listra", name: "Listra", at: [32.37, 37.58], label: "bottom", note: "Paulo apedrejado; Timóteo se junta.", refs: ["Atos 14", "Atos 16"] },
  derbe: { id: "derbe", name: "Derbe", at: [33.36, 37.35], label: "right", note: "Fim da 1ª viagem para o interior.", refs: ["Atos 14"] },
  troade: { id: "troade", name: "Trôade", at: [26.16, 39.76], label: "left", note: "Visão do macedônio: “Passa e ajuda-nos”.", refs: ["Atos 16"] },
  filipos: { id: "filipos", name: "Filipos", at: [24.29, 41.01], label: "top", note: "Lídia; o carcereiro; 1ª igreja da Europa.", refs: ["Atos 16", "Filipenses 1"] },
  tessalonica: { id: "tessalonica", name: "Tessalônica", at: [22.94, 40.64], label: "left", note: "Igreja que recebeu duas cartas.", refs: ["Atos 17", "1 Tessalonicenses 1"] },
  bereia: { id: "bereia", name: "Bereia", at: [22.2, 40.52], label: "left", note: "Examinavam as Escrituras todos os dias.", refs: ["Atos 17"] },
  atenas: { id: "atenas", name: "Atenas", at: [23.73, 37.98], major: true, label: "left", note: "Discurso no Areópago.", refs: ["Atos 17"] },
  corinto: { id: "corinto", name: "Corinto", at: [22.88, 37.91], label: "bottom", note: "Um ano e meio de ministério.", refs: ["Atos 18", "1 Coríntios 1"] },
  efeso: { id: "efeso", name: "Éfeso", at: [27.34, 37.94], major: true, label: "right", note: "Três anos de ensino; o tumulto dos ourives.", refs: ["Atos 19", "Efésios 1"] },
  mileto: { id: "mileto", name: "Mileto", at: [27.28, 37.53], label: "bottom", note: "Despedida dos presbíteros de Éfeso.", refs: ["Atos 20"] },
  creta: { id: "creta", name: "Bons Portos (Creta)", at: [24.82, 34.93], label: "bottom", note: "Parada antes do naufrágio.", refs: ["Atos 27"] },
  malta: { id: "malta", name: "Malta", at: [14.45, 35.9], label: "bottom", note: "Naufrágio e a víbora.", refs: ["Atos 28"] },
  siracusa: { id: "siracusa", name: "Siracusa", at: [15.29, 37.08], label: "right", note: "Três dias na Sicília.", refs: ["Atos 28"] },
  puteoli: { id: "puteoli", name: "Putéoli", at: [14.12, 40.82], label: "left", note: "Chegada à Itália.", refs: ["Atos 28"] },
  roma: { id: "roma", name: "Roma", at: [12.5, 41.9], major: true, label: "top", note: "Paulo prega preso em casa por dois anos.", refs: ["Atos 28", "Romanos 1"] },
  patmos: { id: "patmos", name: "Patmos", at: [26.55, 37.31], label: "right", note: "João recebe o Apocalipse.", refs: ["Apocalipse 1"] }
};

const pick = (...ids: string[]) => ids.map((id) => P[id]);

export const BIBLICAL_MAPS: BiblicalMap[] = [
  {
    id: "mundo", title: "O mundo bíblico", subtitle: "Do Egito à Mesopotâmia, de Roma à Pérsia", era: "Visão geral",
    places: pick("ur", "hara", "siquem", "hebrom", "jerusalem", "menfis", "alexandria", "babilonia", "ninive", "susa", "damasco", "antioquia", "atenas", "efeso", "roma", "tarso"),
    routes: [{ id: "abraao", name: "Jornada de Abraão", color: "#f2b84b", stops: ["ur", "hara", "siquem", "hebrom"], note: "Gênesis 11–13" }],
    regions: [
      { name: "MAR MEDITERRÂNEO", at: [21, 33.6], size: 14 }, { name: "EGITO", at: [29.5, 27.5] }, { name: "MESOPOTÂMIA", at: [41.5, 34.7] },
      { name: "ÁSIA MENOR", at: [32, 39.2] }, { name: "GRÉCIA", at: [21.6, 39.6] }, { name: "ARÁBIA", at: [40, 28.5] }, { name: "PÉRSIA", at: [50, 33.8] }, { name: "CANAÃ", at: [36.3, 31.2], size: 11 }
    ]
  },
  {
    id: "exodo", title: "O Êxodo", subtitle: "Do Egito à terra prometida", era: "Êxodo e aliança",
    places: pick("ramesses", "sucote", "travessia", "mara", "sinai", "cades", "eziom", "nebo", "jerico", "menfis", "gaza"),
    routes: [{ id: "exodo", name: "Rota tradicional", color: "#f2b84b", stops: ["ramesses", "sucote", "travessia", "mara", "sinai", "eziom", "cades", "nebo", "jerico"], note: "Êxodo 12 – Josué 6" }],
    regions: [{ name: "EGITO", at: [30.6, 28.4] }, { name: "SINAI", at: [33.6, 29.6] }, { name: "CANAÃ", at: [35.0, 32.4] }, { name: "MAR MEDITERRÂNEO", at: [32.2, 32.2], size: 13 }, { name: "MAR VERMELHO", at: [33.8, 27.3], size: 12 }],
    caution: "O percurso exato do Êxodo e a localização do Sinai são debatidos. Aqui está a rota tradicional, como apoio didático."
  },
  {
    id: "reinos", title: "Israel e Judá", subtitle: "A terra de Dã a Berseba e o reino dividido", era: "Monarquia",
    places: pick("dan", "tiro", "sidom", "damasco", "megido", "carmelo", "samaria", "siquem", "silo", "betel", "jerusalem", "jerico", "belem", "hebrom", "berseba", "gaza", "jope"),
    routes: [],
    regions: [{ name: "ISRAEL (NORTE)", at: [35.55, 32.45] }, { name: "JUDÁ (SUL)", at: [35.2, 31.35] }, { name: "FILÍSTIA", at: [34.45, 31.25], size: 11 }, { name: "FENÍCIA", at: [35.55, 33.45], size: 11 }, { name: "MAR GRANDE", at: [34.35, 32.8], size: 13 }],
    caution: "Após Salomão (c. 930 a.C.), o reino se divide: Israel ao norte (capital Samaria) e Judá ao sul (capital Jerusalém)."
  },
  {
    id: "jesus", title: "O ministério de Jesus", subtitle: "Galileia, Samaria e Judeia", era: "Novo Testamento",
    places: pick("cesareiaFilipe", "cafarnaum", "betsaida", "cana", "nazare", "tabor", "sicar", "cesareia", "jope", "jerico", "emaus", "betania", "jerusalem", "belem"),
    routes: [{ id: "subida", name: "Da Galileia a Jerusalém", color: "#f2b84b", stops: ["cafarnaum", "nazare", "sicar", "jerico", "betania", "jerusalem"], note: "Lucas 9:51 – 19:41" }],
    regions: [{ name: "GALILEIA", at: [35.35, 32.98] }, { name: "SAMARIA", at: [35.05, 32.35] }, { name: "JUDEIA", at: [34.95, 31.55] }, { name: "DECÁPOLIS", at: [35.95, 32.45], size: 11 }, { name: "PEREIA", at: [35.75, 31.95], size: 11 }]
  },
  {
    id: "paulo", title: "As viagens de Paulo", subtitle: "O evangelho até os confins da terra", era: "Igreja apostólica",
    places: pick("antioquia", "tarso", "salamina", "pafos", "perge", "antioquiaPisidia", "iconio", "listra", "derbe", "troade", "filipos", "tessalonica", "bereia", "atenas", "corinto", "efeso", "mileto", "cesareia", "jerusalem", "creta", "malta", "siracusa", "puteoli", "roma", "patmos"),
    routes: [
      { id: "v1", name: "1ª viagem", color: "#7cc4ff", stops: ["antioquia", "salamina", "pafos", "perge", "antioquiaPisidia", "iconio", "listra", "derbe"], note: "Atos 13–14" },
      { id: "v2", name: "2ª viagem", color: "#f2b84b", stops: ["antioquia", "tarso", "derbe", "listra", "troade", "filipos", "tessalonica", "bereia", "atenas", "corinto", "efeso", "cesareia", "jerusalem"], note: "Atos 15:36 – 18:22" },
      { id: "roma", name: "Viagem a Roma", color: "#ff8fab", stops: ["cesareia", "creta", "malta", "siracusa", "puteoli", "roma"], note: "Atos 27–28" }
    ],
    regions: [{ name: "MAR MEDITERRÂNEO", at: [20, 34.6], size: 15 }, { name: "MACEDÔNIA", at: [22.8, 41.6] }, { name: "ACAIA", at: [21.9, 37.3], size: 11 }, { name: "ÁSIA", at: [28.6, 38.9] }, { name: "GALÁCIA", at: [32.6, 39.2] }, { name: "ITÁLIA", at: [15.6, 41.4] }]
  },
  {
    id: "exilio", title: "Exílio e retorno", subtitle: "Assíria, Babilônia e Pérsia", era: "Exílio",
    places: pick("samaria", "jerusalem", "damasco", "hamate", "carquemis", "hara", "ninive", "babilonia", "ur", "susa"),
    routes: [
      { id: "norte", name: "Israel para a Assíria (722 a.C.)", color: "#ff8fab", stops: ["samaria", "damasco", "hamate", "carquemis", "ninive"], note: "2 Reis 17" },
      { id: "sul", name: "Judá para a Babilônia (586 a.C.)", color: "#f2b84b", stops: ["jerusalem", "damasco", "hamate", "carquemis", "babilonia"], note: "2 Reis 25" }
    ],
    regions: [{ name: "ASSÍRIA", at: [43.6, 37.3] }, { name: "BABILÔNIA", at: [45.2, 31.2] }, { name: "PÉRSIA", at: [48.6, 34.0] }, { name: "DESERTO DA ARÁBIA", at: [39.5, 30.8], size: 12 }],
    caution: "Os exilados seguiam o “crescente fértil” pelo norte, contornando o deserto. Em 538 a.C., Ciro permite o retorno (Esdras 1)."
  }
];

export const biblicalMapById = new Map(BIBLICAL_MAPS.map((map) => [map.id, map]));

/** Mapa relacionado a um livro e capítulo (para o leitor da Bíblia e as lições). */
export function mapForPassage(osis: string, chapter: number): string | undefined {
  if (osis === "Gen") return chapter >= 11 ? "mundo" : undefined;
  if (["Exod", "Num", "Deut"].includes(osis)) return "exodo";
  if (["Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "1Chr", "2Chr", "Amos", "Hos", "Mic"].includes(osis)) return "reinos";
  if (osis === "2Kgs") return chapter >= 17 ? "exilio" : "reinos";
  if (["Ezra", "Neh", "Esth", "Dan", "Ezek", "Lam", "Jer", "Jonah", "Nah"].includes(osis)) return "exilio";
  if (["Matt", "Mark", "Luke", "John"].includes(osis)) return "jesus";
  if (["Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess"].includes(osis)) return "paulo";
  if (osis === "Rev") return "paulo";
  return undefined;
}

/** Evento da linha do tempo → mapa. */
export const TIMELINE_MAPS: Record<string, string> = {
  patriarchs: "mundo", exodus: "exodo", judges: "reinos", monarchy: "reinos", divided: "reinos", samaria: "exilio",
  exile: "exilio", return: "exilio", jesus: "jesus", pentecost: "paulo", paul: "paulo", church: "paulo"
};
