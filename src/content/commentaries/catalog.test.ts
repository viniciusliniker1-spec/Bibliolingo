import { describe, expect, it } from "vitest";
import { commentarySources, commentaryUnits, commentariesForVerse, validateCommentaryUnit } from "./catalog";

describe("catálogo de comentários históricos", () => {
  it("não publica corpus sem fonte portuguesa licenciada", () => {
    expect(commentaryUnits).toEqual([]);
    expect(commentariesForVerse("Joh", 3, 16)).toEqual([]);
    expect(commentarySources.every((source) => source.availability === "awaiting-licensed-portuguese-source")).toBe(true);
  });

  it("rejeita unidade cuja fonte ainda não foi aprovada", () => {
    expect(validateCommentaryUnit({
      id: "draft",
      sourceId: "calvin",
      bookOsis: "Joh",
      chapter: 3,
      verseStart: 16,
      verseEnd: 16,
      text: "rascunho",
      edition: "edição",
      translator: "tradutor",
      sourceUrl: "https://example.com",
      license: "licença",
      attribution: "atribuição"
    })).toBe(false);
  });
});
