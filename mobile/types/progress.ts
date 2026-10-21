export interface ActiveLessonSession {
  activityId: string;
  stepIndex: number;
  correct: number;
  incorrect: number;
  answeredQuestionIds: string[];
  answers: Record<string, boolean>;
  startedAt: string;
}

export interface MobileProgress {
  schemaVersion: 1;
  xp: number;
  streak: number;
  bestStreak: number;
  lastStudyDate?: string;
  completedLessonIds: string[];
  completedCheckpointIds: string[];
  perfectLessonIds: string[];
  incorrectQuestionIds: string[];
  activeLesson?: ActiveLessonSession;
}

export interface CompletionResult {
  progress: MobileProgress;
  xpEarned: number;
  accuracy: number;
  passed: boolean;
}
