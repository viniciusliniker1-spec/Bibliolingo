import { stableHash } from "./lessonPlan";

export type CardRarity = "common" | "rare" | "epic" | "legendary";
export type CardStatKey = "fe" | "amor" | "alegria" | "sabedoria" | "coragem" | "paz";

export interface LumiCardDef { id: string; name: string; rarity: CardRarity; /** Atributos que a pose destaca (o primeiro é o principal). */ focus: [CardStatKey, CardStatKey] }

/** As 40 cartas colecionáveis da Lumi (a ordem define o número da carta no álbum). */
export const LUMI_CARD_DEFS: readonly LumiCardDef[] = [
  { id: "joinha", name: "Joinha", rarity: "common", focus: ["alegria", "fe"] },
  { id: "leitora", name: "Leitora", rarity: "common", focus: ["sabedoria", "fe"] },
  { id: "coracao-aberto", name: "Coração Aberto", rarity: "common", focus: ["amor", "paz"] },
  { id: "a-caminho", name: "A Caminho", rarity: "common", focus: ["coragem", "alegria"] },
  { id: "descolada", name: "Descolada", rarity: "rare", focus: ["paz", "coragem"] },
  { id: "estudo-digital", name: "Estudo Digital", rarity: "rare", focus: ["sabedoria", "coragem"] },
  { id: "boa-ideia", name: "Boa Ideia", rarity: "rare", focus: ["sabedoria", "alegria"] },
  { id: "medalha-de-ouro", name: "Medalha de Ouro", rarity: "rare", focus: ["coragem", "alegria"] },
  { id: "zelo-em-chamas", name: "Zelo em Chamas", rarity: "epic", focus: ["coragem", "fe"] },
  { id: "rios-de-lagrimas", name: "Rios de Lágrimas", rarity: "epic", focus: ["amor", "fe"] },
  { id: "oracao-serena", name: "Oração Serena", rarity: "legendary", focus: ["fe", "paz"] },
  { id: "mestra-da-palavra", name: "Mestra da Palavra", rarity: "legendary", focus: ["sabedoria", "fe"] },
  { id: "piscadinha", name: "Piscadinha", rarity: "common", focus: ["alegria", "amor"] },
  { id: "palavra-aberta", name: "Palavra Aberta", rarity: "common", focus: ["sabedoria", "fe"] },
  { id: "alegria-pura", name: "Alegria Pura", rarity: "common", focus: ["alegria", "paz"] },
  { id: "soneca", name: "Soneca", rarity: "common", focus: ["paz", "amor"] },
  { id: "apaixonada", name: "Apaixonada", rarity: "rare", focus: ["amor", "alegria"] },
  { id: "detetive-biblica", name: "Detetive Bíblica", rarity: "rare", focus: ["sabedoria", "coragem"] },
  { id: "formatura", name: "Formatura", rarity: "rare", focus: ["sabedoria", "alegria"] },
  { id: "olhar-de-guerra", name: "Olhar de Guerra", rarity: "rare", focus: ["coragem", "fe"] },
  { id: "super-ovelha", name: "Super Lumi", rarity: "epic", focus: ["coragem", "fe"] },
  { id: "choro-forte", name: "Choro Forte", rarity: "epic", focus: ["amor", "paz"] },
  { id: "majestade", name: "Majestade", rarity: "epic", focus: ["sabedoria", "paz"] },
  { id: "olhos-de-estrela", name: "Olhos de Estrela", rarity: "epic", focus: ["alegria", "amor"] },
  { id: "anjo-da-guarda", name: "Anjo da Guarda", rarity: "legendary", focus: ["fe", "amor"] },
  { id: "dona-do-tesouro", name: "Dona do Tesouro", rarity: "legendary", focus: ["sabedoria", "alegria"] },
  { id: "poder-da-palavra", name: "Poder da Palavra", rarity: "legendary", focus: ["fe", "coragem"] },
  { id: "rumo-ao-alto", name: "Rumo ao Alto", rarity: "legendary", focus: ["coragem", "alegria"] },
  { id: "amo-a-biblia", name: "Amo a Bíblia", rarity: "common", focus: ["amor", "fe"] },
  { id: "que-susto", name: "Que Susto!", rarity: "common", focus: ["coragem", "paz"] },
  { id: "momento-de-paz", name: "Momento de Paz", rarity: "common", focus: ["paz", "fe"] },
  { id: "dia-nublado", name: "Dia Nublado", rarity: "common", focus: ["paz", "amor"] },
  { id: "duvida-santa", name: "Dúvida Santa", rarity: "rare", focus: ["sabedoria", "paz"] },
  { id: "sonhando", name: "Sonhando", rarity: "rare", focus: ["paz", "amor"] },
  { id: "relax", name: "Relax", rarity: "rare", focus: ["paz", "alegria"] },
  { id: "exploradora", name: "Exploradora", rarity: "rare", focus: ["coragem", "sabedoria"] },
  { id: "aleluia", name: "Aleluia!", rarity: "epic", focus: ["fe", "alegria"] },
  { id: "furiosa", name: "Furiosa", rarity: "epic", focus: ["coragem", "fe"] },
  { id: "campea", name: "Campeã", rarity: "epic", focus: ["alegria", "coragem"] },
  { id: "realeza", name: "Realeza", rarity: "legendary", focus: ["sabedoria", "fe"] }
];

export const CARD_STAT_KEYS: readonly CardStatKey[] = ["fe", "amor", "alegria", "sabedoria", "coragem", "paz"];
export const CARD_STAT_LABEL: Record<CardStatKey, string> = { fe: "FÉ", amor: "AMOR", alegria: "ALE", sabedoria: "SAB", coragem: "COR", paz: "PAZ" };
export const CARD_STAT_NAME: Record<CardStatKey, string> = { fe: "Fé", amor: "Amor", alegria: "Alegria", sabedoria: "Sabedoria", coragem: "Coragem", paz: "Paz" };

/** Faixa da nota geral de cada raridade (como as notas de uma carta de jogo). */
export const CARD_OVERALL_BAND: Record<CardRarity, readonly [number, number]> = {
  common: [60, 72], rare: [73, 82], epic: [83, 91], legendary: [92, 97]
};

export interface LumiCardProfile {
  /** Nota geral (a média dos seis atributos, arredondada). */
  overall: number;
  stats: Record<CardStatKey, number>;
  /** Número da carta no álbum (1 a 40). */
  number: number;
  total: number;
}

const clamp = (value: number, min = 35, max = 99) => Math.max(min, Math.min(max, value));

/**
 * Nota e atributos de uma carta. Tudo é determinístico (vem do id), então a carta é a mesma em
 * qualquer aparelho e não precisa ser salva: só a quantidade de cópias fica na carteira.
 */
export function cardProfile(def: LumiCardDef): LumiCardProfile {
  const [lo, hi] = CARD_OVERALL_BAND[def.rarity];
  const overall = lo + (stableHash("ovr:" + def.id) % (hi - lo + 1));
  const stats = {} as Record<CardStatKey, number>;
  CARD_STAT_KEYS.forEach((key) => {
    const jitter = (stableHash(def.id + ":" + key) % 8) - 6;       // -6 a +1
    const boost = key === def.focus[0] ? 12 : key === def.focus[1] ? 6 : 0;
    stats[key] = clamp(overall + jitter + boost);
  });
  // Ajusta os atributos sem destaque até a média bater com a nota geral.
  const free = CARD_STAT_KEYS.filter((key) => key !== def.focus[0] && key !== def.focus[1]);
  for (let guard = 0; guard < 400; guard += 1) {
    const mean = Math.round(CARD_STAT_KEYS.reduce((sum, key) => sum + stats[key], 0) / CARD_STAT_KEYS.length);
    if (mean === overall) break;
    const key = free[guard % free.length];
    stats[key] = clamp(stats[key] + (mean > overall ? -1 : 1));
  }
  return { overall, stats, number: LUMI_CARD_DEFS.findIndex((card) => card.id === def.id) + 1, total: LUMI_CARD_DEFS.length };
}

export const lumiCardById = (id: string) => LUMI_CARD_DEFS.find((card) => card.id === id);
