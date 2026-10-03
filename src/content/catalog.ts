import type { Book, Exercise, Lesson, Unit } from "../types/content";
import { genesisUnit01 } from "./genesis/unit01";

export const books: Book[] = [
  {
    id: "genesis",
    contentVersion: 1,
    title: "Gênesis",
    testament: "old",
    order: 1,
    unitLoader: async () => [genesisUnit01]
  }
];

export const pilotUnit: Unit = genesisUnit01;
export const orderedLessons: Lesson[] = pilotUnit.lessons;
export const orderedLessonIds = orderedLessons.map((lesson) => lesson.id);

const exercises = [
  ...pilotUnit.lessons.flatMap((lesson) =>
    lesson.steps.filter((step): step is Exercise => step.type !== "learn")
  ),
  ...pilotUnit.checkpoint.exercises
];

export const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
export const lessonById = new Map(orderedLessons.map((lesson) => [lesson.id, lesson]));

export function getActivity(id: string) {
  if (id === pilotUnit.checkpoint.id) return pilotUnit.checkpoint;
  return lessonById.get(id);
}
