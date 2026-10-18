import { describe, expect, it } from "vitest";
import {
  buildReviewItemsFromHistory,
  estimateRetention,
  getReviewQueue,
  mergeReviewItems,
  registerReviewResult,
  reviewReason,
  summarizeReviewQueue
} from "./review";

describe("revisão adaptativa por conceito", () => {
  const now = new Date(2026, 9, 3, 12);

  it("agenda dificuldade imediatamente e mantém estado de reaprendizagem", () => {
    const item = registerReviewResult(undefined, {
      questionId: "q1", conceptId: "creation", correct: false, difficulty: "hard", mode: "lesson", now
    });
    expect(item.dueDate).toBe("2026-10-03");
    expect(item.lapses).toBe(1);
    expect(item.state).toBe("relearning");
    expect(getReviewQueue([item], now)).toHaveLength(1);
  });

  it("agenda também o acerto inicial, sem colocá-lo na fila antes do vencimento", () => {
    const item = registerReviewResult(undefined, {
      questionId: "q2", conceptId: "faith", correct: true, difficulty: "medium", mode: "lesson", now
    });
    expect(item.dueDate).toBe("2026-10-05");
    expect(item.stabilityDays).toBe(2);
    expect(getReviewQueue([item], now)).toEqual([]);
    expect(getReviewQueue([item], new Date(2026, 9, 5, 12))).toHaveLength(1);
  });

  it("deduplica questões equivalentes pelo conceito estável", () => {
    const first = registerReviewResult(undefined, {
      questionId: "q1", conceptId: "romans-authorship", correct: false, now
    });
    const second = registerReviewResult(first, {
      questionId: "q2", conceptId: "romans-authorship", correct: false, now: new Date(2026, 9, 4, 12)
    });
    expect(getReviewQueue([first, second], new Date(2026, 9, 4, 12))).toHaveLength(1);
    expect(second.questionId).toBe("q2");
  });

  it("aumenta estabilidade com evidência posterior e evita inflação imediata", () => {
    const initial = registerReviewResult(undefined, {
      questionId: "q1", conceptId: "grace", correct: true, mode: "lesson", now
    });
    const immediate = registerReviewResult(initial, {
      questionId: "q1", conceptId: "grace", correct: true, mode: "lesson", now
    });
    const spaced = registerReviewResult(immediate, {
      questionId: "q2", conceptId: "grace", correct: true, mode: "review", now: new Date(2026, 9, 8, 12)
    });
    expect(immediate.stabilityDays!).toBeLessThan(initial.stabilityDays! * 1.1);
    expect(spaced.stabilityDays!).toBeGreaterThan(immediate.stabilityDays!);
    expect(estimateRetention(immediate, new Date(2026, 9, 8, 12))).toBeLessThan(1);
  });

  it("reconstrói histórico e mescla pelo conceito mais recente", () => {
    const rebuilt = buildReviewItemsFromHistory([
      { questionId: "q1", correct: false, answeredAt: "2026-10-01T12:00:00.000Z" },
      { questionId: "q2", correct: true, answeredAt: "2026-10-04T12:00:00.000Z", mode: "review" }
    ], () => "c1");
    expect(rebuilt).toHaveLength(1);
    expect(rebuilt[0].questionId).toBe("q2");
    expect(rebuilt[0].lastResult).toBe("correct");

    const older = registerReviewResult(undefined, {
      questionId: "old", conceptId: "c1", correct: false, now: new Date(2026, 8, 1)
    });
    expect(mergeReviewItems([older], rebuilt)[0].questionId).toBe("q2");
  });

  it("resume vencidas, disponíveis e conceitos frágeis", () => {
    const weak = registerReviewResult(undefined, {
      questionId: "q1", conceptId: "c1", correct: false, difficulty: "hard", now: new Date(2026, 9, 1)
    });
    const summary = summarizeReviewQueue([weak], now);
    expect(summary.availableToday).toBe(1);
    expect(summary.overdue).toBe(1);
    expect(summary.weakConcepts).toBe(1);
    expect(reviewReason(weak, now)).toContain("atrasada");
  });
});
