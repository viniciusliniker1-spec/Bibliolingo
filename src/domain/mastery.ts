import type { QuestionAttempt } from "../types/progress";

export interface ConceptMastery {
  conceptId: string;
  score: number;
  level: "not-started" | "learning" | "developing" | "mastered";
  distinctQuestions: number;
  lastPracticedAt?: string;
}

const levelFor = (score: number): ConceptMastery["level"] =>
  score >= 80 ? "mastered" : score >= 55 ? "developing" : score > 0 ? "learning" : "not-started";

export function calculateConceptMastery(
  attempts: QuestionAttempt[],
  conceptForQuestion: (questionId: string) => string | undefined
): ConceptMastery[] {
  const grouped = new Map<string, QuestionAttempt[]>();
  for (const attempt of attempts) {
    const conceptId = attempt.conceptId ?? conceptForQuestion(attempt.questionId);
    if (!conceptId) continue;
    grouped.set(conceptId, [...(grouped.get(conceptId) ?? []), attempt]);
  }

  return [...grouped.entries()].map(([conceptId, conceptAttempts]) => {
    const ordered = [...conceptAttempts].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    const recent = ordered.slice(-5);
    const weightedCorrect = recent.reduce((sum, attempt, index) => {
      const recencyWeight = index + 1;
      const evidenceWeight = attempt.mode === "checkpoint" ? 1.35 : attempt.mode === "deepen" ? 1.25 : attempt.mode === "review" ? 1.15 : 1;
      return sum + (attempt.correct ? recencyWeight * evidenceWeight : 0);
    }, 0);
    const possible = recent.reduce((sum, attempt, index) =>
      sum + (index + 1) * (attempt.mode === "checkpoint" ? 1.35 : attempt.mode === "deepen" ? 1.25 : attempt.mode === "review" ? 1.15 : 1), 0);
    const distinctQuestions = new Set(ordered.map((attempt) => attempt.questionId)).size;
    const breadthFactor = Math.min(1, distinctQuestions / 3);
    const score = Math.round((possible ? weightedCorrect / possible : 0) * (0.55 + breadthFactor * 0.45) * 100);
    return {
      conceptId,
      score,
      level: levelFor(score),
      distinctQuestions,
      lastPracticedAt: ordered.at(-1)?.answeredAt
    };
  });
}
