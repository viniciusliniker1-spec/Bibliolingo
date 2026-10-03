import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { migrateState } from "./migrations";

describe("migrations", () => {
  it("preserva progresso ao migrar estado legado e adiciona dados bíblicos", () => {
    const migrated = migrateState({
      ...initialState,
      schemaVersion: 1,
      xp: 420,
      completedLessonIds: ["genesis-u01-l01"],
      bibleAnnotations: undefined
    });
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.xp).toBe(420);
    expect(migrated?.completedLessonIds).toContain("genesis-u01-l01");
    expect(migrated?.bibleAnnotations).toEqual({});
  });

  it("preserva notas e marcações na versão atual", () => {
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
      bibleAnnotations: { [annotation.id]: annotation }
    });
    expect(migrated?.bibleAnnotations[annotation.id]).toEqual(annotation);
  });

  it("rejeita versão desconhecida", () => {
    expect(migrateState({ schemaVersion: 99 })).toBeUndefined();
  });
});
