import { describe, expect, it } from "vitest";
import { bibleBookByOsis } from "./catalog";
import { crossReferencesForChapter } from "./crossReferences";

describe("crossReferencesForChapter", () => {
  it("retorna relações curadas e navegáveis", () => {
    const references = crossReferencesForChapter("Gen", 1);
    expect(references.some((item) => item.to.bookOsis === "John")).toBe(true);
    for (const reference of references) {
      const book = bibleBookByOsis.get(reference.to.bookOsis);
      expect(book).toBeDefined();
      expect(reference.to.chapter).toBeGreaterThanOrEqual(1);
      expect(reference.to.chapter).toBeLessThanOrEqual(book?.chapters ?? 0);
      expect(reference.note.length).toBeGreaterThan(20);
    }
  });

  it("não cria relações para capítulos sem curadoria", () => {
    expect(crossReferencesForChapter("Obad", 1)).toEqual([]);
  });
});
