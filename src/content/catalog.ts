import type {
  Book,
  Checkpoint,
  Exercise,
  LearningStep,
  Lesson,
  Unit
} from "../types/content";
import { genesisUnit01 } from "./genesis/unit01";
import { genesisExpandedUnits } from "./genesis/expandedUnits";

function addTeachingBeforeEveryQuestion(lesson: Lesson): Lesson {
  const steps = lesson.steps.flatMap((step, index) => {
    if (step.type === "learn" || index === 0 || lesson.steps[index - 1]?.type === "learn") {
      return [step];
    }
    const guide: LearningStep = {
      id: step.id + "-guide",
      type: "learn",
      title: "Leitura guiada antes da pergunta",
      body:
        "Retome " +
        step.reference.label +
        " e observe como o texto desenvolve este objetivo: " +
        step.objective.charAt(0).toLocaleLowerCase("pt-BR") +
        step.objective.slice(1) +
        ". Considere quem age, o que é afirmado explicitamente e qual conclusão realmente nasce da passagem.",
      layer: "biblical-text",
      keyPoints: [
        "Procure evidência explícita na referência",
        "Diferencie descrição narrativa, interpretação e aplicação"
      ],
      reference: step.reference
    };
    return [guide, step];
  });

  return {
    ...lesson,
    contentVersion: Math.max(2, lesson.contentVersion),
    estimatedMinutes: Math.max(8, lesson.estimatedMinutes),
    steps
  };
}

function enrichUnit(unit: Unit): Unit {
  return {
    ...unit,
    contentVersion: Math.max(2, unit.contentVersion),
    lessons: unit.lessons.map(addTeachingBeforeEveryQuestion)
  };
}

export const genesisUnits: Unit[] = [genesisUnit01, ...genesisExpandedUnits].map(enrichUnit);

export const books: Book[] = [
  {
    id: "genesis",
    contentVersion: 3,
    title: "Gênesis",
    testament: "old",
    order: 1,
    unitLoader: async () => genesisUnits
  }
];

export const pilotUnit: Unit = genesisUnits[0];
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
