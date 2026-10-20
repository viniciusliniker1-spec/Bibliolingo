import { describe, expect, it } from "vitest";
import { bibleAnnotationId, parseBibleReference } from "./bibleReference";

describe("referências bíblicas", () => {
  it("encontra livro, capítulo e versículo por nome ou abreviação", () => {
    expect(parseBibleReference("João 3:16", "Gen", 1)).toMatchObject({
      book: { osis: "John" },
      chapter: 3,
      verse: 16
    });
    expect(parseBibleReference("1 Jo 4:8", "Gen", 1)).toMatchObject({
      book: { osis: "1John" },
      chapter: 4,
      verse: 8
    });
  });

  it("aceita capítulo:versículo e versículo no contexto atual", () => {
    expect(parseBibleReference("50:20", "Gen", 1)).toMatchObject({ chapter: 50, verse: 20 });
    expect(parseBibleReference("7", "Ps", 23)).toMatchObject({ chapter: 23, verse: 7 });
  });

  it("rejeita referência fora do livro e cria chave estável", () => {
    expect(parseBibleReference("João 99:1", "Gen", 1)).toBeUndefined();
    expect(bibleAnnotationId("almeida-1819", "John", 3, 16)).toBe(
      "almeida-1819:John:3:16"
    );
  });
});
