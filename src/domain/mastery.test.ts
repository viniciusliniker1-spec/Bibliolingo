import { describe, expect, it } from "vitest";
import { calculateConceptMastery } from "./mastery";
import type { QuestionAttempt } from "../types/progress";

const attempt = (questionId: string, correct: boolean, day: number, mode: QuestionAttempt["mode"] = "lesson"): QuestionAttempt => ({
  id: questionId + day,
  questionId,
  lessonId: "lesson",
  conceptId: "creation",
  correct,
  difficulty: "medium",
  answeredAt: `2026-10-${String(day).padStart(2, "0")}T12:00:00.000Z`,
  mode
});

describe("calculateConceptMastery", () => {
  it("separa atividade de domínio e valoriza evidência posterior e variada", () => {
    const result = calculateConceptMastery([
      attempt("q1", false, 1),
      attempt("q1", true, 2, "review"),
      attempt("q2", true, 3),
      attempt("q3", true, 4, "checkpoint")
    ], () => undefined)[0];
    expect(result.level).toBe("mastered");
    expect(result.distinctQuestions).toBe(3);
  });

  it("não chama repetição imediata de domínio", () => {
    const result = calculateConceptMastery([
      attempt("q1", true, 1),
      attempt("q1", true, 2),
      attempt("q1", true, 3)
    ], () => undefined)[0];
    expect(result.score).toBeLessThan(80);
  });
});
