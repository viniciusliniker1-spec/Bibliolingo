import { describe, expect, it } from "vitest";
import {
  exodusUnits,
  genesisUnits,
  journeyBooks,
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

  it("preserva Gênesis 1–50 e acrescenta Êxodo 1–40", () => {
    const genesisChapters = new Set(genesisUnits.flatMap((unit) => unit.chapters));
    const exodusChapters = new Set(exodusUnits.flatMap((unit) => unit.chapters));
    expect(genesisUnits).toHaveLength(10);
    expect(exodusUnits).toHaveLength(8);
    expect(orderedLessons).toHaveLength(74);
    expect([...genesisChapters].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1)
    );
    expect([...exodusChapters].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 1)
    );
    expect(orderedActivityIds).toHaveLength(92);
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
