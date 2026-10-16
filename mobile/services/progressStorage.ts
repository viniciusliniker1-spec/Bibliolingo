import AsyncStorage from "@react-native-async-storage/async-storage";
import { createInitialProgress } from "../domain/progress";
import type { ActiveLessonSession, MobileProgress } from "../types/progress";

const STORAGE_KEY = "@bibliolingo/mobile-progress/v1";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeActiveLesson(value: unknown): ActiveLessonSession | undefined {
  if (!value || typeof value !== "object") return undefined;
  const session = value as Partial<ActiveLessonSession>;
  if (
    typeof session.activityId !== "string"
    || typeof session.stepIndex !== "number"
    || typeof session.correct !== "number"
    || typeof session.incorrect !== "number"
    || !isStringArray(session.answeredQuestionIds)
    || typeof session.startedAt !== "string"
  ) {
    return undefined;
  }
  const answers = session.answers && typeof session.answers === "object"
    ? Object.fromEntries(
      Object.entries(session.answers).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean")
    )
    : {};
  return { ...session, answers } as ActiveLessonSession;
}

export function normalizeProgress(value: unknown): MobileProgress {
  const fallback = createInitialProgress();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<MobileProgress>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.xp !== "number" ||
    typeof candidate.streak !== "number" ||
    typeof candidate.bestStreak !== "number" ||
    !isStringArray(candidate.completedLessonIds) ||
    !isStringArray(candidate.completedCheckpointIds) ||
    !isStringArray(candidate.perfectLessonIds) ||
    !isStringArray(candidate.incorrectQuestionIds)
  ) {
    return fallback;
  }
  return {
    ...fallback,
    ...candidate,
    learnedGreekLexemeIds: isStringArray(candidate.learnedGreekLexemeIds) ? candidate.learnedGreekLexemeIds : [],
    reviewItems: Array.isArray(candidate.reviewItems)
      ? candidate.reviewItems.filter((item) => item && typeof item.questionId === "string")
      : [],
    activeLesson: normalizeActiveLesson(candidate.activeLesson)
  };
}

export async function loadProgress(): Promise<MobileProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? normalizeProgress(JSON.parse(raw)) : createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export async function saveProgress(progress: MobileProgress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
