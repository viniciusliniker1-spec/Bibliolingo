import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { migrateState } from "./migrations";

describe("migrations", () => {
  it("preserva progresso ao migrar estado legado e habilita feedback acessível", () => {
    const legacy = {
      ...initialState,
      schemaVersion: 1,
      xp: 420,
      completedLessonIds: ["genesis-u01-l01"],
      bibleAnnotations: undefined,
      settings: {
        heartsEnabled: true,
        maxHearts: 5
      }
    };
    const migrated = migrateState(legacy);
    expect(migrated?.schemaVersion).toBe(6);
    expect(migrated?.xp).toBe(420);
    expect(migrated?.completedLessonIds).toContain("genesis-u01-l01");
    expect(migrated?.bibleAnnotations).toEqual({});
    expect(migrated?.settings.soundEnabled).toBe(true);
    expect(migrated?.settings.hapticsEnabled).toBe(true);
    expect(migrated?.settings.dailyReminderEnabled).toBe(false);
    expect(migrated?.settings.dailyReminderTime).toBe("19:00");
    expect(migrated?.profile.knowledgeLevel).toBe("intermediate");
  });

  it("preserva notas, marcações e preferências na versão atual", () => {
    const annotation = {
      id: "almeida-1819:John:3:16",
      translationId: "almeida-1819",
      bookOsis: "John",
      bookName: "João",
      chapter: 3,
      verse: 16,
      note: "Amor que se oferece.",
      bookmarked: true,
      updatedAt: "2026-10-03T00:00:00.000Z"
    };
    const migrated = migrateState({
      ...initialState,
      bibleAnnotations: { [annotation.id]: annotation },
      settings: {
        ...initialState.settings,
        soundEnabled: false,
        hapticsEnabled: false,
        dailyReminderEnabled: true,
        dailyReminderTime: "07:30"
      }
    });
    expect(migrated?.bibleAnnotations[annotation.id]).toEqual(annotation);
    expect(migrated?.settings.soundEnabled).toBe(false);
    expect(migrated?.settings.hapticsEnabled).toBe(false);
    expect(migrated?.settings.dailyReminderEnabled).toBe(true);
    expect(migrated?.settings.dailyReminderTime).toBe("07:30");
  });

  it("rejeita versão desconhecida", () => {
    expect(migrateState({ schemaVersion: 99 })).toBeUndefined();
  });
});
