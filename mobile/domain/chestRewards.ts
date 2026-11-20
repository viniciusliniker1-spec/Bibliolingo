/**
 * Recompensas do baú do dia: além de moedas, o baú pode dar um escudo de ofensiva
 * (salva um dia perdido de graça) ou uma figurinha bíblica para o álbum.
 */
export type StickerRarity = "common" | "rare" | "epic" | "legendary";

import { LUMI_CARD_DEFS } from "./lumiCards";

/** `art` indica carta ilustrada da Lumi; `legacy` são as figurinhas de emoji antigas (não saem mais nos baús). */
export interface Sticker { id: string; emoji: string; name: string; rarity: StickerRarity; art?: boolean; legacy?: boolean }

export const STICKER_RARITY_LABEL: Record<StickerRarity, string> = { common: "Comum", rare: "Rara", epic: "Épica", legendary: "Lendária" };
export const STICKER_RARITY_COLOR: Record<StickerRarity, string> = { common: "#8fb8ff", rare: "#7fe3d5", epic: "#c9a7ff", legendary: "#f2b84b" };
/** Moedas devolvidas quando a figurinha sorteada já estava no álbum. */
export const DUPLICATE_REFUND: Record<StickerRarity, number> = { common: 10, rare: 25, epic: 50, legendary: 100 };

/** As 40 cartas da Lumi: é o que sai nos baús e o que o álbum coleciona. */
export const COLLECTIBLES: readonly Sticker[] = LUMI_CARD_DEFS.map((card) => ({ id: card.id, emoji: "🐑", name: card.name, rarity: card.rarity, art: true }));

const LEGACY_STICKERS: readonly Sticker[] = [
  { id: "pomba", emoji: "🕊️", name: "Pomba da Paz", rarity: "common", legacy: true },
  { id: "arco-iris", emoji: "🌈", name: "Arco-íris da Aliança", rarity: "common", legacy: true },
  { id: "pao", emoji: "🍞", name: "Pão de cada dia", rarity: "common", legacy: true },
  { id: "ovelha", emoji: "🐑", name: "Ovelhinha", rarity: "common", legacy: true },
  { id: "lamparina", emoji: "🕯️", name: "Lamparina", rarity: "common", legacy: true },
  { id: "espiga", emoji: "🌾", name: "Espigas de Rute", rarity: "common", legacy: true },
  { id: "pedrinha", emoji: "🪨", name: "Pedrinha de Davi", rarity: "common", legacy: true },
  { id: "peixe", emoji: "🐟", name: "Peixe e pães", rarity: "common", legacy: true },
  { id: "pergaminho", emoji: "📜", name: "Pergaminho", rarity: "common", legacy: true },
  { id: "oliveira", emoji: "🌿", name: "Ramo de oliveira", rarity: "common", legacy: true },
  { id: "estrela", emoji: "⭐", name: "Estrela de Belém", rarity: "rare", legacy: true },
  { id: "jarro", emoji: "🏺", name: "Jarro de Caná", rarity: "rare", legacy: true },
  { id: "trombeta", emoji: "🎺", name: "Trombeta de Jericó", rarity: "rare", legacy: true },
  { id: "leao", emoji: "🦁", name: "Leão de Daniel", rarity: "rare", legacy: true },
  { id: "mar", emoji: "🌊", name: "Mar que se abriu", rarity: "rare", legacy: true },
  { id: "sarca", emoji: "🔥", name: "Sarça ardente", rarity: "rare", legacy: true },
  { id: "candelabro", emoji: "🪔", name: "Candelabro do templo", rarity: "rare", legacy: true },
  { id: "semente", emoji: "🌱", name: "Semente de mostarda", rarity: "rare", legacy: true },
  { id: "arca", emoji: "⛵", name: "Arca de Noé", rarity: "epic", legacy: true },
  { id: "coroa-davi", emoji: "👑", name: "Coroa de Davi", rarity: "epic", legacy: true },
  { id: "armadura", emoji: "🛡️", name: "Armadura de Deus", rarity: "epic", legacy: true },
  { id: "sinai", emoji: "🏔️", name: "Monte Sinai", rarity: "epic", legacy: true },
  { id: "perola", emoji: "💎", name: "Pérola de grande valor", rarity: "legendary", legacy: true },
  { id: "aurora", emoji: "🌅", name: "Aurora da Ressurreição", rarity: "legendary", legacy: true }
];

/** Tudo que já pode estar na carteira: as cartas e as figurinhas antigas de quem já as ganhou. */
export const STICKERS: readonly Sticker[] = [...COLLECTIBLES, ...LEGACY_STICKERS];

export function stickerById(id: string) {
  return STICKERS.find((sticker) => sticker.id === id);
}

export type ChestReward =
  | { kind: "coins"; amount: number }
  | { kind: "shield" }
  | { kind: "sticker"; id: string; duplicate: boolean; refund: number };

/** Chances do tipo de prêmio (soma 100). */
export const KIND_WEIGHTS = { coins: 45, shield: 20, sticker: 35 } as const;
export const RARITY_WEIGHTS: Record<StickerRarity, number> = { common: 60, rare: 25, epic: 12, legendary: 3 };
const COIN_AMOUNTS: { amount: number; weight: number }[] = [{ amount: 30, weight: 60 }, { amount: 50, weight: 30 }, { amount: 100, weight: 10 }];

function pickWeighted<T>(items: readonly { value: T; weight: number }[], roll: number): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = roll * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor < 0) return item.value;
  }
  return items[items.length - 1].value;
}

/** Sorteia o prêmio do baú. `owned` conta as figurinhas que a pessoa já tem (para preferir as novas). */
export function rollChestReward(rng: () => number, owned: Readonly<Record<string, number>> = {}): ChestReward {
  const kind = pickWeighted<keyof typeof KIND_WEIGHTS>([
    { value: "coins", weight: KIND_WEIGHTS.coins }, { value: "shield", weight: KIND_WEIGHTS.shield }, { value: "sticker", weight: KIND_WEIGHTS.sticker }
  ], rng());
  if (kind === "coins") return { kind, amount: pickWeighted(COIN_AMOUNTS.map((item) => ({ value: item.amount, weight: item.weight })), rng()) };
  if (kind === "shield") return { kind };
  const rarity = pickWeighted<StickerRarity>((Object.keys(RARITY_WEIGHTS) as StickerRarity[]).map((value) => ({ value, weight: RARITY_WEIGHTS[value] })), rng());
  const ofRarity = COLLECTIBLES.filter((sticker) => sticker.rarity === rarity);
  const fresh = ofRarity.filter((sticker) => !owned[sticker.id]);
  // Prefere uma figurinha nova da raridade sorteada; se o álbum dessa raridade já está completo, sai repetida.
  const pool = fresh.length ? fresh : ofRarity;
  const sticker = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  const duplicate = Boolean(owned[sticker.id]);
  return { kind: "sticker", id: sticker.id, duplicate, refund: duplicate ? DUPLICATE_REFUND[sticker.rarity] : 0 };
}

/** Moedas que o prêmio acrescenta à carteira (prêmio em moedas ou devolução de repetida). */
export function rewardCoins(reward: ChestReward) {
  return reward.kind === "coins" ? reward.amount : reward.kind === "sticker" ? reward.refund : 0;
}

export function rewardTitle(reward: ChestReward) {
  if (reward.kind === "coins") return `+${reward.amount} moedas Lumi`;
  if (reward.kind === "shield") return "Escudo de ofensiva";
  const sticker = stickerById(reward.id);
  return sticker ? sticker.name : "Carta da Lumi";
}

export function rewardNote(reward: ChestReward) {
  if (reward.kind === "coins") return "Use na loja da Lumi ou para salvar sua ofensiva.";
  if (reward.kind === "shield") return "Salva 1 dia perdido da sua ofensiva, de graça.";
  const sticker = stickerById(reward.id);
  const rarity = sticker ? STICKER_RARITY_LABEL[sticker.rarity] : "";
  return reward.duplicate ? `${rarity} · já estava no seu álbum: +${reward.refund} moedas Lumi.` : `${rarity} · nova carta no seu álbum!`;
}
