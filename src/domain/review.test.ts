import { describe, expect, it } from "vitest";
import {
  getReviewQueue,
  registerReviewResult,
  reviewReason,
  buildReviewItemsFromHistory,
  mergeReviewItems,
  summarizeReviewQueue
} from "./review";

describe("review only after errors", () => {
  const now = new Date(2026, 9, 3, 12);

  it("places an error in the queue immediately", () => {
    const item = registerReviewResult(undefined, { questionId: "q1", conceptId: "creation", correct: false, now });
    expect(item.dueDate).toBe("2026-10-03");
    expect(item.lapses).toBe(1);
    expect(getReviewQueue([item], now)).toHaveLength(1);
  });

  it("never queues concepts answered correctly", () => {
    const correct = registerReviewResult(undefined, { questionId: "q2", conceptId: "faith", correct: true, now });
    expect(getReviewQueue([correct], now)).toEqual([]);
  });

  it("keeps only one question per mistaken concept", () => {
    const first = registerReviewResult(undefined, { questionId: "q1", conceptId: "faith", correct: false, now });
    const second = registerReviewResult(first, { questionId: "q2", conceptId: "faith", correct: false, now: new Date(2026, 9, 4, 12) });
    expect(getReviewQueue([first, second], now)).toEqual([second]);
  });

  it("removes a recovered question reconstructed from synchronized history", () => {
    const rebuilt = buildReviewItemsFromHistory([
      { questionId: "q1", correct: false, answeredAt: "2026-10-10T10:00:00.000Z" },
      { questionId: "q1", correct: true, answeredAt: "2026-10-11T10:00:00.000Z" },
      { questionId: "q2", correct: true, answeredAt: "2026-10-11T10:00:00.000Z" }
    ], (id) => id === "q1" ? "faith" : undefined);
    expect(rebuilt).toEqual([]);
  });

  it("summarizes only unresolved errors", () => {
    const wrong = registerReviewResult(undefined, { questionId: "q1", conceptId: "creation", correct: false, now });
    const correct = registerReviewResult(undefined, { questionId: "q2", conceptId: "faith", correct: true, now });
    expect(summarizeReviewQueue([wrong, correct], now)).toEqual({
      total: 1, recentErrors: 1, overdue: 0, concepts: 1, estimatedMinutes: 1
    });
    expect(reviewReason(wrong)).toContain("incorretamente");
    expect(mergeReviewItems([wrong], [wrong])).toHaveLength(1);
  });
});
