import { describe, expect, it } from "vitest";
import {
  deepenActivityIds,
  deepenActivityUnlocked,
  deepenGenesisUnit,
  nextDeepenActivity
} from "./catalog";

describe("jornada Aprofundar", () => {
  it("usa IDs estáveis e questões objetivas de maior dificuldade", () => {
    const exercises = [
      ...deepenGenesisUnit.lessons.flatMap((lesson) => lesson.exercises),
      ...deepenGenesisUnit.checkpoint.exercises
    ];
    expect(new Set(deepenActivityIds).size).toBe(deepenActivityIds.length);
    expect(exercises.every((exercise) => exercise.difficulty !== "easy")).toBe(true);
    expect(exercises.every((exercise) => Boolean(exercise.explanation && exercise.reference))).toBe(true);
  });

  it("cada lição ensina antes de testar", () => {
    expect(deepenGenesisUnit.lessons.every((lesson) => lesson.blocks.length >= 2)).toBe(true);
    expect(deepenGenesisUnit.lessons.every((lesson) => lesson.exercises.length >= 3)).toBe(true);
  });

  it("desbloqueia sequencialmente", () => {
    const [first, second] = deepenActivityIds;
    expect(deepenActivityUnlocked(first, [], [])).toBe(true);
    expect(deepenActivityUnlocked(second, [], [])).toBe(false);
    expect(deepenActivityUnlocked(second, [first], [])).toBe(true);
  });

  it("retoma a primeira atividade incompleta", () => {
    expect(nextDeepenActivity([], [])).toBe(deepenActivityIds[0]);
    expect(nextDeepenActivity([deepenActivityIds[0]], [])).toBe(deepenActivityIds[1]);
  });
});
