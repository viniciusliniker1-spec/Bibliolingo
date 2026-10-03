import { describe, expect, it } from "vitest";
import { buildBibleReaderPath, isSafeTaskReturnPath } from "./bibleNavigation";

describe("navegação contextual para a Bíblia", () => {
  it("abre o primeiro versículo citado e preserva o retorno à tarefa", () => {
    const path = buildBibleReaderPath(
      {
        bookId: "genesis",
        startChapter: 1,
        startVerse: 26,
        endVerse: 27,
        label: "Gênesis 1:26–27"
      },
      "/lesson/genesis-u01-l02"
    );
    expect(path).toBe(
      "/bible?book=Gen&chapter=1&verse=26&return=%2Flesson%2Fgenesis-u01-l02"
    );
  });

  it("não aceita destino externo ou livro desconhecido", () => {
    expect(isSafeTaskReturnPath("https://example.com")).toBe(false);
    expect(
      buildBibleReaderPath({
        bookId: "unknown",
        startChapter: 1,
        label: "Desconhecido 1"
      })
    ).toBeUndefined();
  });
});
