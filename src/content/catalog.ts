import type { Book, Checkpoint, Exercise, Lesson, Unit } from "../types/content";
import { genesisUnit01 } from "./genesis/unit01";
import { genesisExpandedUnits } from "./genesis/expandedUnits";

export const genesisUnits: Unit[] = [genesisUnit01, ...genesisExpandedUnits];

export const books: Book[] = [
  {
    id: "genesis",
    contentVersion: 2,
    title: "Gênesis",
    testament: "old",
    order: 1,
    unitLoader: async () => genesisUnits
  }
];

export const pilotUnit: Unit = genesisUnit01;
export const orderedUnits = genesisUnits;
export const orderedLessons: Lesson[] = genesisUnits.flatMap((unit) => unit.lessons);
export const orderedLessonIds = orderedLessons.map((lesson) => lesson.id);
export const orderedActivityIds = genesisUnits.flatMap((unit) => [
  ...unit.lessons.map((lesson) => lesson.id),
  unit.checkpoint.id
]);

const checkpoints: Checkpoint[] = genesisUnits.map((unit) => unit.checkpoint);
const activities = [...orderedLessons, ...checkpoints];
const exercises = [
  ...orderedLessons.flatMap((lesson) =>
    lesson.steps.filter((step): step is Exercise => step.type !== "learn")
  ),
  ...checkpoints.flatMap((checkpoint) => checkpoint.exercises)
];

export const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
export const lessonById = new Map(orderedLessons.map((lesson) => [lesson.id, lesson]));
export const unitByActivityId = new Map(
  genesisUnits.flatMap((unit) => [
    ...unit.lessons.map((lesson) => [lesson.id, unit] as const),
    [unit.checkpoint.id, unit] as const
  ])
);

export function getActivity(id: string) {
  return activities.find((activity) => activity.id === id);
}

export function getUnitForActivity(id: string) {
  return unitByActivityId.get(id);
}
