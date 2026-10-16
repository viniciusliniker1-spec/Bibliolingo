import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { smartChallenges, weeklyGoalProgress } from "./weeklyGoals";

describe("weekly goals", () => {
  it("soma somente a semana atual e usa cinco metas diárias", () => {
    const now = new Date(2026, 9, 16, 12);
    const result = weeklyGoalProgress({
      "2026-10-12": { date: "2026-10-12", xp: 100, seconds: 60, lessons: 1 },
      "2026-10-14": { date: "2026-10-14", xp: 50, seconds: 60, lessons: 1 },
      "2026-10-01": { date: "2026-10-01", xp: 999, seconds: 60, lessons: 1 }
    }, 50, now);
    expect(result).toMatchObject({ xp: 150, goal: 250, activeDays: 2, percent: 60 });
  });

  it("deriva desafios sem conceder XP paralelo", () => {
    const challenges = smartChallenges({ ...initialState, streak: 3 });
    expect(challenges.find((item) => item.id === "three-day-streak")?.completed).toBe(true);
    expect(initialState.xp).toBe(0);
  });
});
