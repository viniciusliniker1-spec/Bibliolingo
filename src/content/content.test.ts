import { describe, expect, it } from "vitest";
import { pilotUnit } from "./catalog";

describe("integridade do conteúdo piloto", () => {
  it("mantém IDs únicos e metadados pedagógicos", () => {
    const ids = new Set<string>();
    for (const lesson of pilotUnit.lessons) {
      expect(ids.has(lesson.id)).toBe(false);
      ids.add(lesson.id);
      for (const step of lesson.steps) {
        expect(ids.has(step.id)).toBe(false);
        ids.add(step.id);
        if (step.type !== "learn") {
          expect(step.objective.length).toBeGreaterThan(10);
          expect(step.explanation.length).toBeGreaterThan(10);
          expect(step.reference.label).toContain("Gênesis");
        }
      }
    }
    expect(pilotUnit.lessons).toHaveLength(6);
    expect(pilotUnit.checkpoint.exercises).toHaveLength(8);
  });
});
