import { GAMIFICATION } from "../config/gamification";
import type { ReviewItem } from "../types/progress";
import { toLocalDateKey } from "./streak";

function addDays(date: Date, days: number): string {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return toLocalDateKey(copy);
}

export function registerReviewResult(
  current: ReviewItem | undefined,
  input: { questionId: string; conceptId: string; correct: boolean; now?: Date }
): ReviewItem {
  const now = input.now ?? new Date();
  const intervalIndex = input.correct
    ? Math.min((current?.intervalIndex ?? 0) + 1, GAMIFICATION.reviewIntervalsDays.length - 1)
    : 0;
  const interval = input.correct ? GAMIFICATION.reviewIntervalsDays[intervalIndex] : 0;
  return {
    questionId: input.questionId,
    conceptId: input.conceptId,
    dueDate: addDays(now, interval),
    intervalIndex,
    lapses: (current?.lapses ?? 0) + (input.correct ? 0 : 1),
    lastResult: input.correct ? "correct" : "incorrect",
    lastReviewedAt: now.toISOString()
  };
}

export function reviewPriority(item: ReviewItem, today = new Date()): number {
  const due = new Date(item.dueDate + "T00:00:00");
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const overdueDays = Math.floor((localToday.getTime() - due.getTime()) / 86_400_000);
  return Math.max(0, overdueDays) * 20 + item.lapses * 12 + 30;
}

/**
 * A fila é exclusivamente de erros ainda não recuperados.
 * Um conceito aparece uma única vez, mesmo que tenha sido errado em mais de uma questão.
 */
export function getReviewQueue(items: ReviewItem[], today = new Date()): ReviewItem[] {
  const byConcept = new Map<string, ReviewItem>();
  items.filter((item) => item.lastResult === "incorrect").forEach((item) => {
    const current = byConcept.get(item.conceptId);
    if (!current || reviewPriority(item, today) > reviewPriority(current, today)
      || item.lastReviewedAt > current.lastReviewedAt) {
      byConcept.set(item.conceptId, item);
    }
  });
  return [...byConcept.values()]
    .sort((a, b) => reviewPriority(b, today) - reviewPriority(a, today));
}

export interface ReviewQueueSummary {
  total: number;
  recentErrors: number;
  overdue: number;
  concepts: number;
  estimatedMinutes: number;
}

export function summarizeReviewQueue(items: ReviewItem[], today = new Date()): ReviewQueueSummary {
  const queue = getReviewQueue(items, today);
  const key = toLocalDateKey(today);
  return {
    total: queue.length,
    recentErrors: queue.length,
    overdue: queue.filter((item) => item.dueDate < key).length,
    concepts: queue.length,
    estimatedMinutes: queue.length ? Math.max(1, Math.ceil(queue.length * 0.6)) : 0
  };
}

export function reviewReason(item: ReviewItem): string {
  return item.lapses > 1
    ? "Este conceito voltou porque já causou " + item.lapses + " erros."
    : "Este conceito apareceu porque foi respondido incorretamente.";
}

export interface ReviewAnswerHistory {
  questionId: string;
  correct: boolean;
  answeredAt: string;
}

export function buildReviewItemsFromHistory(
  history: ReviewAnswerHistory[],
  conceptForQuestion: (questionId: string) => string | undefined
): ReviewItem[] {
  const byConcept = new Map<string, ReviewItem>();
  [...history]
    .filter((answer) => Number.isFinite(new Date(answer.answeredAt).getTime()))
    .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt))
    .forEach((answer) => {
      const conceptId = conceptForQuestion(answer.questionId);
      if (!conceptId) return;
      const current = byConcept.get(conceptId);
      if (answer.correct) {
        if (current?.questionId === answer.questionId) byConcept.delete(conceptId);
        return;
      }
      byConcept.set(conceptId, registerReviewResult(current, {
        questionId: answer.questionId,
        conceptId,
        correct: false,
        now: new Date(answer.answeredAt)
      }));
    });
  return [...byConcept.values()];
}

export function mergeReviewItems(local: ReviewItem[], remote: ReviewItem[]) {
  const merged = new Map<string, ReviewItem>();
  [...local, ...remote]
    .filter((item) => item.lastResult === "incorrect")
    .forEach((item) => {
      const current = merged.get(item.conceptId);
      if (!current || item.lastReviewedAt > current.lastReviewedAt) merged.set(item.conceptId, item);
    });
  return [...merged.values()];
}
