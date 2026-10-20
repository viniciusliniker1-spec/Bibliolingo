import { describe, expect, it } from "vitest";
import type { Exercise } from "../../src/types/content";
import {
  exerciseAnswerText,
  exerciseCorrectAnswerText,
  exerciseOptions,
  exercisePrompt,
  validateNoahQuestion
} from "./noah";

const reference = {
  bookId: "genesis",
  startChapter: 1,
  startVerse: 1,
  label: "Gênesis 1:1"
};

const base = {
  id: "genesis-test-q01",
  prompt: "Quem é apresentado como Criador?",
  objective: "Reconhecer Deus como Criador.",
  explanation: "O texto apresenta Deus como aquele que cria.",
  reference,
  conceptId: "creation",
  difficulty: "easy" as const
};

describe("contexto do Professor Noah mobile", () => {
  it("mantém a frase inteira montada pelo estudante", () => {
    const exercise: Exercise = {
      ...base,
      type: "word-blocks",
      blocks: [
        { id: "deus", text: "Deus" },
        { id: "disse", text: "disse" },
        { id: "luz", text: "luz" },
        { id: "haja", text: "haja" }
      ],
      correctOrder: ["deus", "disse", "haja", "luz"]
    };

    expect(exerciseAnswerText(exercise, ["deus", "disse", "luz", "haja"]))
      .toBe("Deus disse luz haja");
    expect(exerciseCorrectAnswerText(exercise)).toBe("Deus disse haja luz");
  });

  it("expõe alternativas e resposta correta sem depender da IA", () => {
    const exercise: Exercise = {
      ...base,
      type: "multiple-choice",
      options: [
        { id: "a", text: "Moisés" },
        { id: "b", text: "Deus" }
      ],
      correctOptionId: "b"
    };

    expect(exercisePrompt(exercise)).toBe(base.prompt);
    expect(exerciseOptions(exercise)).toEqual(["Moisés", "Deus"]);
    expect(exerciseAnswerText(exercise, ["a"])).toBe("Moisés");
    expect(exerciseCorrectAnswerText(exercise)).toBe("Deus");
  });

  it("monta o enunciado de completar frase", () => {
    const exercise: Exercise = {
      ...base,
      type: "fill-choice",
      sentenceBefore: "No princípio",
      sentenceAfter: "criou os céus e a terra.",
      options: [{ id: "deus", text: "Deus" }],
      correctOptionId: "deus"
    };

    expect(exercisePrompt(exercise)).toBe("No princípio _____ criou os céus e a terra.");
  });

  it("rejeita pergunta vazia ou acima do limite", () => {
    expect(() => validateNoahQuestion("   ")).toThrow("Escreva uma pergunta");
    expect(() => validateNoahQuestion("a".repeat(1201))).toThrow("1.200 caracteres");
    expect(validateNoahQuestion("  Explique Gênesis 1.  ")).toBe("Explique Gênesis 1.");
  });
});
