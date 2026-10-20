import type { Exercise } from "../../src/types/content";

export function isExerciseAnswerCorrect(exercise: Exercise, selectedIds: string[]): boolean {
  if (exercise.type === "word-blocks") {
    return exercise.correctOrder.length === selectedIds.length
      && exercise.correctOrder.every((id, index) => id === selectedIds[index]);
  }
  return selectedIds[0] === exercise.correctOptionId;
}
