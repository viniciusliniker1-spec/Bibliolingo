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
import { exodusUnits as rawExodusUnits } from "./exodus/units";
import { leviticusUnits as rawLeviticusUnits } from "./leviticus/units";
import { numbersUnits as rawNumbersUnits } from "./numbers/units";
import { deuteronomyUnits as rawDeuteronomyUnits } from "./deuteronomy/units";

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
export const exodusUnits: Unit[] = rawExodusUnits.map(enrichUnit);
export const leviticusUnits: Unit[] = rawLeviticusUnits.map(enrichUnit);
export const numbersUnits: Unit[] = rawNumbersUnits.map(enrichUnit);
export const deuteronomyUnits: Unit[] = rawDeuteronomyUnits.map(enrichUnit);

export interface JourneyBook {
  id: string;
  title: string;
  shortTitle: string;
  units: Unit[];
}

export const journeyBooks: JourneyBook[] = [
  { id: "genesis", title: "Gênesis", shortTitle: "Gn", units: genesisUnits },
  { id: "exodus", title: "Êxodo", shortTitle: "Êx", units: exodusUnits },
  { id: "leviticus", title: "Levítico", shortTitle: "Lv", units: leviticusUnits },
  { id: "numbers", title: "Números", shortTitle: "Nm", units: numbersUnits },
  { id: "deuteronomy", title: "Deuteronômio", shortTitle: "Dt", units: deuteronomyUnits }
];

export const books: Book[] = journeyBooks.map((journeyBook, index) => ({
  id: journeyBook.id,
  contentVersion: journeyBook.id === "genesis" ? 3 : journeyBook.id === "exodus" ? 2 : 1,
  title: journeyBook.title,
  testament: "old",
  order: index + 1,
  unitLoader: async () => journeyBook.units
}));

export const pilotUnit: Unit = genesisUnits[0];
export const orderedUnits = journeyBooks.flatMap((book) => book.units);
export const orderedLessons: Lesson[] = orderedUnits.flatMap((unit) => unit.lessons);
export const orderedLessonIds = orderedLessons.map((lesson) => lesson.id);
export const orderedActivityIds = orderedUnits.flatMap((unit) => [
  ...unit.lessons.map((lesson) => lesson.id),
  unit.checkpoint.id
]);

const checkpoints: Checkpoint[] = orderedUnits.map((unit) => unit.checkpoint);
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
  orderedUnits.flatMap((unit) => [
    ...unit.lessons.map((lesson) => [lesson.id, unit] as const),
    [unit.checkpoint.id, unit] as const
  ])
);
export const bookByActivityId = new Map(
  journeyBooks.flatMap((book) =>
    book.units.flatMap((unit) => [
      ...unit.lessons.map((lesson) => [lesson.id, book] as const),
      [unit.checkpoint.id, book] as const
    ])
  )
);

export function getActivity(id: string) {
  return activities.find((activity) => activity.id === id);
}

export function getUnitForActivity(id: string) {
  return unitByActivityId.get(id);
}

export function getBookForActivity(id: string) {
  return bookByActivityId.get(id);
}
