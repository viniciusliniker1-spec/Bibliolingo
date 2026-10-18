import type { QuestionAttempt, ReviewItem } from "../types/progress";

export type SyncPlatform = "web" | "android" | "ios";
export type SyncEventType =
  | "answer.recorded"
  | "lesson.completed"
  | "checkpoint.completed"
  | "achievement.unlocked"
  | "profile.updated"
  | "active_session.updated"
  | "adaptive.preferences_updated"
  | "legacy.imported";

export interface SyncEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  eventId: string;
  deviceId: string;
  platform: SyncPlatform;
  eventType: SyncEventType;
  payload: TPayload;
  createdAt: string;
  localDate?: string;
  timezone?: string;
  attempts: number;
}

export interface SyncCursor {
  lastServerSequence: number;
  lastSyncedAt?: string;
}

export type SyncConnectionState =
  | "local-only"
  | "synced"
  | "syncing"
  | "offline"
  | "error";

export interface SyncMetadata {
  cursor: SyncCursor;
  pendingEvents: SyncEvent[];
  status: SyncConnectionState;
  lastError?: string;
}

export interface CommonProgressProjection {
  xp: number;
  streak: number;
  bestStreak: number;
  lastStudyDate?: string;
  completedLessonIds: string[];
  completedCheckpointIds: string[];
  perfectLessonIds: string[];
  earnedAchievementIds: string[];
  incorrectQuestionIds: string[];
}

export interface RemoteActiveSession {
  activityId: string;
  stepIndex: number;
  startedAt: string;
  answers: Record<string, boolean>;
}

export interface RemoteAnswerHistory {
  questionId: string;
  correct: boolean;
  answeredAt: string;
}

export interface RemoteProgressProjection {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string;
  completedLessonIds: string[];
  completedCheckpointIds: string[];
  earnedAchievementIds: string[];
  answerHistory?: RemoteAnswerHistory[];
  reviewItems?: ReviewItem[];
  adaptiveAttempts?: QuestionAttempt[];
  ignoredRecommendationIds?: string[];
  recentRecommendationIds?: string[];
  activeSession?: RemoteActiveSession;
}

export interface MergeSummary {
  merged: CommonProgressProjection;
  changed: boolean;
  localOnlyCount: number;
  remoteOnlyCount: number;
}

export interface MigrationChoice {
  kind: "keep-local" | "use-remote" | "merge";
  confirmedAt: string;
}
