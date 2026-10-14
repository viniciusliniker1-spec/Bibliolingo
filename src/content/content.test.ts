import { describe, expect, it } from "vitest";
import { journeyBooks, orderedActivityIds, orderedLessons } from "./catalog";
import { OLD_TESTAMENT_CURRICULUM, OLD_TESTAMENT_TARGET_TOTALS } from "./oldTestament/curriculum";

const OLD_TESTAMENT_CHAPTERS: Record<string, number> = {
  genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
  joshua: 24, judges: 21, ruth: 4, "1-samuel": 31, "2-samuel": 24,
  "1-kings": 22, "2-kings": 25, "1-chronicles": 29, "2-chronicles": 36,
  ezra: 10, nehemiah: 13, esther: 10, job: 42, psalms: 150, proverbs: 31,
  ecclesiastes: 12, "song-of-songs": 8, isaiah: 66, jeremiah: 52,
  lamentations: 5, ezekiel: 48, daniel: 12, hosea: 14, joel: 3, amos: 9,
  obadiah: 1, jonah: 4, micah: 7, nahum: 3, habakkuk: 3, zephaniah: 3,
  haggai: 2, zechariah: 14, malachi: 4
};

describe("integridade do conteúdo da jornada", () => {
  it("mantém IDs únicos e ensino imediatamente antes de cada exercício", () => {
    const ids = new Set<string>();
    for (const book of journeyBooks) {
      for (const unit of book.units) {
        expect(unit.bookId).toBe(book.id);
        expect(ids.has(unit.id)).toBe(false);
        ids.add(unit.id);
        expect(unit.lessons.length).toBeGreaterThanOrEqual(4);
        for (const lesson of unit.lessons) {
          expect(ids.has(lesson.id)).toBe(false);
          ids.add(lesson.id);
          expect(lesson.steps[0]?.type).toBe("learn");
          for (const [stepIndex, step] of lesson.steps.entries()) {
            expect(ids.has(step.id)).toBe(false);
            ids.add(step.id);
            if (step.type !== "learn") {
              expect(lesson.steps[stepIndex - 1]?.type).toBe("learn");
              expect(step.objective.length).toBeGreaterThan(10);
              expect(step.explanation.length).toBeGreaterThan(10);
              expect(step.reference.bookId).toBe(book.id);
            }
          }
        }
        expect(unit.checkpoint.exercises.length).toBeGreaterThanOrEqual(4);
        for (const exercise of unit.checkpoint.exercises) {
          expect(ids.has(exercise.id)).toBe(false);
          ids.add(exercise.id);
          expect(exercise.reference.bookId).toBe(book.id);
        }
      }
    }
  });

  it("cobre os 39 livros e os 929 capítulos do Antigo Testamento protestante", () => {
    expect(journeyBooks.map((book) => book.id)).toEqual(Object.keys(OLD_TESTAMENT_CHAPTERS));
    expect(journeyBooks).toHaveLength(39);

    let coveredChapterCount = 0;
    for (const book of journeyBooks) {
      const expectedCount = OLD_TESTAMENT_CHAPTERS[book.id];
      const chapters = [...new Set(book.units.flatMap((unit) => unit.chapters))].sort((a, b) => a - b);
      expect(chapters).toEqual(Array.from({ length: expectedCount }, (_, index) => index + 1));
      coveredChapterCount += chapters.length;
    }

    expect(coveredChapterCount).toBe(929);
    const firstKings = journeyBooks.find((book) => book.id === "1-kings");
    expect(firstKings?.units).toHaveLength(6);
    expect(firstKings?.units.flatMap((unit) => unit.lessons)).toHaveLength(24);
    const psalms = journeyBooks.find((book) => book.id === "psalms");
    expect(psalms?.units).toHaveLength(15);
    expect(psalms?.units.flatMap((unit) => unit.lessons).length).toBeGreaterThanOrEqual(60);
    expect(orderedLessons).toHaveLength(431);
    expect(orderedActivityIds).toHaveLength(538);
  });

  it("mantém uma matriz curricular proporcional à extensão e densidade de cada livro", () => {
    expect(OLD_TESTAMENT_TARGET_TOTALS).toEqual({
      books: 39,
      chapters: 929,
      units: 191,
      lessons: 766
    });
    expect(OLD_TESTAMENT_CURRICULUM.map((target) => target.bookId)).toEqual(
      journeyBooks.map((book) => book.id)
    );
    for (const target of OLD_TESTAMENT_CURRICULUM) {
      expect(target.targetUnits).toBeGreaterThan(0);
      expect(target.targetLessons).toBeGreaterThanOrEqual(target.targetUnits * 4);
      expect(target.rationale.length).toBeGreaterThan(20);
    }
    expect(OLD_TESTAMENT_CURRICULUM.find((target) => target.bookId === "psalms")?.targetLessons).toBe(60);
    expect(OLD_TESTAMENT_CURRICULUM.find((target) => target.bookId === "obadiah")?.targetLessons).toBe(4);
  });

  it("mantém os três formatos objetivos na jornada", () => {
    const formats = new Set(
      orderedLessons.flatMap((lesson) =>
        lesson.steps.filter((step) => step.type !== "learn").map((step) => step.type)
      )
    );
    expect(formats).toEqual(new Set(["multiple-choice", "fill-choice", "word-blocks"]));
  });
});
