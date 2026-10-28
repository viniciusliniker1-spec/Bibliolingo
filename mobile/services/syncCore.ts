import type { SyncConnectionState, SyncEvent } from "../../src/sync/types";

const REWARDABLE_EVENT_TYPES = new Set<SyncEvent["eventType"]>([
  "lesson.completed",
  "checkpoint.completed",
  "achievement.unlocked"
]);

export function isRewardableSyncEvent(eventType: SyncEvent["eventType"]) {
  return REWARDABLE_EVENT_TYPES.has(eventType);
}

export function classifySyncFailure(error: unknown): SyncConnectionState {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return error instanceof TypeError
    || /network request failed|failed to fetch|networkerror|internet|connection aborted/i.test(message)
    ? "offline"
    : "error";
}

export function syncFailureMessage(error: unknown) {
  if (classifySyncFailure(error) === "offline") {
    return "Sem conexão. O progresso permanece salvo neste aparelho e será sincronizado automaticamente.";
  }
  return error instanceof Error && error.message
    ? error.message
    : "O servidor recusou a sincronização. Seus dados locais foram preservados.";
}
