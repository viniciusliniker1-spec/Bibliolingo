/** Regras de corações: sem corações, a pessoa revisa para recuperar antes de seguir. */

export interface HeartsProgress {
  hearts: number;
  settings: { heartsEnabled: boolean; maxHearts: number };
  attempts: readonly { questionId: string; mode: string; correct: boolean }[];
}

/** Percursos em que errar não custa corações também não são bloqueados. */
export const HEART_FREE_KINDS: ReadonlySet<string> = new Set(["formation"]);

export function isOutOfHearts(progress: HeartsProgress, kind = "bible") {
  return progress.settings.heartsEnabled && progress.hearts <= 0 && !HEART_FREE_KINDS.has(kind);
}

/**
 * Questões para recuperar corações quando não há revisões pendentes:
 * primeiro as que a pessoa errou, depois as mais recentes já respondidas.
 */
export function recoveryQuestionIds(progress: HeartsProgress, dueIds: readonly string[], limit = 8) {
  if (dueIds.length) return dueIds.slice(0, limit);
  const recent = [...progress.attempts].reverse().filter((attempt) => attempt.mode !== "review");
  const wrongFirst = [...recent.filter((attempt) => !attempt.correct), ...recent.filter((attempt) => attempt.correct)];
  return [...new Set(wrongFirst.map((attempt) => attempt.questionId))].slice(0, limit);
}

export function heartsToFull(progress: HeartsProgress) {
  return Math.max(0, progress.settings.maxHearts - progress.hearts);
}
