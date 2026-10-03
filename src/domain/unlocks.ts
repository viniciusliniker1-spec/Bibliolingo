export type JourneyStatus =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "checkpoint"
  | "review";

export function isLessonUnlocked(
  lessonId: string,
  orderedLessonIds: string[],
  completedLessonIds: string[]
): boolean {
  const index = orderedLessonIds.indexOf(lessonId);
  if (index < 0) return false;
  if (index === 0) return true;
  return completedLessonIds.includes(orderedLessonIds[index - 1]);
}

export function isCheckpointUnlocked(
  orderedLessonIds: string[],
  completedLessonIds: string[]
): boolean {
  return orderedLessonIds.every((id) => completedLessonIds.includes(id));
}

export function nextActivityId(
  orderedLessonIds: string[],
  checkpointId: string,
  completedLessonIds: string[],
  completedCheckpointIds: string[]
): string {
  const nextLesson = orderedLessonIds.find((id) => !completedLessonIds.includes(id));
  if (nextLesson) return nextLesson;
  if (!completedCheckpointIds.includes(checkpointId)) return checkpointId;
  return checkpointId;
}
