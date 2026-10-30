import { describe, expect, it } from "vitest";
import {
  acknowledgeSyncEvents,
  createSyncEvent,
  enqueueSyncEvent,
  mergeProgressProjection,
  normalizeSyncUuid,
  progressFingerprint
} from "./engine";
import type { CommonProgressProjection } from "./types";

const local: CommonProgressProjection = {
  xp: 100,
  streak: 2,
  bestStreak: 3,
  lastStudyDate: "2026-10-15",
  completedLessonIds: ["genesis-u01-l01"],
  completedCheckpointIds: [],
  perfectLessonIds: ["genesis-u01-l01"],
  earnedAchievementIds: ["first-lesson"],
  incorrectQuestionIds: ["genesis-u01-l01-q02"]
};

describe("identificadores de sincronização", () => {
  it("gera UUID válido mesmo quando randomUUID não está disponível", () => {
    const event = createSyncEvent({
      deviceId: "11111111-1111-4111-8111-111111111111",
      platform: "android",
      eventType: "lesson.completed",
      payload: { activity_id: "genesis-u01-l01" }
    });
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("converte IDs antigos de forma estável para preservar idempotência", () => {
    const legacy = "mvv6r1vx-4c62v3xv7mf-f556ysfjta9";
    const first = normalizeSyncUuid(legacy);
    expect(first).toBe(normalizeSyncUuid(legacy));
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("preserva UUIDs já válidos", () => {
    const valid = "11111111-1111-4111-8111-111111111111";
    expect(normalizeSyncUuid(valid)).toBe(valid);
  });
});

describe("fila de sincronização", () => {
  it("não duplica um evento com o mesmo ID", () => {
    const event = createSyncEvent({
      deviceId: "11111111-1111-4111-8111-111111111111",
      platform: "android",
      eventType: "lesson.completed",
      payload: { activity_id: "genesis-u01-l01", total: 4, correct: 4 },
      now: new Date("2026-10-16T12:00:00Z")
    });

    const once = enqueueSyncEvent([], event);
    const twice = enqueueSyncEvent(once, event);
    expect(twice).toHaveLength(1);
    expect(twice[0].eventId).toBe(event.eventId);
  });

  it("remove somente eventos confirmados pelo servidor", () => {
    const first = createSyncEvent({
      deviceId: "11111111-1111-4111-8111-111111111111",
      platform: "web",
      eventType: "achievement.unlocked",
      payload: { achievement_id: "first-lesson" }
    });
    const second = createSyncEvent({
      deviceId: "11111111-1111-4111-8111-111111111111",
      platform: "web",
      eventType: "achievement.unlocked",
      payload: { achievement_id: "streak-7" }
    });

    expect(acknowledgeSyncEvents([first, second], [first.eventId]))
      .toEqual([second]);
  });
});

describe("mesclagem conservadora", () => {
  it("une conclusões sem somar XP de snapshots", () => {
    const result = mergeProgressProjection(local, {
      totalXp: 130,
      currentStreak: 1,
      longestStreak: 5,
      lastStudyDate: "2026-10-16",
      completedLessonIds: ["genesis-u01-l02"],
      completedCheckpointIds: ["genesis-u01-cp"],
      earnedAchievementIds: ["checkpoint-1"]
    });

    expect(result.merged.xp).toBe(130);
    expect(result.merged.xp).not.toBe(230);
    expect(result.merged.completedLessonIds).toEqual([
      "genesis-u01-l01",
      "genesis-u01-l02"
    ]);
    expect(result.merged.completedCheckpointIds).toEqual(["genesis-u01-cp"]);
    expect(result.merged.perfectLessonIds).toEqual(["genesis-u01-l01"]);
    expect(result.merged.bestStreak).toBe(5);
    expect(result.merged.lastStudyDate).toBe("2026-10-16");
  });

  it("não reduz XP local enquanto eventos ainda podem estar pendentes", () => {
    const result = mergeProgressProjection(local, {
      totalXp: 80,
      currentStreak: 1,
      longestStreak: 2,
      completedLessonIds: [],
      completedCheckpointIds: [],
      earnedAchievementIds: []
    });

    expect(result.merged.xp).toBe(100);
    expect(result.merged.streak).toBe(2);
    expect(result.merged.bestStreak).toBe(3);
  });
});


describe("impressão da migração", () => {
  it("é estável quando apenas a ordem das coleções muda", () => {
    const reordered: CommonProgressProjection = {
      ...local,
      completedLessonIds: ["genesis-u01-l02", "genesis-u01-l01"],
      earnedAchievementIds: ["streak-7", "first-lesson"]
    };
    const sameContent: CommonProgressProjection = {
      ...reordered,
      completedLessonIds: [...reordered.completedLessonIds].reverse(),
      earnedAchievementIds: [...reordered.earnedAchievementIds].reverse()
    };
    expect(progressFingerprint(reordered)).toBe(progressFingerprint(sameContent));
    expect(progressFingerprint(reordered)).toMatch(/^[a-f0-9]{32}$/);
  });
});
