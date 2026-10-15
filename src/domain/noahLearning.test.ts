import { describe, expect, it } from "vitest";
import { buildLearningProfile, exerciseAnswerDetails, exerciseOptions } from "./noahLearning";
import { initialState } from "../state/initialState";
import type { Exercise } from "../types/content";

const exercise: Exercise = {
  id: "genesis-u01-l01-q01",
  type: "multiple-choice",
  prompt: "Segundo o texto, o que foi considerado justiça?",
  objective: "Distinguir fé e obras.",
  explanation: "Abrão creu no Senhor.",
  reference: { bookId: "genesis", startChapter: 15, startVerse: 6, label: "Gênesis 15:6" },
  conceptId: "faith",
  difficulty: "medium",
  options: [
    { id: "works", text: "Suas boas obras" },
    { id: "faith", text: "Sua fé no Senhor" }
  ],
  correctOptionId: "faith"
};

describe("contexto pedagógico do Noah", () => {
  it("expõe alternativas sem inferir o gabarito", () => {
    expect(exerciseOptions(exercise)).toEqual(["Suas boas obras", "Sua fé no Senhor"]);
  });

  it("produz respostas selecionada e correta somente após a correção", () => {
    expect(exerciseAnswerDetails(exercise, "works")).toEqual({
      selectedAnswer: "Suas boas obras",
      correctAnswer: "Sua fé no Senhor"
    });
  });

  it("resume domínio recente sem confundir atividade com XP", () => {
    const state = {
      ...initialState,
      xp: 9999,
      attempts: [
        {
          id: "a1",
          questionId: "q1",
          lessonId: "l1",
          conceptId: "faith",
          correct: false,
          difficulty: "medium" as const,
          answeredAt: "2026-10-14T10:00:00.000Z",
          mode: "lesson" as const
        }
      ]
    };
    const summary = buildLearningProfile(state, "faith");
    expect(summary).toContain("0%");
    expect(summary).toContain("faith");
    expect(summary).not.toContain("9999");
    expect(buildLearningProfile(initialState)).toBeUndefined();
  });
});
