import type { Exercise } from "../../src/types/content";
import type { MobileProgress } from "../types/progress";

export type NoahMode = "explain" | "simple" | "deepen" | "example" | "error" | "practice" | "ask";
export type NoahKnowledgeLevel = "beginner" | "intermediate" | "advanced";

export type NoahArea = "bible" | "greek" | "lexicon" | "formation" | "deepen";

export interface NoahContext {
  area: NoahArea;
  title: string;
  objective?: string;
  reference?: string;
  content?: string;
  currentQuestion?: string;
  selectedAnswer?: string;
  correctAnswer?: string;
  options?: string[];
  answerStatus?: "unanswered" | "correct" | "incorrect";
  difficulty?: "easy" | "medium" | "hard";
  conceptId?: string;
  lessonId?: string;
  questionId?: string;
  learningProfile?: string;
  sources?: string[];
  editorialStatus?: "reviewed" | "pending";
  lexicalData?: Record<string, string | string[] | undefined>;
}

export interface NoahHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface NoahTutorResponse {
  answer: string;
  tokens: number;
  incomplete?: boolean;
  grounding?: { references: string[]; sourceAvailable: boolean };
}

export class NoahUnavailableError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "NoahUnavailableError";
  }
}

export function validateNoahQuestion(question: string) {
  const clean = question.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (!clean) throw new NoahUnavailableError("Escreva uma pergunta para o Noah.", "empty-question");
  if (clean.length > 1200) {
    throw new NoahUnavailableError("Reduza a pergunta para até 1.200 caracteres.", "question-too-long");
  }
  return clean;
}

export function exercisePrompt(exercise: Exercise) {
  return exercise.type === "fill-choice"
    ? `${exercise.sentenceBefore} _____ ${exercise.sentenceAfter}`.trim()
    : exercise.prompt;
}

export function exerciseOptions(exercise: Exercise) {
  return exercise.type === "word-blocks"
    ? exercise.blocks.map((block) => block.text)
    : exercise.options.map((option) => option.text);
}

export function exerciseAnswerText(exercise: Exercise, selectedIds: string[]) {
  if (exercise.type === "word-blocks") {
    return selectedIds
      .map((id) => exercise.blocks.find((block) => block.id === id)?.text)
      .filter((value): value is string => Boolean(value))
      .join(" ");
  }
  return exercise.options.find((option) => option.id === selectedIds[0])?.text ?? "";
}

export function exerciseCorrectAnswerText(exercise: Exercise) {
  if (exercise.type === "word-blocks") {
    return exercise.correctOrder
      .map((id) => exercise.blocks.find((block) => block.id === id)?.text)
      .filter((value): value is string => Boolean(value))
      .join(" ");
  }
  return exercise.options.find((option) => option.id === exercise.correctOptionId)?.text ?? "";
}


export function buildMobileLearningProfile(progress: MobileProgress, currentConceptId?: string) {
  const recurring = progress.reviewItems
    .filter((item) => item.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 3);
  const current = currentConceptId
    ? progress.reviewItems.find((item) => item.conceptId === currentConceptId)
    : undefined;
  const parts = [
    `Revisões pendentes: ${progress.reviewItems.length}.`,
    `Erros ainda registrados: ${progress.incorrectQuestionIds.length}.`
  ];
  if (current) parts.push(`Conceito atual revisado ${current.lapses} vez(es); último resultado: ${current.lastResult}.`);
  if (recurring.length) parts.push(`Dificuldades recorrentes: ${recurring.map((item) => item.conceptId).join("; ")}.`);
  return parts.join(" ");
}
