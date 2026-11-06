import { describe, expect, it } from "vitest";
import { nextReaction } from "./lumiBehavior";
import { LUMI_RULES } from "./lumiPhrases";

describe("falas da Lumi", () => {
  it("cabem no balão e só usam variáveis conhecidas", () => {
    const known = new Set(["nome", "licao", "livro", "caps", "dias", "faltam", "minutos"]);
    for (const rule of Object.values(LUMI_RULES)) {
      expect(rule.phrases.length).toBeGreaterThan(0);
      for (const phrase of rule.phrases) {
        expect(phrase.length).toBeLessThanOrEqual(110);
        for (const [, key] of phrase.matchAll(/\{(\w+)\}/g)) expect(known.has(key)).toBe(true);
      }
    }
  });

  it("alterna frases e animações ao tocar na Lumi", () => {
    const vars = { nome: "Ana", licao: "A criação", dias: 3 };
    const first = nextReaction("toque", {}, vars, LUMI_RULES);
    const second = nextReaction("toque", first.rotation, vars, LUMI_RULES);
    expect(first.text).not.toBe(second.text);
    expect(first.animation).not.toBe(second.animation);
    expect(first.text).not.toMatch(/\{\w+\}/);
  });
});
