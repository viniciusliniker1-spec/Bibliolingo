import { describe, expect, it } from "vitest";
import { buildReaderSession, isPassageUnlocked, nextPassage, passageText, READER } from "./reader";

const GREEK = /^[Ͱ-Ͽἀ-῿̀-ͯ᾽’]+$/;
const HEBREW = /^[֐-׿יִ-ﭏ]+$/;

describe("leitor do original", () => {
  it("tem textos completos e só com letras do idioma", () => {
    for (const [lang, passages] of Object.entries(READER)) {
      expect(passages.length).toBeGreaterThanOrEqual(15);
      expect(new Set(passages.map((p) => p.id)).size).toBe(passages.length);
      for (const passage of passages) {
        expect(passage.words.length).toBeGreaterThan(0);
        expect(passage.translation.length).toBeGreaterThan(3);
        for (const word of passage.words) {
          expect(word.text).toMatch(lang === "grc" ? GREEK : HEBREW);
          expect(word.translit.length).toBeGreaterThan(0);
          expect(word.gloss.length).toBeGreaterThan(0);
        }
      }
      // Níveis em ordem crescente.
      const levels = passages.map((p) => p.level);
      expect([...levels].sort()).toEqual(levels);
    }
  });

  it("libera em sequência", () => {
    const passages = READER.grc;
    expect(isPassageUnlocked(passages, {}, passages[0].id)).toBe(true);
    expect(isPassageUnlocked(passages, {}, passages[1].id)).toBe(false);
    expect(isPassageUnlocked(passages, { [passages[0].id]: true }, passages[1].id)).toBe(true);
    expect(nextPassage(passages, { [passages[0].id]: true })?.id).toBe(passages[1].id);
  });

  it("monta sessões com opções válidas", () => {
    for (const lang of ["grc", "hbo"] as const) {
      for (const passage of READER[lang]) {
        const steps = buildReaderSession(lang, passage, "s");
        expect(steps[0].kind).toBe("read");
        expect(steps.at(-1)?.kind).toBe("solo");
        for (const step of steps) {
          if (step.kind === "sound" || step.kind === "meaning") {
            expect(step.options).toHaveLength(4);
            expect(step.options).toContain(step.answer);
            expect(new Set(step.options.map((o) => o.toLowerCase())).size).toBe(4);
          }
        }
      }
    }
  });

  it("junta o maqef do hebraico sem espaço", () => {
    expect(passageText(READER.hbo.find((p) => p.id === "hbo-f1")!)).toContain("וַיְהִי־אוֹר");
  });
});
