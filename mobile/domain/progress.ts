import { GAMIFICATION } from "../../src/config/gamification";
import { calculateLessonXp } from "../../src/domain/gamification";
import { updateStreak } from "../../src/domain/streak";
import { registerReviewResult } from "../../src/domain/review";
import type { ActiveLessonSession, CompletionResult, MobileProgress } from "../types/progress";

export function createInitialProgress(): MobileProgress {
  return {
    schemaVersion: 1,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    completedLessonIds: [],
    completedCheckpointIds: [],
    perfectLessonIds: [],
    incorrectQuestionIds: [],
    reviewItems: [],
    learnedGreekLexemeIds: []
  };
}

function appendUnique(values: string[], value: string): string[] {
  return values.includes(value) ? values : [...values, value];
}

export function createLessonSession(activityId: string): ActiveLessonSession {
  return {
    activityId,
    stepIndex: 0,
    correct: 0,
    incorrect: 0,
    answeredQuestionIds: [],
    answers: {},
    startedAt: new Date().toISOString()
  };
}

export function recordAnswer(
  session: ActiveLessonSession,
  questionId: string,
  correct: boolean
): ActiveLessonSession {
  if (session.answeredQuestionIds.includes(questionId)) return session;
  return {
    ...session,
    correct: session.correct + (correct ? 1 : 0),
    incorrect: session.incorrect + (correct ? 0 : 1),
    answeredQuestionIds: [...session.answeredQuestionIds, questionId],
    answers: { ...session.answers, [questionId]: correct }
  };
}

export function finishActivity(
  current: MobileProgress,
  activityId: string,
  total: number,
  correct: number,
  checkpoint: boolean,
  passAccuracy = 0.8,
  now = new Date()
): CompletionResult {
  const safeTotal = Math.max(1, total);
  const accuracy = correct / safeTotal;
  const perfect = correct === total;
  const passed = !checkpoint || accuracy >= passAccuracy;
  const xpEarned = passed
    ? calculateLessonXp(total, perfect, checkpoint)
    : total * GAMIFICATION.xp.exercise;
  const streak = updateStreak(current.lastStudyDate, current.streak, current.bestStreak, now);

  return {
    xpEarned,
    accuracy,
    passed,
    progress: {
      ...current,
      xp: current.xp + xpEarned,
      streak: streak.streak,
      bestStreak: streak.bestStreak,
      lastStudyDate: streak.lastStudyDate,
      completedLessonIds: !checkpoint && passed
        ? appendUnique(current.completedLessonIds, activityId)
        : current.completedLessonIds,
      completedCheckpointIds: checkpoint && passed
        ? appendUnique(current.completedCheckpointIds, activityId)
        : current.completedCheckpointIds,
      perfectLessonIds: !checkpoint && perfect
        ? appendUnique(current.perfectLessonIds, activityId)
        : current.perfectLessonIds,
      activeLesson: undefined
    }
  };
}
