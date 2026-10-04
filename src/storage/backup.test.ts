import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { parseBackup, serializeBackup } from "./backup";

describe("backup", () => {
  it("exporta e importa progresso, notas, marcações e preferências", () => {
    const annotation = {
      id: "almeida-1819:John:3:16",
      translationId: "almeida-1819",
      bookOsis: "John",
      bookName: "João",
      chapter: 3,
      verse: 16,
      note: "Deus ama e oferece.",
      bookmarked: true,
      updatedAt: "2026-10-03T00:00:00.000Z"
    };
    const state = {
      ...initialState,
      xp: 125,
      settings: { ...initialState.settings, soundEnabled: false },
      bibleAnnotations: { [annotation.id]: annotation }
    };
    const restored = parseBackup(serializeBackup(state));
    expect(restored.xp).toBe(125);
    expect(restored.bibleAnnotations[annotation.id]?.note).toBe("Deus ama e oferece.");
    expect(restored.settings.soundEnabled).toBe(false);
  });

  it("migra backup da versão anterior sem perder progresso", () => {
    const current = JSON.parse(serializeBackup(initialState));
    current.state.schemaVersion = 2;
    delete current.state.settings.soundEnabled;
    const restored = parseBackup(JSON.stringify(current));
    expect(restored.schemaVersion).toBe(3);
    expect(restored.settings.soundEnabled).toBe(true);
  });

  it("rejeita arquivo inválido antes de substituir dados", () => {
    expect(() => parseBackup('{"app":"outro"}')).toThrow();
    expect(() => parseBackup("não é json")).toThrow();
  });
});
