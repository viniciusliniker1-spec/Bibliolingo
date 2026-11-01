/**
 * Carteira da Lumi calculada no próprio aparelho.
 *
 * O saldo é derivado do progresso (lições, checkpoints, conquistas e livros
 * concluídos), então funciona offline, inclusive para visitantes, sem
 * "confirmar moedas" no servidor. Compras e a skin equipada ficam no progresso,
 * que já é enviado para a conta: elas acompanham a pessoa em outro aparelho.
 */
import { isLumiSkinId, lumiRewardValues, type LumiRarity, type LumiSkinId } from "../../src/domain/lumi";

export interface LumiPurchase {
  itemId: LumiSkinId;
  price: number;
  at: string;
  /** "coins": comprada com moedas; "account": já pertencia à conta antes da carteira local. */
  source: "coins" | "account";
}

export interface LumiWalletState {
  purchases: LumiPurchase[];
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
  { id: "lumi_eva", name: "Lumi Jardim do Éden", description: "Skin temática de Gênesis.", price: 200, rarity: "rare", requiredAchievementId: "genesis-complete", requirementLabel: "Conclua Gênesis" },
  { id: "lumi_moises", name: "Lumi Moisés", description: "Skin temática de Êxodo.", price: 300, rarity: "epic", requiredAchievementId: "exodus-complete", requirementLabel: "Conclua Êxodo" },
  { id: "lumi_levitico", name: "Lumi Sacerdotal", description: "Skin temática de Levítico.", price: 350, rarity: "epic", requiredAchievementId: "leviticus-complete", requirementLabel: "Conclua Levítico" },
  { id: "lumi_numeros", name: "Lumi Peregrina", description: "Skin temática de Números.", price: 350, rarity: "epic", requiredAchievementId: "numbers-complete", requirementLabel: "Conclua Números" },
  { id: "lumi_deuteronomio", name: "Lumi da Aliança", description: "Skin temática de Deuteronômio.", price: 400, rarity: "legendary", requiredAchievementId: "deuteronomy-complete", requirementLabel: "Conclua Deuteronômio" }
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
  return wallet.purchases.reduce((sum, purchase) => sum + (purchase.source === "coins" ? purchase.price : 0), 0);
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
  return {
    purchases: [...byItem.values()].sort((a, b) => a.at.localeCompare(b.at)),
    equippedSkinId: equipped.equippedSkinId ?? (localNewer ? remote.equippedSkinId : local.equippedSkinId),
    equippedAt: equipped.equippedAt ?? (localNewer ? remote.equippedAt : local.equippedAt)
  };
}
