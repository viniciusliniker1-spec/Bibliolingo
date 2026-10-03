import { CONTENT_VERSION, GAMIFICATION } from "../config/gamification";
import type { AppState } from "../types/progress";

export const initialState: AppState = {
  schemaVersion: 1,
  contentVersion: CONTENT_VERSION,
  profile: { onboarded: false, goal: "daily-habit", dailyGoal: 100 },
  settings: { heartsEnabled: true, maxHearts: GAMIFICATION.hearts.initial },
  xp: 0,
  hearts: GAMIFICATION.hearts.initial,
  streak: 0,
  bestStreak: 0,
  completedLessonIds: [],
  completedCheckpointIds: [],
  perfectLessonIds: [],
  attempts: [],
  reviewItems: [],
  earnedAchievementIds: [],
  activity: {},
  promptsGenerated: {},
  storageRevision: 0
};
