import { describe, expect, it } from "vitest";
import { highlightMatches, isLexiconQuery, pushRecent, snippet } from "./bibleSearch";

describe("busca bíblica", () => {
  it("destaca o termo ignorando acentos e maiúsculas", () => {
    expect(highlightMatches("A graça e a Graça", "graca")).toEqual([
      { text: "A ", match: false }, { text: "graça", match: true }, { text: " e a ", match: false }, { text: "Graça", match: true }
    ]);
  });
  it("corta trechos longos ao redor do termo", () => {
    const long = "palavra ".repeat(40) + "esperança " + "fim ".repeat(40);
    const part = snippet(long, "esperança", 20);
    expect(part).toContain("esperança");
    expect(part.startsWith("…") && part.endsWith("…")).toBe(true);
  });
  it("reconhece busca de Strong e de palavras gregas ou hebraicas", () => {
    expect(isLexiconQuery("G26")).toBe(true);
    expect(isLexiconQuery("ἀγάπη")).toBe(true);
    expect(isLexiconQuery("שלום")).toBe(true);
    expect(isLexiconQuery("amor")).toBe(false);
  });
  it("guarda buscas recentes sem repetir", () => {
    expect(pushRecent(["fé", "amor"], "Amor")).toEqual(["Amor", "fé"]);
  });
});
