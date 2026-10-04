import { describe, expect, it } from "vitest";
import {
  getReviewQueue,
  registerReviewResult,
  reviewReason,
  summarizeReviewQueue
} from "./review";

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

  it("resume a fila e explica por que um item apareceu", () => {
    const now = new Date(2026, 9, 3, 12);
    const wrong = registerReviewResult(undefined, {
      questionId: "q1",
      conceptId: "creation",
      correct: false,
      now
    });
    const summary = summarizeReviewQueue([wrong], now);
    expect(summary).toEqual({
      total: 1,
      recentErrors: 1,
      overdue: 0,
      concepts: 1,
      estimatedMinutes: 1
    });
    expect(reviewReason(wrong, now)).toContain("incorretamente");
  });
});
