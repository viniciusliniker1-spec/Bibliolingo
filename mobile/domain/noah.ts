import type { Exercise } from "../../src/types/content";

export type NoahMode = "explain" | "simple" | "deepen" | "example" | "error" | "practice" | "ask";
export type NoahKnowledgeLevel = "beginner" | "intermediate" | "advanced";

export interface NoahContext {
  area: "bible";
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
  sources?: string[];
  editorialStatus?: "reviewed" | "pending";
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
