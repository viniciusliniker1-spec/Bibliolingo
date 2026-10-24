import type { PersonalGoal, PlanChangeEvent, PlanCompletionEvent, PlanEnrollment } from "../domain/studyPlans";
import type { MissionAssignment, MissionEvent } from "../domain/missions";

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
  reduceMotionEnabled?: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  lastReminderDate?: string;
}

export type JourneyStudyMode = "canonical" | "individual";

export interface ActiveSession {
  lessonId: string;
  journeyMode?: JourneyStudyMode;
  journeyBookId?: string;
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
  mode: "lesson" | "checkpoint" | "review" | "formation" | "deepen" | "greek" | "hebrew";
}

export type ReviewMemoryState = "learning" | "review" | "relearning";

export interface ReviewItem {
  /** Questão representativa usada para montar a próxima prática do conceito. */
  questionId: string;
  /** Identificador pedagógico estável e explícito; é a chave real da memória. */
  conceptId: string;
  /** Data civil local em que a revisão volta a ficar disponível. */
  dueDate: string;
  /** Mantido para migração de backups anteriores ao modelo de memória. */
  intervalIndex: number;
  lapses: number;
  lastResult: "correct" | "incorrect";
  lastReviewedAt: string;
  state?: ReviewMemoryState;
  /** Estabilidade estimada da memória, em dias. */
  stabilityDays?: number;
  /** Dificuldade estimada do conceito em escala de 1 a 10. */
  difficultyScore?: number;
  /** Probabilidade estimada de retenção no instante da última atualização. */
  retrievability?: number;
  repetitions?: number;
  attempts?: number;
  scheduledDays?: number;
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
  schemaVersion: 8;
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
  ignoredRecommendationIds: string[];
  recentRecommendationIds: string[];
  personalGoals: PersonalGoal[];
  planEnrollments: PlanEnrollment[];
  planCompletionEvents: PlanCompletionEvent[];
  planChangeEvents: PlanChangeEvent[];
  missionAssignments: MissionAssignment[];
  missionEvents: MissionEvent[];
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
