import { describe, expect, it } from "vitest";
import {
  deuteronomyUnits,
  exodusUnits,
  genesisUnits,
  journeyBooks,
  leviticusUnits,
  numbersUnits,
  orderedActivityIds,
  orderedLessons
} from "./catalog";

describe("integridade do conteúdo da jornada", () => {
  it("mantém IDs únicos e ensino imediatamente antes de cada exercício", () => {
    const ids = new Set<string>();
    for (const book of journeyBooks) {
      for (const unit of book.units) {
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
        }
      }
    }
  });

  it("cobre integralmente os cinco livros do Pentateuco", () => {
    const expected = [
      [genesisUnits, 50, 10],
      [exodusUnits, 40, 8],
      [leviticusUnits, 27, 5],
      [numbersUnits, 36, 6],
      [deuteronomyUnits, 34, 6]
    ] as const;
    expect(journeyBooks).toHaveLength(5);
    for (const [units, chapterCount, unitCount] of expected) {
      const chapters = new Set(units.flatMap((unit) => unit.chapters));
      expect(units).toHaveLength(unitCount);
      expect([...chapters].sort((a, b) => a - b)).toEqual(
        Array.from({ length: chapterCount }, (_, index) => index + 1)
      );
    }
    expect(orderedLessons).toHaveLength(142);
    expect(orderedActivityIds).toHaveLength(177);
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
