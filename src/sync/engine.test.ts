import { describe, expect, it } from "vitest";
import {
  acknowledgeSyncEvents,
  createSyncEvent,
  enqueueSyncEvent,
  mergeProgressProjection
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
