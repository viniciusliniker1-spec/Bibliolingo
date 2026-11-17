import { describe, expect, it } from "vitest";
import { updateStreak } from "../../src/domain/streak";
import { applyFreeze, freezeOffer, frozenDates, FREEZE_PRICE_PER_DAY } from "./streakFreeze";
import { grantShield, grantSticker, mergeWallets, shieldsAvailable, walletBalance } from "./lumiWallet";

const at = (date: string) => new Date(`${date}T10:00:00`);
const base = { completedLessonIds: Array.from({ length: 20 }, (_, i) => `l${i}`), completedCheckpointIds: [], earnedAchievementIds: [] };

describe("congelar a ofensiva", () => {
  it("não oferece nada se estudou hoje, ontem ou nunca estudou", () => {
    expect(freezeOffer({ ...base, streak: 5, lastStudyDate: "2026-11-10" }, at("2026-11-10"))).toBeUndefined();
    expect(freezeOffer({ ...base, streak: 5, lastStudyDate: "2026-11-09" }, at("2026-11-10"))).toBeUndefined();
    expect(freezeOffer({ ...base, streak: 0 }, at("2026-11-10"))).toBeUndefined();
  });

  it("oferece salvar 1 ou 2 dias perdidos, e mais que isso não", () => {
    const one = freezeOffer({ ...base, streak: 5, lastStudyDate: "2026-11-08" }, at("2026-11-10"));
    expect(one?.days).toEqual(["2026-11-09"]);
    expect(one?.price).toBe(FREEZE_PRICE_PER_DAY);
    const two = freezeOffer({ ...base, streak: 5, lastStudyDate: "2026-11-07" }, at("2026-11-10"));
    expect(two?.days).toEqual(["2026-11-08", "2026-11-09"]);
    expect(two?.price).toBe(2 * FREEZE_PRICE_PER_DAY);
    expect(freezeOffer({ ...base, streak: 5, lastStudyDate: "2026-11-06" }, at("2026-11-10"))).toBeUndefined();
  });

  it("cobra as moedas e a ofensiva continua ao estudar hoje", () => {
    const progress = { ...base, streak: 5, lastStudyDate: "2026-11-08" };
    const before = walletBalance(progress);
    const result = applyFreeze(progress, at("2026-11-10"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(walletBalance({ ...progress, lumiWallet: result.wallet })).toBe(before - FREEZE_PRICE_PER_DAY);
    expect(result.lastStudyDate).toBe("2026-11-09");
    expect(updateStreak(result.lastStudyDate, 5, 5, at("2026-11-10")).streak).toBe(6);
    expect(frozenDates(result.wallet).has("2026-11-09")).toBe(true);
    // depois de congelar não há mais o que salvar
    expect(freezeOffer({ ...progress, lastStudyDate: result.lastStudyDate, lumiWallet: result.wallet }, at("2026-11-10"))).toBeUndefined();
  });

  it("recusa sem moedas suficientes e diz quanto falta", () => {
    const poor = { completedLessonIds: [], completedCheckpointIds: [], earnedAchievementIds: [], streak: 5, lastStudyDate: "2026-11-08" };
    const result = applyFreeze(poor, at("2026-11-10"));
    expect(result).toEqual({ ok: false, reason: "insufficient", missing: FREEZE_PRICE_PER_DAY });
  });

  it("une congelamentos de dois aparelhos sem duplicar", () => {
    const freeze = { at: "2026-11-10T10:00:00.000Z", price: 30, dates: ["2026-11-09"] };
    const merged = mergeWallets({ purchases: [], freezes: [freeze] }, { purchases: [], freezes: [freeze] });
    expect(merged.freezes).toHaveLength(1);
  });
});

describe("escudos de ofensiva (do baú)", () => {
  const poor = { completedLessonIds: [], completedCheckpointIds: [], earnedAchievementIds: [], streak: 5, lastStudyDate: "2026-11-07" };

  it("um escudo cobre um dia de graça e o outro dia custa moedas", () => {
    const withShield = { ...poor, lumiWallet: { purchases: [], shieldsEarned: 1 } };
    const offer = freezeOffer(withShield, at("2026-11-10"))!;
    expect(offer.days).toHaveLength(2);
    expect(offer.shields).toBe(1);
    expect(offer.price).toBe(FREEZE_PRICE_PER_DAY);
    expect(offer.affordable).toBe(false);
  });

  it("sem moedas, um escudo salva um dia perdido sem custo e é consumido", () => {
    const progress = { ...poor, lastStudyDate: "2026-11-08", lumiWallet: { purchases: [], shieldsEarned: 1 } };
    const result = applyFreeze(progress, at("2026-11-10"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.freeze.price).toBe(0);
    expect(result.wallet.shieldsUsed).toBe(1);
    expect(result.lastStudyDate).toBe("2026-11-09");
    expect(shieldsAvailable(result.wallet)).toBe(0);
  });
});

describe("carteira: escudos e figurinhas", () => {
  it("concede e mescla sem perder nem duplicar", () => {
    let local = grantShield({ purchases: [] });
    local = grantSticker(grantSticker(local, "arca"), "arca");
    expect(shieldsAvailable(local)).toBe(1);
    expect(local.stickers).toEqual({ arca: 2 });
    const remote = grantSticker({ purchases: [], shieldsEarned: 3, shieldsUsed: 1 }, "estrela");
    const merged = mergeWallets(local, remote);
    expect(merged.shieldsEarned).toBe(3);
    expect(merged.shieldsUsed).toBe(1);
    expect(merged.stickers).toEqual({ arca: 2, estrela: 1 });
  });
});
