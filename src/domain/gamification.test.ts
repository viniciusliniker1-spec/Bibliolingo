import { describe, expect, it } from "vitest";
import { calculateLessonXp, getLevelProgress, xpForLevel } from "./gamification";

describe("gamification", () => {
  it("centraliza o cálculo de XP de uma lição perfeita", () => {
    expect(calculateLessonXp(3, true)).toBe(45);
    expect(calculateLessonXp(3, false)).toBe(35);
    expect(calculateLessonXp(8, false, true)).toBe(90);
  });

  it("calcula níveis sem tabela manual", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(80);
    expect(getLevelProgress(79).level).toBe(1);
    expect(getLevelProgress(80).level).toBe(2);
  });
});
