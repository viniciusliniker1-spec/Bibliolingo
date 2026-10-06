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
      profile: { ...initialState.profile, knowledgeLevel: "advanced" as const },
      settings: {
        ...initialState.settings,
        soundEnabled: false,
        hapticsEnabled: false,
        dailyReminderEnabled: true,
        dailyReminderTime: "06:45"
      },
      bibleAnnotations: { [annotation.id]: annotation },
      attempts: [{
        id: "manual-01-q1-test",
        questionId: "manual-01-q1",
        lessonId: "manual-01",
        correct: true,
        difficulty: "medium" as const,
        answeredAt: "2026-10-05T12:00:00.000Z",
        mode: "deepen" as const
      }]
    };
    const restored = parseBackup(serializeBackup(state));
    expect(restored.xp).toBe(125);
    expect(restored.bibleAnnotations[annotation.id]?.note).toBe("Deus ama e oferece.");
    expect(restored.settings.soundEnabled).toBe(false);
    expect(restored.settings.hapticsEnabled).toBe(false);
    expect(restored.settings.dailyReminderEnabled).toBe(true);
    expect(restored.settings.dailyReminderTime).toBe("06:45");
    expect(restored.attempts[0]?.mode).toBe("deepen");
    expect(restored.profile.knowledgeLevel).toBe("advanced");
  });

  it("migra backup da versão anterior sem perder progresso", () => {
    const current = JSON.parse(serializeBackup(initialState));
    current.state.schemaVersion = 3;
    delete current.state.settings.hapticsEnabled;
    const restored = parseBackup(JSON.stringify(current));
    expect(restored.schemaVersion).toBe(6);
    expect(restored.settings.hapticsEnabled).toBe(true);
  });

  it("rejeita arquivo inválido antes de substituir dados", () => {
    expect(() => parseBackup('{"app":"outro"}')).toThrow();
    expect(() => parseBackup("não é json")).toThrow();
  });
});
