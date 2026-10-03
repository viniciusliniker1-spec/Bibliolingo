import { describe, expect, it } from "vitest";
import { bibleBooks } from "./catalog";

describe("catálogo bíblico", () => {
  it("contém o cânon protestante de 66 livros e 1189 capítulos", () => {
    expect(bibleBooks).toHaveLength(66);
    expect(bibleBooks.filter((book) => book.testament === "old")).toHaveLength(39);
    expect(bibleBooks.filter((book) => book.testament === "new")).toHaveLength(27);
    expect(bibleBooks.reduce((total, book) => total + book.chapters, 0)).toBe(1189);
    expect(new Set(bibleBooks.map((book) => book.osis)).size).toBe(66);
  });
});
