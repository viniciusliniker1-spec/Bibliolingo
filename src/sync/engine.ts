import type {
  CommonProgressProjection,
  MergeSummary,
  RemoteProgressProjection,
  SyncEvent,
  SyncEventType,
  SyncPlatform
} from "./types";

const unique = (values: readonly string[]) => [...new Set(values)];

function eventId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function createSyncEvent<TPayload extends Record<string, unknown>>(input: {
  deviceId: string;
  platform: SyncPlatform;
  eventType: SyncEventType;
  payload: TPayload;
  now?: Date;
  localDate?: string;
  timezone?: string;
}): SyncEvent<TPayload> {
  const now = input.now ?? new Date();
  return {
    eventId: eventId(),
    deviceId: input.deviceId,
    platform: input.platform,
    eventType: input.eventType,
    payload: input.payload,
    createdAt: now.toISOString(),
    localDate: input.localDate,
    timezone: input.timezone,
    attempts: 0
  };
}

export function enqueueSyncEvent(queue: SyncEvent[], event: SyncEvent) {
  return queue.some((item) => item.eventId === event.eventId)
    ? queue
    : [...queue, event];
}

export function acknowledgeSyncEvents(queue: SyncEvent[], acceptedIds: readonly string[]) {
  if (!acceptedIds.length) return queue;
  const accepted = new Set(acceptedIds);
  return queue.filter((event) => !accepted.has(event.eventId));
}

export function markSyncAttempt(queue: SyncEvent[], eventIdToMark: string) {
  return queue.map((event) => event.eventId === eventIdToMark
    ? { ...event, attempts: event.attempts + 1 }
    : event);
}

function symmetricCounts(local: readonly string[], remote: readonly string[]) {
  const localSet = new Set(local);
  const remoteSet = new Set(remote);
  return {
    localOnly: [...localSet].filter((id) => !remoteSet.has(id)).length,
    remoteOnly: [...remoteSet].filter((id) => !localSet.has(id)).length
  };
}

export function mergeProgressProjection(
  local: CommonProgressProjection,
  remote: RemoteProgressProjection
): MergeSummary {
  const lessons = symmetricCounts(local.completedLessonIds, remote.completedLessonIds);
  const checkpoints = symmetricCounts(local.completedCheckpointIds, remote.completedCheckpointIds);
  const achievements = symmetricCounts(local.earnedAchievementIds, remote.earnedAchievementIds);

  const merged: CommonProgressProjection = {
    ...local,
    // O servidor deriva XP de eventos confirmados. Enquanto houver eventos
    // locais pendentes, nunca reduza o valor exibido no dispositivo.
    xp: Math.max(local.xp, remote.totalXp),
    streak: Math.max(local.streak, remote.currentStreak),
    bestStreak: Math.max(local.bestStreak, remote.longestStreak),
    lastStudyDate: [local.lastStudyDate, remote.lastStudyDate]
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1),
    completedLessonIds: unique([...local.completedLessonIds, ...remote.completedLessonIds]),
    completedCheckpointIds: unique([
      ...local.completedCheckpointIds,
      ...remote.completedCheckpointIds
    ]),
    perfectLessonIds: unique(local.perfectLessonIds),
    earnedAchievementIds: unique([
      ...local.earnedAchievementIds,
      ...remote.earnedAchievementIds
    ]),
    incorrectQuestionIds: unique(local.incorrectQuestionIds)
  };

  const localOnlyCount = lessons.localOnly + checkpoints.localOnly + achievements.localOnly;
  const remoteOnlyCount = lessons.remoteOnly + checkpoints.remoteOnly + achievements.remoteOnly;
  return {
    merged,
    changed:
      merged.xp !== local.xp
      || merged.streak !== local.streak
      || merged.bestStreak !== local.bestStreak
      || localOnlyCount > 0
      || remoteOnlyCount > 0,
    localOnlyCount,
    remoteOnlyCount
  };
}

export function hasMeaningfulLocalProgress(progress: CommonProgressProjection) {
  return progress.xp > 0
    || progress.completedLessonIds.length > 0
    || progress.completedCheckpointIds.length > 0
    || progress.earnedAchievementIds.length > 0;
}


export function progressFingerprint(progress: CommonProgressProjection) {
  const canonical = JSON.stringify({
    xp: progress.xp,
    completedLessonIds: [...progress.completedLessonIds].sort(),
    completedCheckpointIds: [...progress.completedCheckpointIds].sort(),
    earnedAchievementIds: [...progress.earnedAchievementIds].sort()
  });
  const seeds = [2166136261, 2246822519, 3266489917, 668265263];
  return seeds.map((seed) => {
    let hash = seed >>> 0;
    for (let index = 0; index < canonical.length; index += 1) {
      hash ^= canonical.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
      hash ^= hash >>> 13;
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }).join("");
}
