import { describe, expect, it } from "vitest";
import { greekUnits } from "../../src/content/greek/catalog";
import { hebrewUnits } from "../../src/content/hebrew/catalog";
import { GREEK_TRAIL, HEBREW_TRAIL, mirrorX, nodeLetter, unitWord } from "./languageTrailThemes";

describe("trilhas dos idiomas originais", () => {
  it("usam as letras do alfabeto de cada língua, na ordem", () => {
    expect(GREEK_TRAIL.letters).toHaveLength(24);
    expect(HEBREW_TRAIL.letters).toHaveLength(22);
    expect(nodeLetter(GREEK_TRAIL, 0)).toBe("α");
    expect(nodeLetter(GREEK_TRAIL, 24)).toBe("α");
    expect(nodeLetter(HEBREW_TRAIL, 1)).toBe("ב");
  });

  it("têm uma palavra-emblema para cada unidade", () => {
    expect(GREEK_TRAIL.unitWords.length).toBeGreaterThanOrEqual(greekUnits.length);
    expect(HEBREW_TRAIL.unitWords.length).toBeGreaterThanOrEqual(hebrewUnits.length);
    expect(unitWord(HEBREW_TRAIL, 7).meaning).toBe("paz");
  });

  it("o hebraico começa pela direita", () => {
    expect(mirrorX(HEBREW_TRAIL, 100, 400)).toBe(300);
    expect(mirrorX(GREEK_TRAIL, 100, 400)).toBe(100);
  });
});
