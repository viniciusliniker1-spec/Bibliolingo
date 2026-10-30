import type {
  CommonProgressProjection,
  MergeSummary,
  RemoteProgressProjection,
  SyncEvent,
  SyncEventType,
  SyncPlatform
} from "./types";

const unique = (values: readonly string[]) => [...new Set(values)];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function bytesToUuid(bytes: Uint8Array) {
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-");
}

function eventId() {
  const nativeId = globalThis.crypto?.randomUUID?.();
  if (nativeId) return nativeId;

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

/**
 * Converts legacy pre-UUID identifiers into a stable UUID-shaped value.
 * Stability preserves backend idempotency when an offline event is retried.
 */
export function normalizeSyncUuid(value: string) {
  if (UUID_PATTERN.test(value)) return value.toLowerCase();

  const bytes = new Uint8Array(16);
  const seeds = [2166136261, 2246822519, 3266489917, 668265263];
  seeds.forEach((seed, block) => {
    let hash = seed >>> 0;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
      hash ^= hash >>> 13;
    }
    bytes[block * 4] = (hash >>> 24) & 0xff;
    bytes[block * 4 + 1] = (hash >>> 16) & 0xff;
    bytes[block * 4 + 2] = (hash >>> 8) & 0xff;
    bytes[block * 4 + 3] = hash & 0xff;
  });
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
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
