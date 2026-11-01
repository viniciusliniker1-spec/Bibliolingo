import { describe, expect, it } from "vitest";
import { earnedCoins, equipSkin, equippedSkinId, importAccountSkins, mergeWallets, purchaseSkin, skinState, skinById, walletBalance, type WalletProgress } from "./lumiWallet";

const lessons = (n: number) => Array.from({ length: n }, (_, i) => `genesis-u01-l0${i}`);
const base = (overrides: Partial<WalletProgress> = {}): WalletProgress => ({
  completedLessonIds: [], completedCheckpointIds: [], earnedAchievementIds: [], ...overrides
});

describe("carteira da Lumi no aparelho", () => {
  it("calcula moedas só a partir do progresso, sem sincronizar", () => {
    expect(earnedCoins(base({ completedLessonIds: lessons(4) }))).toBe(20);
    expect(earnedCoins(base({ completedLessonIds: [...lessons(2), ...lessons(2)] }))).toBe(10);
    expect(earnedCoins(base({ completedCheckpointIds: ["genesis-u01-checkpoint"] }))).toBe(25);
    expect(earnedCoins(base({ earnedAchievementIds: ["first-lesson"] }))).toBe(30);
    expect(earnedCoins(base({ earnedAchievementIds: ["genesis-complete"] }))).toBe(130);
  });

  it("compra quando há moedas e desconta o preço", () => {
    const progress = base({ completedLessonIds: lessons(20) });
    expect(walletBalance(progress)).toBe(100);
    expect(skinState(skinById("lumi_oculos")!, progress)).toBe("available");
    const result = purchaseSkin(progress, "lumi_oculos");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const after = { ...progress, lumiWallet: result.wallet };
    expect(walletBalance(after)).toBe(0);
    expect(skinState(skinById("lumi_oculos")!, after)).toBe("owned");
    expect(purchaseSkin(after, "lumi_oculos")).toMatchObject({ ok: false, reason: "owned" });
  });

  it("recusa com o motivo certo", () => {
    expect(purchaseSkin(base({ completedLessonIds: lessons(3) }), "lumi_oculos")).toMatchObject({ ok: false, reason: "insufficient", missing: 85 });
    expect(skinState(skinById("lumi_oculos")!, base())).toBe("insufficient");
    expect(purchaseSkin(base({ completedLessonIds: lessons(99) }), "lumi_eva")).toMatchObject({ ok: false, reason: "locked", requirement: "Conclua Gênesis" });
    expect(purchaseSkin(base(), "inexistente")).toMatchObject({ ok: false, reason: "unknown" });
  });

  it("equipa só skins compradas e volta à original se a skin sumir", () => {
    const bought = purchaseSkin(base({ completedLessonIds: lessons(20) }), "lumi_oculos");
    if (!bought.ok) throw new Error("compra deveria funcionar");
    expect(equipSkin(bought.wallet, "lumi_hiphop")).toBeUndefined();
    const equipped = equipSkin(bought.wallet, "lumi_oculos")!;
    expect(equippedSkinId(equipped)).toBe("lumi_oculos");
    expect(equippedSkinId({ purchases: [], equippedSkinId: "lumi_oculos" })).toBe("lumi_base");
    expect(skinState(skinById("lumi_oculos")!, { ...base(), lumiWallet: equipped })).toBe("equipped");
  });

  it("mantém as skins que a conta já tinha, sem cobrar", () => {
    const wallet = importAccountSkins(undefined, ["lumi_base", "lumi_hiphop"], "lumi_hiphop");
    expect(wallet.purchases).toHaveLength(1);
    expect(walletBalance({ ...base(), lumiWallet: wallet })).toBe(0);
    expect(equippedSkinId(wallet)).toBe("lumi_hiphop");
    expect(importAccountSkins(wallet, ["lumi_hiphop"])).toBe(wallet);
  });

  it("mescla dois aparelhos sem cobrar duas vezes", () => {
    const a = { purchases: [{ itemId: "lumi_oculos" as const, price: 100, at: "2026-11-01T10:00:00Z", source: "coins" as const }], equippedSkinId: "lumi_oculos" as const, equippedAt: "2026-11-01T10:00:00Z" };
    const b = { purchases: [{ itemId: "lumi_oculos" as const, price: 100, at: "2026-11-01T11:00:00Z", source: "coins" as const }, { itemId: "lumi_hiphop" as const, price: 250, at: "2026-11-01T12:00:00Z", source: "coins" as const }], equippedSkinId: "lumi_hiphop" as const, equippedAt: "2026-11-01T12:00:00Z" };
    const merged = mergeWallets(a, b);
    expect(merged.purchases.map((p) => p.itemId)).toEqual(["lumi_oculos", "lumi_hiphop"]);
    expect(merged.purchases.find((p) => p.itemId === "lumi_oculos")?.at).toBe("2026-11-01T10:00:00Z");
    expect(merged.equippedSkinId).toBe("lumi_hiphop");
  });
});
