import { describe, expect, it } from "vitest";
import { READER } from "./reader";
import { readerAudioKey, wordPhonemes } from "./readerPronunciation";

describe("pronúncia gravada do Leitor", () => {
  it("converte o grego com dígrafos, tônica e iota subscrito", () => {
    expect(wordPhonemes("lógos", "grc")).toBe("ˈloɡos");
    expect(wordPhonemes("theós", "grc")).toBe("θeˈos");
    expect(wordPhonemes("Christós", "grc")).toBe("xɾisˈtos");
    expect(wordPhonemes("archēi", "grc")).toBe("aɾxeː");
    expect(wordPhonemes("Iēsoûs", "grc")).toBe("ieːˈsus");
    expect(wordPhonemes("euangélion", "grc")).toBe("ewaŋˈɡelion");
  });
  it("converte o hebraico com sh, kh, ḥ e tônica final", () => {
    expect(wordPhonemes("shalóm", "hbo")).toBe("ʃaˈlom");
    expect(wordPhonemes("ḥésed", "hbo")).toBe("ˈχesed");
    expect(wordPhonemes("Adonai", "hbo")).toBe("adoˈnaj");
    expect(wordPhonemes("viḥunnékka", "hbo")).toBe("viχuˈneka");
  });
  it("gera fonemas e chaves únicas para todo o conteúdo", () => {
    for (const lang of ["grc", "hbo"] as const) {
      const keys = new Map<string, string>();
      for (const passage of READER[lang]) {
        for (const word of passage.words) {
          expect(wordPhonemes(word.translit, lang).replace(/[ˈː]/g, "").length).toBeGreaterThan(0);
          const key = readerAudioKey(lang, word.text);
          expect(keys.get(key) ?? word.text).toBe(word.text);
          keys.set(key, word.text);
        }
      }
    }
  });
});
