import { describe, expect, it } from "vitest";
import { buildBibleReaderPath, isSafeTaskReturnPath } from "./bibleNavigation";

describe("navegação contextual para a Bíblia", () => {
  it("abre o primeiro versículo citado e preserva tarefa e passo", () => {
    const path = buildBibleReaderPath(
      {
        bookId: "genesis",
        startChapter: 1,
        startVerse: 26,
        endVerse: 27,
        label: "Gênesis 1:26–27"
      },
      "/lesson/genesis-u01-l02?step=3"
    );
    expect(path).toBe(
      "/bible?book=Gen&chapter=1&verse=26&return=%2Flesson%2Fgenesis-u01-l02%3Fstep%3D3"
    );
  });

  it("aceita somente destinos internos de lição", () => {
    expect(isSafeTaskReturnPath("/lesson/genesis-u01-l02?step=3")).toBe(true);
    expect(isSafeTaskReturnPath("https://example.com")).toBe(false);
    expect(isSafeTaskReturnPath("/formation/activity/manual-01?step=2")).toBe(true);
    expect(isSafeTaskReturnPath("/profile")).toBe(false);
  });

  it("não cria link para livro desconhecido", () => {
    expect(
      buildBibleReaderPath({
        bookId: "unknown",
        startChapter: 1,
        label: "Desconhecido 1"
      })
    ).toBeUndefined();
  });
});
