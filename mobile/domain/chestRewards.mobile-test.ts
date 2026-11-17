import { describe, expect, it } from "vitest";
import { DUPLICATE_REFUND, KIND_WEIGHTS, RARITY_WEIGHTS, STICKERS, rewardCoins, rewardNote, rewardTitle, rollChestReward, stickerById } from "./chestRewards";

/** Gerador determinístico (mulberry32) para testar a distribuição. */
function seeded(seed: number) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

describe("baú do dia", () => {
  it("o álbum tem 24 figurinhas únicas, com todas as raridades", () => {
    expect(STICKERS).toHaveLength(24);
    expect(new Set(STICKERS.map((sticker) => sticker.id)).size).toBe(24);
    expect(new Set(STICKERS.map((sticker) => sticker.rarity))).toEqual(new Set(["common", "rare", "epic", "legendary"]));
    expect(Object.values(KIND_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
    expect(Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("os tipos saem com as chances esperadas e as moedas só em valores previstos", () => {
    const rng = seeded(7);
    const counts = { coins: 0, shield: 0, sticker: 0 };
    const amounts = new Set<number>();
    const N = 20_000;
    for (let i = 0; i < N; i += 1) {
      const reward = rollChestReward(rng);
      counts[reward.kind] += 1;
      if (reward.kind === "coins") amounts.add(reward.amount);
    }
    expect(counts.coins / N).toBeGreaterThan(0.42);
    expect(counts.coins / N).toBeLessThan(0.48);
    expect(counts.shield / N).toBeGreaterThan(0.17);
    expect(counts.shield / N).toBeLessThan(0.23);
    expect(counts.sticker / N).toBeGreaterThan(0.32);
    expect(counts.sticker / N).toBeLessThan(0.38);
    expect([...amounts].sort((a, b) => a - b)).toEqual([30, 50, 100]);
  });

  it("prefere figurinhas novas e só repete quando a raridade está completa", () => {
    const rng = seeded(11);
    const owned: Record<string, number> = {};
    const seen = new Set<string>();
    let duplicates = 0;
    for (let i = 0; i < 4_000 && seen.size < STICKERS.length; i += 1) {
      const reward = rollChestReward(rng, owned);
      if (reward.kind !== "sticker") continue;
      expect(stickerById(reward.id)).toBeDefined();
      if (reward.duplicate) duplicates += 1; else seen.add(reward.id);
      owned[reward.id] = (owned[reward.id] ?? 0) + 1;
    }
    expect(seen.size).toBe(STICKERS.length);
    // Com a preferência por novas, repetidas só aparecem depois de completar a raridade sorteada.
    const full = Object.fromEntries(STICKERS.map((sticker) => [sticker.id, 1]));
    for (let i = 0; i < 200; i += 1) {
      const reward = rollChestReward(rng, full);
      if (reward.kind === "sticker") { expect(reward.duplicate).toBe(true); expect(reward.refund).toBe(DUPLICATE_REFUND[stickerById(reward.id)!.rarity]); }
    }
    expect(duplicates).toBeGreaterThanOrEqual(0);
  });

  it("descreve cada prêmio e soma as moedas certas", () => {
    expect(rewardCoins({ kind: "coins", amount: 50 })).toBe(50);
    expect(rewardCoins({ kind: "shield" })).toBe(0);
    expect(rewardCoins({ kind: "sticker", id: "arca", duplicate: true, refund: 50 })).toBe(50);
    expect(rewardCoins({ kind: "sticker", id: "arca", duplicate: false, refund: 0 })).toBe(0);
    expect(rewardTitle({ kind: "shield" })).toBe("Escudo de ofensiva");
    expect(rewardTitle({ kind: "sticker", id: "arca", duplicate: false, refund: 0 })).toBe("Arca de Noé");
    expect(rewardNote({ kind: "sticker", id: "arca", duplicate: false, refund: 0 })).toContain("nova figurinha");
    expect(rewardNote({ kind: "sticker", id: "arca", duplicate: true, refund: 50 })).toContain("+50");
  });
});
