import { describe, expect, it } from "vitest";
import { getLumiItemState, normalizeLumiItem, type LumiItem } from "./lumi";

const item: LumiItem = {
  id: "head.test", name: "Teste", description: "Teste", category: "head",
  price: 10, rarity: "common", assetStatus: "pending",
  unlockRule: { kind: "none" }, layerOrder: 10,
  anchor: { x: .5, y: .2, scale: .4 }, active: true
};

describe("Lumi economy domain", () => {
  it("separates locked, available, owned and equipped states", () => {
    expect(getLumiItemState(item, { balance: 0, inventory: [], equipment: [] }, [])).toBe("available");
    expect(getLumiItemState(item, { balance: 0, inventory: [{ itemId: item.id, acquiredAt: "", acquisitionType: "purchase" }], equipment: [] }, [])).toBe("owned");
    expect(getLumiItemState(item, { balance: 0, inventory: [], equipment: [{ itemId: item.id, category: "head", updatedAt: "" }] }, [])).toBe("equipped");
    expect(getLumiItemState({ ...item, unlockRule: { kind: "achievement", achievement_id: "a1" } }, { balance: 0, inventory: [], equipment: [] }, [])).toBe("locked");
  });

  it("normalizes unknown server rows safely", () => {
    expect(normalizeLumiItem({ id: "x", category: "unknown", price: -10 }).price).toBe(0);
    expect(normalizeLumiItem({ id: "x", category: "unknown" }).assetStatus).toBe("pending");
  });
});
