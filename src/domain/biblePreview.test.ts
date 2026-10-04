import { describe, expect, it } from "vitest";
import { getBiblePreview } from "./biblePreview";
import type { BibleBookData } from "../services/bible";

const data: BibleBookData = {
  version: "test",
  book: "Gen",
  bookId: 1,
  englishName: "Genesis",
  testament: "OT",
  chapters: [
    { chapter: 1, verses: Array.from({ length: 10 }, (_, index) => ({ number: index + 1, text: "v" + (index + 1) })) },
    { chapter: 2, verses: Array.from({ length: 4 }, (_, index) => ({ number: index + 1, text: "c2v" + (index + 1) })) }
  ]
};

describe("prévia bíblica", () => {
  it("recorta uma referência exata", () => {
    const result = getBiblePreview(data, {
      bookId: "genesis",
      label: "Gênesis 1:3–5",
      startChapter: 1,
      startVerse: 3,
      endChapter: 1,
      endVerse: 5
    });
    expect(result.verses.map((verse) => verse.number)).toEqual([3, 4, 5]);
    expect(result.truncated).toBe(false);
  });

  it("limita passagens longas para não criar uma parede de texto", () => {
    const result = getBiblePreview(data, {
      bookId: "genesis",
      label: "Gênesis 1–2",
      startChapter: 1,
      endChapter: 2
    }, 5);
    expect(result.verses).toHaveLength(5);
    expect(result.truncated).toBe(true);
  });
});
