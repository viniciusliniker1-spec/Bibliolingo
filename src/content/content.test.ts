import { describe, expect, it } from "vitest";
import { genesisUnits, orderedActivityIds, orderedLessons } from "./catalog";

describe("integridade do conteúdo de Gênesis", () => {
  it("mantém IDs únicos e metadados pedagógicos", () => {
    const ids = new Set<string>();
    for (const unit of genesisUnits) {
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
            expect(step.reference.label).toContain("Gênesis");
          }
        }
      }
      expect(unit.checkpoint.exercises.length).toBeGreaterThanOrEqual(4);
      for (const exercise of unit.checkpoint.exercises) {
        expect(ids.has(exercise.id)).toBe(false);
        ids.add(exercise.id);
      }
    }
  });

  it("cobre Gênesis 1–50 em dez unidades sem quebrar o piloto", () => {
    const chapters = new Set(genesisUnits.flatMap((unit) => unit.chapters));
    expect(genesisUnits).toHaveLength(10);
    expect(orderedLessons).toHaveLength(42);
    expect(genesisUnits[0].lessons).toHaveLength(6);
    expect(genesisUnits[0].checkpoint.exercises).toHaveLength(8);
    expect([...chapters].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1)
    );
    expect(orderedActivityIds).toHaveLength(52);
  });
});
