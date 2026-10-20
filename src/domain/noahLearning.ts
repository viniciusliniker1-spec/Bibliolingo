import type { Exercise } from "../types/content";
import type { AppState } from "../types/progress";

export interface ExerciseAnswerDetails {
  selectedAnswer: string;
  correctAnswer: string;
}

export function exerciseOptions(exercise: Exercise): string[] {
  return exercise.type === "word-blocks"
    ? exercise.blocks.map((block) => block.text)
    : exercise.options.map((option) => option.text);
}

export function exerciseAnswerDetails(
  exercise: Exercise,
  selectedOption?: string,
  selectedBlocks: string[] = []
): ExerciseAnswerDetails {
  const correctAnswer =
    exercise.type === "word-blocks"
      ? exercise.correctOrder
          .map((id) => exercise.blocks.find((block) => block.id === id)?.text ?? "")
          .join(" ")
      : exercise.options.find((option) => option.id === exercise.correctOptionId)?.text ?? "";
  const selectedAnswer =
    exercise.type === "word-blocks"
      ? selectedBlocks
          .map((id) => exercise.blocks.find((block) => block.id === id)?.text ?? "")
          .join(" ")
      : exercise.options.find((option) => option.id === selectedOption)?.text ?? "";

  return { selectedAnswer, correctAnswer };
}

export function buildLearningProfile(state: AppState, currentConceptId?: string): string | undefined {
  const recent = state.attempts.slice(-40);
  if (!recent.length) return undefined;

  const byConcept = new Map<string, { correct: number; incorrect: number }>();
  for (const attempt of recent) {
    if (!attempt.conceptId) continue;
    const aggregate = byConcept.get(attempt.conceptId) ?? { correct: 0, incorrect: 0 };
    aggregate.correct += attempt.correct ? 1 : 0;
    aggregate.incorrect += attempt.correct ? 0 : 1;
    byConcept.set(attempt.conceptId, aggregate);
  }

  const current = currentConceptId ? byConcept.get(currentConceptId) : undefined;
  const difficulties = [...byConcept.entries()]
    .filter(([, result]) => result.incorrect > result.correct)
    .sort((a, b) => b[1].incorrect - a[1].incorrect)
    .slice(0, 3)
    .map(([conceptId, result]) => `${conceptId} (${result.incorrect} erro(s) recente(s))`);

  const accuracy = Math.round((recent.filter((attempt) => attempt.correct).length / recent.length) * 100);
  const parts = [`Desempenho recente: ${accuracy}% em ${recent.length} tentativa(s).`];
  if (current) {
    parts.push(
      `Conceito atual: ${current.correct} acerto(s) e ${current.incorrect} erro(s) recentes.`
    );
  }
  if (difficulties.length) {
    parts.push(`Dificuldades recorrentes: ${difficulties.join("; ")}.`);
    parts.push(`Recomendação pedagógica: revisar primeiro ${difficulties[0].split(" (")[0]}, usando uma explicação progressiva e uma nova questão, sem alterar o progresso.`);
  }
  if (state.reviewItems.length) parts.push(`Revisões pendentes: ${state.reviewItems.length}.`);
  return parts.join(" ");
}

export function contextualNoahEnabled(): boolean {
  return import.meta.env.VITE_NOAH_CONTEXTUAL_ENABLED !== "false";
}
