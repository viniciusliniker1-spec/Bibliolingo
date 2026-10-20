import type { Difficulty } from "../types/content";
import type { ReviewItem, ReviewMemoryState } from "../types/progress";
import { toLocalDateKey } from "./streak";

const DAY_MS = 86_400_000;
const TARGET_RETENTION = 0.9;
const MIN_STABILITY_DAYS = 0.25;
const MAX_STABILITY_DAYS = 3650;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function addDays(date: Date, days: number): string {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate() + Math.max(0, Math.ceil(days)));
  return toLocalDateKey(copy);
}

function validDate(value: string | undefined, fallback: Date) {
  const parsed = value ? new Date(value) : fallback;
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

function initialStability(difficulty: Difficulty) {
  return difficulty === "easy" ? 3 : difficulty === "hard" ? 1 : 2;
}

function initialDifficulty(difficulty: Difficulty) {
  return difficulty === "easy" ? 3.5 : difficulty === "hard" ? 7 : 5;
}

/**
 * Curva de esquecimento exponencial (half-life regression).
 * A estabilidade representa o número de dias em que a retenção projetada
 * chega ao alvo pedagógico de 90%.
 */
export function estimateRetention(
  item: Pick<ReviewItem, "stabilityDays" | "lastReviewedAt">,
  at = new Date()
) {
  const stability = Math.max(MIN_STABILITY_DAYS, item.stabilityDays ?? 1);
  const elapsedDays = Math.max(0, (at.getTime() - validDate(item.lastReviewedAt, at).getTime()) / DAY_MS);
  return clamp(Math.exp(Math.log(TARGET_RETENTION) * (elapsedDays / stability)), 0, 1);
}

export function normalizeReviewItem(item: ReviewItem): ReviewItem {
  const legacyStability = [0.25, 1, 3, 7, 14, 30, 60][Math.min(item.intervalIndex ?? 0, 6)] ?? 1;
  const stabilityDays = clamp(item.stabilityDays ?? legacyStability, MIN_STABILITY_DAYS, MAX_STABILITY_DAYS);
  return {
    ...item,
    intervalIndex: Math.max(0, item.intervalIndex ?? 0),
    state: item.state ?? (item.lastResult === "incorrect" ? "relearning" : "review"),
    stabilityDays,
    difficultyScore: clamp(item.difficultyScore ?? 5 + Math.min(3, item.lapses ?? 0) * 0.5, 1, 10),
    retrievability: clamp(item.retrievability ?? (item.lastResult === "correct" ? TARGET_RETENTION : 0), 0, 1),
    repetitions: Math.max(0, item.repetitions ?? (item.lastResult === "correct" ? item.intervalIndex ?? 1 : 0)),
    attempts: Math.max(1, item.attempts ?? 1),
    scheduledDays: Math.max(0, item.scheduledDays ?? stabilityDays)
  };
}

export interface ReviewResultInput {
  questionId: string;
  conceptId: string;
  correct: boolean;
  difficulty?: Difficulty;
  mode?: "lesson" | "checkpoint" | "review" | "formation" | "deepen" | "greek";
  now?: Date;
}

/**
 * Atualiza a memória por conceito usando uma curva de esquecimento
 * determinística. A escolha por HLR, em vez de FSRS completo, é deliberada:
 * o histórico publicado pelo Bibliolingo é binário (acerto/erro), enquanto
 * FSRS precisa de avaliações Again/Hard/Good/Easy e parâmetros calibrados.
 * HLR mantém estabilidade, dificuldade e retenção explícitas sem inventar
 * avaliações ausentes e pode ser recalculado offline em Web e Mobile.
 */
export function registerReviewResult(
  current: ReviewItem | undefined,
  input: ReviewResultInput
): ReviewItem {
  const now = input.now ?? new Date();
  const difficulty = input.difficulty ?? "medium";
  const previous = current ? normalizeReviewItem(current) : undefined;
  const priorRetention = previous ? estimateRetention(previous, now) : 0;
  const previousStability = previous?.stabilityDays ?? initialStability(difficulty);
  const previousDifficulty = previous?.difficultyScore ?? initialDifficulty(difficulty);
  const isRetentionEvidence = input.mode === "review" || input.mode === "checkpoint";
  let stabilityDays: number;
  let difficultyScore: number;
  let state: ReviewMemoryState;

  if (input.correct) {
    if (!previous) {
      stabilityDays = initialStability(difficulty);
      state = "learning";
    } else {
      const evidenceWeight = isRetentionEvidence ? 1.7 : 0.75;
      const desirableDifficulty = (11 - previousDifficulty) / 10;
      const spacingGain = Math.max(0.05, (1 - priorRetention) * evidenceWeight * desirableDifficulty);
      stabilityDays = previousStability * (1 + spacingGain);
      state = "review";
    }
    difficultyScore = previousDifficulty - (isRetentionEvidence ? 0.25 : 0.1);
  } else {
    stabilityDays = previous ? previousStability * 0.35 : MIN_STABILITY_DAYS;
    difficultyScore = previousDifficulty + (isRetentionEvidence ? 1 : 0.7);
    state = "relearning";
  }

  stabilityDays = clamp(stabilityDays, MIN_STABILITY_DAYS, MAX_STABILITY_DAYS);
  difficultyScore = clamp(difficultyScore, 1, 10);
  const scheduledDays = input.correct ? Math.max(1, Math.ceil(stabilityDays)) : 0;

  return {
    questionId: input.questionId,
    conceptId: input.conceptId,
    dueDate: addDays(now, scheduledDays),
    intervalIndex: Math.max(0, Math.round(Math.log2(Math.max(1, scheduledDays)))),
    lapses: (previous?.lapses ?? 0) + (input.correct ? 0 : 1),
    lastResult: input.correct ? "correct" : "incorrect",
    lastReviewedAt: now.toISOString(),
    state,
    stabilityDays,
    difficultyScore,
    retrievability: input.correct ? 1 : 0,
    repetitions: (previous?.repetitions ?? 0) + (input.correct ? 1 : 0),
    attempts: (previous?.attempts ?? 0) + 1,
    scheduledDays
  };
}

export function reviewPriority(item: ReviewItem, today = new Date()): number {
  const normalized = normalizeReviewItem(item);
  const due = new Date(normalized.dueDate + "T00:00:00");
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const overdueDays = Math.floor((localToday.getTime() - due.getTime()) / DAY_MS);
  const retentionRisk = Math.round((1 - estimateRetention(normalized, today)) * 100);
  return Math.max(0, overdueDays) * 20
    + normalized.lapses * 12
    + retentionRisk
    + Math.round((normalized.difficultyScore ?? 5) * 2);
}

/** Uma entrada por conceito; itens futuros permanecem salvos, mas não entram na fila de hoje. */
export function getReviewQueue(items: ReviewItem[], today = new Date()): ReviewItem[] {
  const key = toLocalDateKey(today);
  const byConcept = new Map<string, ReviewItem>();
  items.map(normalizeReviewItem).filter((item) => item.dueDate <= key).forEach((item) => {
    const current = byConcept.get(item.conceptId);
    if (!current || reviewPriority(item, today) > reviewPriority(current, today)
      || item.lastReviewedAt > current.lastReviewedAt) {
      byConcept.set(item.conceptId, item);
    }
  });
  return [...byConcept.values()].sort((a, b) => reviewPriority(b, today) - reviewPriority(a, today));
}

export interface ReviewQueueSummary {
  total: number;
  availableToday: number;
  recentErrors: number;
  overdue: number;
  weakConcepts: number;
  concepts: number;
  estimatedMinutes: number;
}

export function summarizeReviewQueue(items: ReviewItem[], today = new Date()): ReviewQueueSummary {
  const queue = getReviewQueue(items, today);
  const key = toLocalDateKey(today);
  const weakConcepts = queue.filter((item) =>
    (normalizeReviewItem(item).difficultyScore ?? 5) >= 7 || item.lapses >= 2
  ).length;
  return {
    total: queue.length,
    availableToday: queue.length,
    recentErrors: queue.filter((item) => item.lastResult === "incorrect").length,
    overdue: queue.filter((item) => item.dueDate < key).length,
    weakConcepts,
    concepts: new Set(queue.map((item) => item.conceptId)).size,
    estimatedMinutes: queue.length ? Math.max(1, Math.ceil(queue.length * 0.6)) : 0
  };
}

export function reviewReason(item: ReviewItem, today = new Date()): string {
  const normalized = normalizeReviewItem(item);
  const key = toLocalDateKey(today);
  if (normalized.dueDate < key) return "Esta revisão está atrasada e foi priorizada para proteger a retenção.";
  if (normalized.lastResult === "incorrect") {
    return normalized.lapses > 1
      ? "Este conceito precisa de reforço após " + normalized.lapses + " dificuldades registradas."
      : "Este conceito voltou porque houve uma dificuldade recente.";
  }
  return "A retenção estimada chegou ao ponto programado para uma nova prática.";
}

export interface ReviewAnswerHistory {
  questionId: string;
  correct: boolean;
  answeredAt: string;
  difficulty?: Difficulty;
  mode?: ReviewResultInput["mode"];
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
      byConcept.set(conceptId, registerReviewResult(byConcept.get(conceptId), {
        questionId: answer.questionId,
        conceptId,
        correct: answer.correct,
        difficulty: answer.difficulty,
        mode: answer.mode,
        now: new Date(answer.answeredAt)
      }));
    });
  return [...byConcept.values()];
}

export function mergeReviewItems(local: ReviewItem[], remote: ReviewItem[]) {
  const merged = new Map<string, ReviewItem>();
  [...local, ...remote].map(normalizeReviewItem).forEach((item) => {
    const current = merged.get(item.conceptId);
    if (!current || item.lastReviewedAt > current.lastReviewedAt
      || (item.lastReviewedAt === current.lastReviewedAt && (item.attempts ?? 0) > (current.attempts ?? 0))) {
      merged.set(item.conceptId, item);
    }
  });
  return [...merged.values()];
}
