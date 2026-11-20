import { describe, expect, it } from "vitest";
import { COLLECTIBLES } from "./chestRewards";
import { CARD_OVERALL_BAND, CARD_STAT_KEYS, LUMI_CARD_DEFS, cardProfile, lumiCardById } from "./lumiCards";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

describe("cartas da Lumi", () => {
  it("são 39, com ids únicos, distribuídas por raridade e todas com arte", () => {
    expect(LUMI_CARD_DEFS).toHaveLength(39);
    expect(new Set(LUMI_CARD_DEFS.map((card) => card.id)).size).toBe(39);
    const by = (r: string) => LUMI_CARD_DEFS.filter((card) => card.rarity === r).length;
    expect([by("common"), by("rare"), by("epic"), by("legendary")]).toEqual([12, 12, 9, 6]);
    // O Vitest não lê imagens: confere o arquivo de cada carta e o registro estático do Metro por texto.
    const registry = readFileSync(path.resolve(__dirname, "../assets/stickerAssets.ts"), "utf8");
    for (const card of LUMI_CARD_DEFS) {
      expect(existsSync(path.resolve(__dirname, `../assets/stickers/${card.id}.webp`)), card.id).toBe(true);
      expect(registry, card.id).toContain(`"${card.id}": require("./stickers/${card.id}.webp")`);
    }
    expect(COLLECTIBLES.map((sticker) => sticker.id)).toEqual(LUMI_CARD_DEFS.map((card) => card.id));
  });

  it("a nota geral fica na faixa da raridade e é a média dos seis atributos", () => {
    for (const card of LUMI_CARD_DEFS) {
      const profile = cardProfile(card);
      const [lo, hi] = CARD_OVERALL_BAND[card.rarity];
      expect(profile.overall, card.id).toBeGreaterThanOrEqual(lo);
      expect(profile.overall, card.id).toBeLessThanOrEqual(hi);
      const mean = Math.round(CARD_STAT_KEYS.reduce((sum, key) => sum + profile.stats[key], 0) / 6);
      expect(mean, card.id).toBe(profile.overall);
      for (const key of CARD_STAT_KEYS) { expect(profile.stats[key]).toBeGreaterThanOrEqual(35); expect(profile.stats[key]).toBeLessThanOrEqual(99); }
    }
  });

  it("raridades mais altas têm notas mais altas e o atributo principal é o maior", () => {
    const avg = (r: string) => { const l = LUMI_CARD_DEFS.filter((card) => card.rarity === r); return l.reduce((s, card) => s + cardProfile(card).overall, 0) / l.length; };
    expect(avg("common")).toBeLessThan(avg("rare"));
    expect(avg("rare")).toBeLessThan(avg("epic"));
    expect(avg("epic")).toBeLessThan(avg("legendary"));
    for (const card of LUMI_CARD_DEFS) {
      const { stats } = cardProfile(card);
      expect(stats[card.focus[0]], card.id).toBe(Math.max(...CARD_STAT_KEYS.map((key) => stats[key])));
    }
  });

  it("é determinística e numera as cartas de 1 a 40", () => {
    const card = lumiCardById("realeza")!;
    expect(cardProfile(card)).toEqual(cardProfile(card));
    expect(LUMI_CARD_DEFS.map((c) => cardProfile(c).number)).toEqual(Array.from({ length: 39 }, (_, i) => i + 1));
    expect(cardProfile(card).total).toBe(39);
  });
});
