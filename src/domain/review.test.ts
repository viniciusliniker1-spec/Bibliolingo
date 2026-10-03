import { describe, expect, it } from "vitest";
import { getReviewQueue, registerReviewResult } from "./review";

describe("spaced review", () => {
  it("agenda erro imediatamente e aumenta reincidência", () => {
    const now = new Date(2026, 9, 3, 12);
    const item = registerReviewResult(undefined, {
      questionId: "q1",
      conceptId: "creation",
      correct: false,
      now
    });
    expect(item.dueDate).toBe("2026-10-03");
    expect(item.lapses).toBe(1);
  });

  it("prioriza item errado", () => {
    const now = new Date(2026, 9, 3, 12);
    const wrong = registerReviewResult(undefined, { questionId: "q1", conceptId: "a", correct: false, now });
    const correct = registerReviewResult(undefined, { questionId: "q2", conceptId: "b", correct: true, now });
    expect(getReviewQueue([correct, wrong], now)[0].questionId).toBe("q1");
  });
});
