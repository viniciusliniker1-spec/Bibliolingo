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
  const interval = GAMIFICATION.reviewIntervalsDays[intervalIndex];

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
  return (
    Math.max(0, overdueDays) * 20 +
    item.lapses * 12 +
    (item.lastResult === "incorrect" ? 30 : 0) -
    item.intervalIndex * 2
  );
}

export function getReviewQueue(items: ReviewItem[], today = new Date()): ReviewItem[] {
  const key = toLocalDateKey(today);
  return items
    .filter((item) => item.dueDate <= key || item.lastResult === "incorrect")
    .sort((a, b) => reviewPriority(b, today) - reviewPriority(a, today));
}

export interface ReviewQueueSummary {
  total: number;
  recentErrors: number;
  overdue: number;
  concepts: number;
  estimatedMinutes: number;
}

export function summarizeReviewQueue(
  items: ReviewItem[],
  today = new Date()
): ReviewQueueSummary {
  const key = toLocalDateKey(today);
  return {
    total: items.length,
    recentErrors: items.filter((item) => item.lastResult === "incorrect").length,
    overdue: items.filter((item) => item.dueDate < key).length,
    concepts: new Set(items.map((item) => item.conceptId)).size,
    estimatedMinutes: items.length ? Math.max(1, Math.ceil(items.length * 0.6)) : 0
  };
}

export function reviewReason(item: ReviewItem, today = new Date()): string {
  const key = toLocalDateKey(today);
  if (item.lastResult === "incorrect") {
    return item.lapses > 1
      ? "Este conceito voltou porque já causou " + item.lapses + " erros."
      : "Este item apareceu porque foi respondido incorretamente recentemente.";
  }
  if (item.dueDate < key) {
    return "Esta revisão venceu e recebeu prioridade para evitar esquecimento.";
  }
  return "Este é o momento programado para reforçar a memória.";
}
