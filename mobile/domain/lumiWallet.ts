/**
 * Carteira da Lumi calculada no próprio aparelho.
 *
 * O saldo é derivado do progresso (lições, checkpoints, conquistas e livros
 * concluídos), então funciona offline, inclusive para visitantes, sem
 * "confirmar moedas" no servidor. Compras e a skin equipada ficam no progresso,
 * que já é enviado para a conta: elas acompanham a pessoa em outro aparelho.
 */
import { isLumiSkinId, lumiRewardValues, type LumiRarity, type LumiSkinId } from "../../src/domain/lumi";
import { BIBLE_SKINS, bibleSkinById } from "./bibleSkins";
import { isBookComplete, type BookLike } from "./bookCompletion";

export interface LumiPurchase {
  itemId: LumiSkinId;
  price: number;
  at: string;
  /** "coins": comprada com moedas; "account": já pertencia à conta antes da carteira local; "book": liberada ao concluir o livro (sem preço). */
  source: "coins" | "account" | "book";
}

/** Dia(s) perdido(s) salvos com moedas: a ofensiva continua como se tivesse estudado. */
export interface LumiFreeze {
  at: string;
  price: number;
  /** Quantos dias foram cobertos por escudos (sem custo em moedas). */
  shields?: number;
  /** Dias (AAAA-MM-DD) cobertos pelo congelamento. */
  dates: string[];
}

export interface LumiWalletState {
  purchases: LumiPurchase[];
  freezes?: LumiFreeze[];
  /** Escudos de ofensiva ganhos nos baús e usados (o saldo é a diferença; só crescem, então mesclam por máximo). */
  shieldsEarned?: number;
  shieldsUsed?: number;
  /** Figurinhas do álbum: id → quantas vezes saiu. */
  stickers?: Record<string, number>;
  equippedSkinId?: LumiSkinId;
  equippedAt?: string;
}

export interface LumiSkinDefinition {
  id: LumiSkinId;
  name: string;
  description: string;
  price: number;
  rarity: LumiRarity;
  requiredAchievementId?: string;
  requirementLabel?: string;
  /** Skin da Bíblia: sem preço, liberada ao concluir o livro (`bookId` é o id do livro na jornada). */
  free?: boolean;
  bookId?: string;
}

export type LumiSkinState = "equipped" | "owned" | "available" | "insufficient" | "locked";

export interface WalletProgress {
  completedLessonIds: readonly string[];
  completedCheckpointIds: readonly string[];
  earnedAchievementIds: readonly string[];
  lumiWallet?: LumiWalletState;
}

/** Conquistas de livro concluído: valem um bônus além da conquista em si. */
export const BOOK_COMPLETION_ACHIEVEMENTS: ReadonlySet<string> = new Set([
  "genesis-complete", "exodus-complete", "leviticus-complete", "numbers-complete", "deuteronomy-complete",
  "joshua-complete", "judges-complete", "ruth-complete", "first-samuel-complete", "second-samuel-complete",
  "first-kings-complete", "second-kings-complete", "chronicles-complete", "ezra-nehemiah-complete",
  "esther-complete", "psalms-complete", "isaiah-complete", "jeremiah-complete", "ezekiel-complete", "daniel-complete"
]);

/** Catálogo da loja (mesmos preços e regras publicados anteriormente). */
export const LUMI_SKINS: readonly LumiSkinDefinition[] = [
  { id: "lumi_base", name: "Lumi Original", description: "A companheira original de toda jornada Bibliolingo.", price: 0, rarity: "common" },
  { id: "lumi_oculos", name: "Lumi Intelectual", description: "Óculos para acompanhar estudos e descobertas.", price: 100, rarity: "common" },
  { id: "lumi_hiphop", name: "Lumi Hip-Hop", description: "Uma versão urbana e cheia de personalidade.", price: 250, rarity: "rare" },
  ...BIBLE_SKINS.map((skin): LumiSkinDefinition => ({
    id: skin.skinId,
    name: skin.name,
    description: `Skin de ${skin.title}. Liberada ao concluir o livro, sem custo.`,
    price: 0,
    rarity: skin.rarity,
    free: true,
    bookId: skin.bookId,
    requiredAchievementId: skin.legacyAchievementId,
    requirementLabel: `Conclua ${skin.title}`
  }))
];

export const EMPTY_WALLET: LumiWalletState = { purchases: [] };

export function skinById(id: string) {
  return LUMI_SKINS.find((skin) => skin.id === id);
}

export function earnedCoins(progress: WalletProgress) {
  const achievements = new Set(progress.earnedAchievementIds);
  const books = [...achievements].filter((id) => BOOK_COMPLETION_ACHIEVEMENTS.has(id)).length;
  return new Set(progress.completedLessonIds).size * lumiRewardValues.completedLesson
    + new Set(progress.completedCheckpointIds).size * lumiRewardValues.checkpoint
    + achievements.size * lumiRewardValues.eligibleAchievement
    + books * lumiRewardValues.completedBook;
}

export function spentCoins(wallet: LumiWalletState = EMPTY_WALLET) {
  return wallet.purchases.reduce((sum, purchase) => sum + (purchase.source === "coins" ? purchase.price : 0), 0)
    + (wallet.freezes ?? []).reduce((sum, freeze) => sum + freeze.price, 0);
}

export function walletBalance(progress: WalletProgress) {
  return Math.max(0, earnedCoins(progress) - spentCoins(progress.lumiWallet));
}

export function ownsSkin(wallet: LumiWalletState = EMPTY_WALLET, id: LumiSkinId) {
  return id === "lumi_base" || wallet.purchases.some((purchase) => purchase.itemId === id);
}

export function equippedSkinId(wallet: LumiWalletState = EMPTY_WALLET): LumiSkinId {
  const id = wallet.equippedSkinId;
  return id && ownsSkin(wallet, id) ? id : "lumi_base";
}

export function skinState(skin: LumiSkinDefinition, progress: WalletProgress): LumiSkinState {
  const wallet = progress.lumiWallet ?? EMPTY_WALLET;
  if (equippedSkinId(wallet) === skin.id) return "equipped";
  if (ownsSkin(wallet, skin.id)) return "owned";
  // Skin da Bíblia não se compra: só é liberada ao concluir o livro.
  if (skin.free) return "locked";
  if (skin.requiredAchievementId && !progress.earnedAchievementIds.includes(skin.requiredAchievementId)) return "locked";
  return walletBalance(progress) >= skin.price ? "available" : "insufficient";
}

export type PurchaseResult =
  | { ok: true; wallet: LumiWalletState }
  | { ok: false; reason: "unknown" | "owned" | "locked" | "insufficient"; missing?: number; requirement?: string };

export function purchaseSkin(progress: WalletProgress, id: string, now = new Date()): PurchaseResult {
  const skin = skinById(id);
  if (!skin) return { ok: false, reason: "unknown" };
  const wallet = progress.lumiWallet ?? EMPTY_WALLET;
  if (ownsSkin(wallet, skin.id)) return { ok: false, reason: "owned" };
  if (skin.free) return { ok: false, reason: "locked", requirement: skin.requirementLabel };
  if (skin.requiredAchievementId && !progress.earnedAchievementIds.includes(skin.requiredAchievementId)) {
    return { ok: false, reason: "locked", requirement: skin.requirementLabel };
  }
  const balance = walletBalance(progress);
  if (balance < skin.price) return { ok: false, reason: "insufficient", missing: skin.price - balance };
  return {
    ok: true,
    wallet: { ...wallet, purchases: [...wallet.purchases, { itemId: skin.id, price: skin.price, at: now.toISOString(), source: "coins" }] }
  };
}

export function equipSkin(wallet: LumiWalletState = EMPTY_WALLET, id: string, now = new Date()): LumiWalletState | undefined {
  if (!isLumiSkinId(id) || !ownsSkin(wallet, id)) return undefined;
  return { ...wallet, equippedSkinId: id, equippedAt: now.toISOString() };
}

/** Registra skins que a conta já possuía no servidor, sem cobrar de novo. */
export function importAccountSkins(wallet: LumiWalletState = EMPTY_WALLET, ids: readonly string[], equipped?: string, now = new Date()): LumiWalletState {
  const owned = new Set(wallet.purchases.map((purchase) => purchase.itemId));
  const added: LumiPurchase[] = ids
    .filter((id): id is LumiSkinId => isLumiSkinId(id) && id !== "lumi_base" && !owned.has(id))
    .map((itemId) => ({ itemId, price: 0, at: now.toISOString(), source: "account" }));
  const next = added.length ? { ...wallet, purchases: [...wallet.purchases, ...added] } : wallet;
  if (!next.equippedSkinId && equipped && isLumiSkinId(equipped) && ownsSkin(next, equipped)) {
    return { ...next, equippedSkinId: equipped, equippedAt: new Date(0).toISOString() };
  }
  return next;
}

/** Mescla carteiras de dois aparelhos: une as compras e mantém a skin equipada mais recente. */
export function mergeWallets(local: LumiWalletState = EMPTY_WALLET, remote: LumiWalletState = EMPTY_WALLET): LumiWalletState {
  const byItem = new Map<string, LumiPurchase>();
  for (const purchase of [...remote.purchases, ...local.purchases]) {
    const previous = byItem.get(purchase.itemId);
    // Se uma skin aparece nos dois, vale a compra mais antiga (cobrada uma vez só).
    if (!previous || purchase.at < previous.at) byItem.set(purchase.itemId, purchase);
  }
  const localNewer = (local.equippedAt ?? "") >= (remote.equippedAt ?? "");
  const equipped = localNewer ? local : remote;
  const freezes = new Map<string, LumiFreeze>();
  for (const freeze of [...(remote.freezes ?? []), ...(local.freezes ?? [])]) freezes.set(freeze.at, freeze);
  const stickers: Record<string, number> = {};
  for (const source of [remote.stickers ?? {}, local.stickers ?? {}]) for (const [id, count] of Object.entries(source)) stickers[id] = Math.max(stickers[id] ?? 0, count);
  const shieldsEarned = Math.max(local.shieldsEarned ?? 0, remote.shieldsEarned ?? 0);
  const shieldsUsed = Math.max(local.shieldsUsed ?? 0, remote.shieldsUsed ?? 0);
  return {
    ...(Object.keys(stickers).length ? { stickers } : {}),
    ...(shieldsEarned ? { shieldsEarned } : {}),
    ...(shieldsUsed ? { shieldsUsed } : {}),
    purchases: [...byItem.values()].sort((a, b) => a.at.localeCompare(b.at)),
    ...(freezes.size ? { freezes: [...freezes.values()].sort((a, b) => a.at.localeCompare(b.at)) } : {}),
    equippedSkinId: equipped.equippedSkinId ?? (localNewer ? remote.equippedSkinId : local.equippedSkinId),
    equippedAt: equipped.equippedAt ?? (localNewer ? remote.equippedAt : local.equippedAt)
  };
}

/** Escudos de ofensiva disponíveis. */
export function shieldsAvailable(wallet: LumiWalletState = EMPTY_WALLET) {
  return Math.max(0, (wallet.shieldsEarned ?? 0) - (wallet.shieldsUsed ?? 0));
}

export function grantShield(wallet: LumiWalletState = EMPTY_WALLET): LumiWalletState {
  return { ...wallet, shieldsEarned: (wallet.shieldsEarned ?? 0) + 1 };
}

export function grantSticker(wallet: LumiWalletState = EMPTY_WALLET, id: string): LumiWalletState {
  const stickers = wallet.stickers ?? {};
  return { ...wallet, stickers: { ...stickers, [id]: (stickers[id] ?? 0) + 1 } };
}

/**
 * Skins da Bíblia que a pessoa já pode ter: livro concluído (todas as lições e checkpoints) ou, só nas cinco
 * primeiras, a conquista antiga de conclusão. Devolve ids de skin, na ordem da Bíblia.
 */
export function unlockedBibleSkinIds(books: readonly BookLike[], progress: WalletProgress): LumiSkinId[] {
  const byBook = new Map(books.map((book) => [book.id, book]));
  return BIBLE_SKINS.filter((skin) => {
    if (skin.legacyAchievementId && progress.earnedAchievementIds.includes(skin.legacyAchievementId)) return true;
    const book = byBook.get(skin.bookId);
    return Boolean(book) && isBookComplete(book!, [...progress.completedLessonIds], [...progress.completedCheckpointIds]);
  }).map((skin) => skin.skinId);
}

/** Registra, sem custo, as skins da Bíblia liberadas. Não repete o que a pessoa já tem (devolve a mesma carteira). */
export function grantBookSkins(wallet: LumiWalletState = EMPTY_WALLET, ids: readonly string[], now = new Date()): LumiWalletState {
  const owned = new Set(wallet.purchases.map((purchase) => purchase.itemId));
  const added: LumiPurchase[] = ids
    .filter((id): id is LumiSkinId => isLumiSkinId(id) && Boolean(bibleSkinById(id)) && !owned.has(id))
    .map((itemId) => ({ itemId, price: 0, at: now.toISOString(), source: "book" as const }));
  return added.length ? { ...wallet, purchases: [...wallet.purchases, ...added] } : wallet;
}
