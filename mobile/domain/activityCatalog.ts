import {
  getActivity,
  getBookForActivity,
  getUnitForActivity,
  orderedActivityIds
} from "../../src/content/catalog";
import {
  greekActivityById,
  greekActivityIds,
  greekUnitByActivityId
} from "../../src/content/greek/catalog";
import {
  deepenActivity,
  deepenActivityIds,
  deepenGenesisUnit
} from "../../src/content/deepen/catalog";
import {
  formationActivityTitle,
  formationContent,
  formationLessonById,
  formationQuestionsForActivity,
  formationQuestionToExercise,
  formationSubjectForActivity,
  orderedFormationActivityIds
} from "../../src/content/formation/catalog";
import type {
  Exercise,
  LearningStep,
  LessonStep,
  SourceReference
} from "../../src/types/content";

export type MobileActivityKind = "bible" | "greek" | "formation" | "deepen";
export type MobileNoahArea = "bible" | "greek" | "formation" | "deepen";

export interface MobileActivityDescriptor {
  id: string;
  kind: MobileActivityKind;
  title: string;
  subtitle: string;
  contextTitle: string;
  checkpoint: boolean;
  passAccuracy: number;
  estimatedMinutes?: number;
  steps: LessonStep[];
  sourceIds?: string[];
  sources?: SourceReference[];
}

function learningStep(
  id: string,
  title: string,
  body: string,
  reference?: LearningStep["reference"],
  sourceIds?: string[]
): LearningStep {
  return {
    id,
    type: "learn",
    title,
    body,
    layer: "theology",
    reference,
    sourceIds
  };
}

function buildMobileActivity(
  kind: MobileActivityKind,
  activityId: string
): MobileActivityDescriptor | undefined {
  if (kind === "bible") {
    const activity = getActivity(activityId);
    const unit = getUnitForActivity(activityId);
    const book = getBookForActivity(activityId);
    if (!activity || !unit || !book) return undefined;
    const checkpoint = !("steps" in activity);
    return {
      id: activity.id,
      kind,
      title: activity.title,
      subtitle: activity.subtitle,
      contextTitle: `${book.title} · ${unit.title}`,
      checkpoint,
      passAccuracy: checkpoint ? activity.passAccuracy : 0.8,
      estimatedMinutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : undefined,
      steps: checkpoint ? activity.exercises : activity.steps,
      sources: unit.sources
    };
  }

  if (kind === "greek") {
    const activity = greekActivityById.get(activityId);
    const unit = greekUnitByActivityId.get(activityId);
    if (!activity || !unit) return undefined;
    const checkpoint = !("steps" in activity);
    return {
      id: activity.id,
      kind,
      title: activity.title,
      subtitle: activity.subtitle,
      contextTitle: `Grego Bíblico · ${unit.title}`,
      checkpoint,
      passAccuracy: checkpoint ? activity.passAccuracy : 0.8,
      estimatedMinutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : undefined,
      steps: checkpoint ? activity.exercises : activity.steps,
      sources: unit.sources
    };
  }

  if (kind === "deepen") {
    const activity = deepenActivity(activityId);
    if (!activity) return undefined;
    const checkpoint = !("blocks" in activity);
    const steps: LessonStep[] = checkpoint
      ? activity.exercises
      : [
          ...activity.blocks.map((block) =>
            learningStep(
              block.id,
              block.title,
              block.body,
              activity.baseText,
              block.sourceIds
            )
          ),
          ...activity.exercises
        ];
    return {
      id: activity.id,
      kind,
      title: activity.title,
      subtitle: activity.subtitle,
      contextTitle: `Aprofundar · ${deepenGenesisUnit.title}`,
      checkpoint,
      passAccuracy: checkpoint ? activity.passAccuracy : 0.8,
      estimatedMinutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : undefined,
      steps
    };
  }

  const lesson = formationLessonById.get(activityId);
  const subject = formationSubjectForActivity(activityId);
  const questions = formationQuestionsForActivity(activityId);
  if (!lesson && !questions.length) return undefined;
  const checkpoint = !lesson;
  const exercises: Exercise[] = questions.map((question) =>
    formationQuestionToExercise(
      question,
      lesson ?? formationContent.lessons.find((candidate) =>
        candidate.id === question.lessonId
      ) ?? formationContent.lessons[0],
      checkpoint
    )
  );
  const steps: LessonStep[] = lesson
    ? [
        ...lesson.understand.map((body, index) =>
          learningStep(
            `${lesson.id}-understand-${index + 1}`,
            index === 0 ? "Compreensão" : `Compreensão · parte ${index + 1}`,
            body
          )
        ),
        learningStep(`${lesson.id}-practice`, "Prática pastoral", lesson.application),
        learningStep(`${lesson.id}-confusion`, "Evite esta confusão", lesson.confusion),
        learningStep(`${lesson.id}-summary`, "Síntese para entrevista", lesson.summary),
        ...exercises
      ]
    : exercises;
  return {
    id: activityId,
    kind,
    title: formationActivityTitle(activityId),
    subtitle: lesson ? `${lesson.minutes} min · ${lesson.bibleReferences.join(" · ")}` : "Avaliação da Formação Pastoral",
    contextTitle: `Formação Pastoral · ${subject?.title ?? formationContent.title}`,
    checkpoint,
    passAccuracy: formationContent.passAccuracy,
    estimatedMinutes: lesson?.minutes,
    steps,
    sourceIds: lesson ? [lesson.source.title, lesson.source.locator] : undefined
  };
}

const activityCache = new Map<string, MobileActivityDescriptor | undefined>();

export function resolveMobileActivity(kind: MobileActivityKind, activityId: string) {
  const key = kind + ":" + activityId;
  if (activityCache.has(key)) return activityCache.get(key);
  const activity = buildMobileActivity(kind, activityId);
  activityCache.set(key, activity);
  return activity;
}

export function activityIdsForKind(kind: MobileActivityKind) {
  if (kind === "bible") return orderedActivityIds;
  if (kind === "greek") return greekActivityIds;
  if (kind === "deepen") return deepenActivityIds;
  return orderedFormationActivityIds;
}

export function nextActivityForKind(
  kind: MobileActivityKind,
  completedLessonIds: string[],
  completedCheckpointIds: string[]
) {
  const completed = new Set([...completedLessonIds, ...completedCheckpointIds]);
  const ids = activityIdsForKind(kind);
  return ids.find((id) => !completed.has(id)) ?? ids[0];
}

export function mobileActivityRoute(kind: MobileActivityKind, activityId: string) {
  return kind === "bible"
    ? { pathname: "/lesson/[activityId]" as const, params: { activityId } }
    : {
        pathname: "/activity/[kind]/[activityId]" as const,
        params: { kind, activityId }
      };
}

export function mobileHubRoute(kind: MobileActivityKind) {
  if (kind === "greek") return "/greek";
  if (kind === "formation") return "/formation";
  if (kind === "deepen") return "/deepen";
  return "/";
}
