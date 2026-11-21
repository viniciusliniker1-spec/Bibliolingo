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

// Montado só na primeira vez que uma questão da Formação é procurada: no celular,
// construir tudo ao abrir a revisão travava a tela por vários segundos.
let formationReviewExercises: Map<string, Exercise> | undefined;
function formationReviewExerciseById() {
  if (formationReviewExercises) return formationReviewExercises;
  formationReviewExercises = new Map<string, Exercise>();
  for (const activityId of orderedFormationActivityIds) {
    const questions = formationQuestionsForActivity(activityId);
    const checkpoint = !formationContent.lessons.some((lesson) => lesson.id === activityId);
    for (const question of questions) {
      const lesson = formationContent.lessons.find((candidate) =>
        candidate.id === (question.lessonId ?? activityId)
      ) ?? formationContent.lessons[0];
      if (!lesson) continue;
      formationReviewExercises.set(
        question.id,
        formationQuestionToExercise(question, lesson, checkpoint)
      );
    }
  }
  return formationReviewExercises;
}

export function reviewExerciseForQuestion(questionId: string): Exercise | undefined {
  // Bíblia primeiro: o catálogo já está carregado. Os outros percursos só são
  // avaliados quando a questão não é da Bíblia (imports inline no app).
  return exerciseById.get(questionId)
    ?? deepenReviewExerciseByQuestionId.get(questionId)
    ?? greekExerciseById.get(questionId)
    ?? formationReviewExerciseById().get(questionId);
}

export function originalExerciseForQuestion(questionId: string): Exercise | undefined {
  return exerciseById.get(questionId)
    ?? deepenExerciseById.get(questionId)
    ?? greekExerciseById.get(questionId)
    ?? formationReviewExerciseById().get(questionId);
}

export function conceptForQuestion(questionId: string) {
  return originalExerciseForQuestion(questionId)?.conceptId;
}
