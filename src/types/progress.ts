export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export type StudyGoal =
  | "know-bible"
  | "daily-habit"
  | "deepen"
  | "teach"
  | "theology";

export interface UserProfile {
  onboarded: boolean;
  name?: string;
  goal: StudyGoal;
  dailyGoal: 50 | 100 | 150 | 200;
  knowledgeLevel: KnowledgeLevel;
}

export interface UserSettings {
  heartsEnabled: boolean;
  maxHearts: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  lastReminderDate?: string;
}

export interface ActiveSession {
  lessonId: string;
  stepIndex: number;
  startedAt: string;
  answers: Record<string, boolean>;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  lessonId: string;
  conceptId?: string;
  correct: boolean;
  difficulty: "easy" | "medium" | "hard";
  answeredAt: string;
  mode: "lesson" | "checkpoint" | "review" | "formation" | "deepen" | "greek";
}

export interface ReviewItem {
  questionId: string;
  conceptId: string;
  dueDate: string;
  intervalIndex: number;
  lapses: number;
  lastResult: "correct" | "incorrect";
  lastReviewedAt: string;
}

export interface ActivityDay {
  date: string;
  xp: number;
  seconds: number;
  lessons: number;
}

export interface BibleLocation {
  translationId: string;
  bookOsis: string;
  chapter: number;
  verse?: number;
}

export interface BibleAnnotation {
  id: string;
  translationId: string;
  bookOsis: string;
  bookName: string;
  chapter: number;
  verse: number;
  note: string;
  bookmarked: boolean;
  updatedAt: string;
}

export interface GreekSkillProgress {
  correct: number;
  incorrect: number;
  lastPracticedAt: string;
}

export interface AppState {
  schemaVersion: 7;
  contentVersion: number;
  profile: UserProfile;
  settings: UserSettings;
  xp: number;
  hearts: number;
  streak: number;
  bestStreak: number;
  lastStudyDate?: string;
  completedLessonIds: string[];
  completedCheckpointIds: string[];
  perfectLessonIds: string[];
  attempts: QuestionAttempt[];
  reviewItems: ReviewItem[];
  earnedAchievementIds: string[];
  activity: Record<string, ActivityDay>;
  activeSession?: ActiveSession;
  promptsGenerated: Record<string, number>;
  bibleLocation?: BibleLocation;
  bibleAnnotations: Record<string, BibleAnnotation>;
  learnedGreekLexemeIds: string[];
  greekSkills: Record<string, GreekSkillProgress>;
  storageRevision: number;
}

export interface LessonSummary {
  lessonId: string;
  accuracy: number;
  correct: number;
  total: number;
  xpEarned: number;
  durationSeconds: number;
  isCheckpoint: boolean;
  masteredConceptIds: string[];
  reviewConceptIds: string[];
}
