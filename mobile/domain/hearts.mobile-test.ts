import { describe, expect, it } from "vitest";
import { heartsToFull, isOutOfHearts, recoveryQuestionIds, type HeartsProgress } from "./hearts";

const base = (hearts: number, enabled = true, attempts: HeartsProgress["attempts"] = []): HeartsProgress => ({ hearts, settings: { heartsEnabled: enabled, maxHearts: 5 }, attempts });

describe("corações", () => {
  it("bloqueia só quando acabam, com corações ligados e fora da Formação", () => {
    expect(isOutOfHearts(base(0))).toBe(true);
    expect(isOutOfHearts(base(1))).toBe(false);
    expect(isOutOfHearts(base(0, false))).toBe(false);
    expect(isOutOfHearts(base(0), "formation")).toBe(false);
    expect(isOutOfHearts(base(0), "greek")).toBe(true);
  });

  it("usa as revisões pendentes quando existem", () => {
    expect(recoveryQuestionIds(base(0), ["a", "b"])).toEqual(["a", "b"]);
  });

  it("sem revisões pendentes, monta prática com erros primeiro e sem repetir", () => {
    const attempts = [
      { questionId: "q1", mode: "lesson", correct: true },
      { questionId: "q2", mode: "lesson", correct: false },
      { questionId: "q3", mode: "lesson", correct: true },
      { questionId: "q2", mode: "lesson", correct: false },
      { questionId: "r1", mode: "review", correct: true }
    ];
    expect(recoveryQuestionIds(base(0, true, attempts), [])).toEqual(["q2", "q3", "q1"]);
  });

  it("calcula quantos faltam para encher", () => {
    expect(heartsToFull(base(2))).toBe(3);
    expect(heartsToFull(base(5))).toBe(0);
  });
});
