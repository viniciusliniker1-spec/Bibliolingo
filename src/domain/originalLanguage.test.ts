import { describe, expect, it } from "vitest";
import { explainMorphology, originalLanguageLabel, transliterateOriginal } from "./originalLanguage";

describe("original language helpers", () => {
  it("translitera formas gregas e hebraicas de modo determinístico", () => {
    expect(transliterateOriginal("λόγος", "grc")).toBe("logos");
    expect(transliterateOriginal("שלום", "hbo")).toBe("šlwm");
  });

  it("distingue hebraico, aramaico e grego", () => {
    expect(originalLanguageLabel("hbo")).toBe("hebraico bíblico");
    expect(originalLanguageLabel("arc")).toBe("aramaico bíblico");
    expect(originalLanguageLabel("grc")).toBe("grego koiné");
  });

  it("traduz códigos conhecidos e preserva o código auditável", () => {
    expect(explainMorphology("N-NOM-S", "grc")).toContain("nominativo");
    expect(explainMorphology("HVqp3ms", "hbo")).toContain("código OSHB");
  });
});
