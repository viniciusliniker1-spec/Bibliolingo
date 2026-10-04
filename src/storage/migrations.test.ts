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
    expect(migrated?.schemaVersion).toBe(4);
    expect(migrated?.xp).toBe(420);
    expect(migrated?.completedLessonIds).toContain("genesis-u01-l01");
    expect(migrated?.bibleAnnotations).toEqual({});
    expect(migrated?.settings.soundEnabled).toBe(true);
    expect(migrated?.settings.hapticsEnabled).toBe(true);
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
      settings: {
        ...initialState.settings,
        soundEnabled: false,
        hapticsEnabled: false
      },
      bibleAnnotations: { [annotation.id]: annotation }
    });
    expect(migrated?.bibleAnnotations[annotation.id]).toEqual(annotation);
    expect(migrated?.settings.soundEnabled).toBe(false);
    expect(migrated?.settings.hapticsEnabled).toBe(false);
  });

  it("rejeita versão desconhecida", () => {
    expect(migrateState({ schemaVersion: 99 })).toBeUndefined();
  });
});
