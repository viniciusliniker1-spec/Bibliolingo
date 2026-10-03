import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "./achievements";
import { initialState } from "../state/initialState";

describe("achievements", () => {
  it("avalia condições sem hardcode na interface", () => {
    const earned = evaluateAchievements({
      ...initialState,
      xp: 120,
      completedLessonIds: ["genesis-u01-l01"],
      perfectLessonIds: ["genesis-u01-l01"]
    });
    expect(earned).toEqual(expect.arrayContaining(["first-step", "perfect-lesson", "one-hundred-xp"]));
  });
});
