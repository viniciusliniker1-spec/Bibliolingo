import { exerciseById } from "../content/catalog";
import { deepenExerciseById, deepenReviewExerciseByQuestionId } from "../content/deepen/catalog";
import {
  formationContent,
  formationQuestionsForActivity,
  formationQuestionToExercise,
  orderedFormationActivityIds
} from "../content/formation/catalog";
import { greekExerciseById } from "../content/greek/catalog";
import type { Exercise } from "../types/content";

const formationReviewExerciseById = new Map<string, Exercise>();
for (const activityId of orderedFormationActivityIds) {
  const questions = formationQuestionsForActivity(activityId);
  const checkpoint = !formationContent.lessons.some((lesson) => lesson.id === activityId);
  for (const question of questions) {
    const lesson = formationContent.lessons.find((candidate) =>
      candidate.id === (question.lessonId ?? activityId)
    ) ?? formationContent.lessons[0];
    if (!lesson) continue;
    formationReviewExerciseById.set(
      question.id,
      formationQuestionToExercise(question, lesson, checkpoint)
    );
  }
}

export function reviewExerciseForQuestion(questionId: string): Exercise | undefined {
  return deepenReviewExerciseByQuestionId.get(questionId)
    ?? greekExerciseById.get(questionId)
    ?? exerciseById.get(questionId)
    ?? formationReviewExerciseById.get(questionId);
}

export function originalExerciseForQuestion(questionId: string): Exercise | undefined {
  return exerciseById.get(questionId)
    ?? deepenExerciseById.get(questionId)
    ?? greekExerciseById.get(questionId)
    ?? formationReviewExerciseById.get(questionId);
}

export function conceptForQuestion(questionId: string) {
  return originalExerciseForQuestion(questionId)?.conceptId;
}
