export const lumiCategories = ["head", "glasses", "outfit", "backpack", "special", "celebration"] as const;
export type LumiCategory = typeof lumiCategories[number];
export type LumiRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type LumiAssetStatus = "approved" | "pending";

export interface LumiItem {
  id: string;
  name: string;
  description: string;
  category: LumiCategory;
  price: number;
  rarity: LumiRarity;
  assetPath?: string;
  assetStatus: LumiAssetStatus;
  unlockRule: { kind: "none" } | { kind: "achievement"; achievement_id: string };
  layerOrder: number;
  anchor: { x: number; y: number; scale: number };
  active: boolean;
}

export interface LumiInventoryEntry {
  itemId: string;
  acquiredAt: string;
  acquisitionType: "purchase" | "achievement" | "migration" | "grant";
}

export interface LumiEquipmentEntry {
  category: LumiCategory;
  itemId: string;
  updatedAt: string;
}

export interface LumiTransaction {
  id: string;
  amount: number;
  transactionType: string;
  sourceEventId: string;
  itemId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface LumiAccountState {
  balance: number;
  items: LumiItem[];
  inventory: LumiInventoryEntry[];
  equipment: LumiEquipmentEntry[];
  transactions: LumiTransaction[];
  profilePhotoPath?: string;
}

export const lumiRewardValues = {
  firstLesson: 10,
  checkpoint: 25,
  completedBook: 100,
  eligibleAchievement: 30
} as const;

export function isLumiItemUnlocked(item: LumiItem, achievementIds: readonly string[]) {
  if (item.unlockRule.kind === "none") return true;
  return achievementIds.includes(item.unlockRule.achievement_id);
}

export function getLumiItemState(
  item: LumiItem,
  state: Pick<LumiAccountState, "balance" | "inventory" | "equipment">,
  achievementIds: readonly string[]
): "locked" | "available" | "owned" | "equipped" {
  if (state.equipment.some((entry) => entry.itemId === item.id)) return "equipped";
  if (state.inventory.some((entry) => entry.itemId === item.id)) return "owned";
  if (!isLumiItemUnlocked(item, achievementIds)) return "locked";
  return "available";
}

export function normalizeLumiItem(row: Record<string, unknown>): LumiItem {
  const category = lumiCategories.includes(row.category as LumiCategory)
    ? row.category as LumiCategory
    : "special";
  const rule = row.unlock_rule && typeof row.unlock_rule === "object"
    ? row.unlock_rule as LumiItem["unlockRule"]
    : { kind: "none" } as const;
  const anchor = row.anchor && typeof row.anchor === "object"
    ? row.anchor as LumiItem["anchor"]
    : { x: 0.5, y: 0.5, scale: 1 };
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    category,
    price: Math.max(0, Number(row.price ?? 0)),
    rarity: (["common", "uncommon", "rare", "epic", "legendary"].includes(String(row.rarity))
      ? row.rarity
      : "common") as LumiRarity,
    assetPath: row.asset_path ? String(row.asset_path) : undefined,
    assetStatus: row.asset_status === "approved" ? "approved" : "pending",
    unlockRule: rule,
    layerOrder: Number(row.layer_order ?? 10),
    anchor,
    active: row.active !== false
  };
}

export const lumiCategoryLabels: Record<LumiCategory, string> = {
  head: "Cabeça",
  glasses: "Óculos",
  outfit: "Roupas",
  backpack: "Mochilas",
  special: "Especiais",
  celebration: "Comemorativos"
};
