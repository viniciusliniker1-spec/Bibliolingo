import {
  getActivity,
  getBookForActivity,
  getUnitForActivity,
  orderedActivityIds
} from "../content/catalog";
import {
  deepenActivity,
  deepenActivityIds,
  deepenActivityUnlocked,
  deepenGenesisUnit
} from "../content/deepen/catalog";
import {
  formationActivityTitle,
  formationContent,
  formationQuestionsForActivity,
  formationQuestionToExercise,
  formationActivityUnlocked,
  formationLessonById,
  orderedFormationActivityIds
} from "../content/formation/catalog";
import {
  greekActivityById,
  greekActivityIds,
  greekUnitByActivityId
} from "../content/greek/catalog";
import { isJourneyActivityUnlocked } from "./unlocks";
import type { AdaptiveActivity, AdaptiveArea, AdaptiveConcept } from "./adaptive";

export interface AdaptiveCatalogProgress {
  completedLessonIds: string[];
  completedCheckpointIds: string[];
}

const uniqueConcepts = (concepts: AdaptiveConcept[]) => [
  ...new Map(concepts.map((concept) => [concept.id, concept])).values()
];

function isCompleted(id: string, checkpoint: boolean, progress: AdaptiveCatalogProgress) {
  return (checkpoint ? progress.completedCheckpointIds : progress.completedLessonIds).includes(id);
}

function sequenceUnlocked(ids: readonly string[], id: string, progress: AdaptiveCatalogProgress) {
  const index = ids.indexOf(id);
  if (index <= 0) return index === 0;
  const previous = ids[index - 1];
  return progress.completedLessonIds.includes(previous)
    || progress.completedCheckpointIds.includes(previous);
}

function canonical(progress: AdaptiveCatalogProgress): AdaptiveActivity[] {
  return orderedActivityIds.flatMap((id, order) => {
    const activity = getActivity(id);
    const unit = getUnitForActivity(id);
    const book = getBookForActivity(id);
    if (!activity || !unit || !book) return [];
    const checkpoint = "exercises" in activity;
    const concepts = checkpoint
      ? uniqueConcepts(activity.exercises.map((exercise) => ({
          id: exercise.conceptId,
          title: unit.concepts.find((concept) => concept.id === exercise.conceptId)?.title ?? exercise.conceptId
        })))
      : activity.conceptIds.map((conceptId) => ({
          id: conceptId,
          title: unit.concepts.find((concept) => concept.id === conceptId)?.title ?? conceptId
        }));
    return [{
      id,
      kind: "bible" as const,
      title: activity.title,
      subtitle: book.title + " · " + unit.title,
      estimatedMinutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : 10,
      concepts,
      checkpoint,
      accessible: isJourneyActivityUnlocked(id, orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds),
      completed: isCompleted(id, checkpoint, progress),
      order
    }];
  });
}

function greek(progress: AdaptiveCatalogProgress, offset: number): AdaptiveActivity[] {
  return greekActivityIds.flatMap((id, index) => {
    const activity = greekActivityById.get(id);
    const unit = greekUnitByActivityId.get(id);
    if (!activity || !unit) return [];
    const checkpoint = "exercises" in activity;
    const exercises = checkpoint ? activity.exercises : activity.steps.filter((step) => step.type !== "learn");
    const concepts = uniqueConcepts(exercises.map((exercise) => ({
      id: exercise.conceptId,
      title: unit.concepts.find((concept) => concept.id === exercise.conceptId)?.title ?? exercise.conceptId
    })));
    return [{
      id,
      kind: "greek" as const,
      title: activity.title,
      subtitle: "Grego Bíblico · " + unit.title,
      estimatedMinutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : 10,
      concepts,
      checkpoint,
      accessible: sequenceUnlocked(greekActivityIds, id, progress),
      completed: isCompleted(id, checkpoint, progress),
      order: offset + index
    }];
  });
}

function deepen(progress: AdaptiveCatalogProgress, offset: number): AdaptiveActivity[] {
  return deepenActivityIds.flatMap((id, index) => {
    const activity = deepenActivity(id);
    if (!activity) return [];
    const checkpoint = "exercises" in activity;
    const exercises = checkpoint ? activity.exercises : activity.steps.filter((step) => step.type !== "learn");
    const concepts = uniqueConcepts(exercises.map((exercise) => ({
      id: exercise.conceptId,
      title: deepenGenesisUnit.concepts.find((concept) => concept.id === exercise.conceptId)?.title ?? exercise.conceptId
    })));
    return [{
      id,
      kind: "deepen" as const,
      title: activity.title,
      subtitle: "Aprofundar · " + deepenGenesisUnit.title,
      estimatedMinutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : 12,
      concepts,
      checkpoint,
      accessible: deepenActivityUnlocked(id, progress.completedLessonIds, progress.completedCheckpointIds),
      completed: isCompleted(id, checkpoint, progress),
      order: offset + index
    }];
  });
}

function formation(progress: AdaptiveCatalogProgress, offset: number): AdaptiveActivity[] {
  return orderedFormationActivityIds.flatMap((id, index) => {
    const lesson = formationLessonById.get(id);
    const questions = formationQuestionsForActivity(id);
    if (!lesson && !questions.length) return [];
    const checkpoint = !lesson;
    const concepts = uniqueConcepts(questions.flatMap((question) => {
      const sourceLesson = lesson
        ?? formationContent.lessons.find((candidate) => candidate.id === question.lessonId)
        ?? formationContent.lessons[0];
      if (!sourceLesson) return [];
      const exercise = formationQuestionToExercise(question, sourceLesson, checkpoint);
      return [{ id: exercise.conceptId, title: sourceLesson.title }];
    }));
    return [{
      id,
      kind: "formation" as const,
      title: formationActivityTitle(id),
      subtitle: "Formação Pastoral Nazarena",
      estimatedMinutes: lesson?.minutes ?? 15,
      concepts,
      checkpoint,
      accessible: formationActivityUnlocked(id, progress.completedLessonIds, progress.completedCheckpointIds),
      completed: isCompleted(id, checkpoint, progress),
      order: offset + index
    }];
  });
}

export function buildAdaptiveActivityCatalog(progress: AdaptiveCatalogProgress) {
  const bible = canonical(progress);
  const greekItems = greek(progress, bible.length);
  const deepenItems = deepen(progress, bible.length + greekItems.length);
  const formationItems = formation(progress, bible.length + greekItems.length + deepenItems.length);
  return [...bible, ...greekItems, ...deepenItems, ...formationItems];
}

export function adaptiveWebPath(kind: AdaptiveArea, activityId?: string) {
  if (!activityId) return "/study";
  if (kind === "bible") return "/lesson/" + activityId;
  return "/" + kind + "/activity/" + activityId;
}
