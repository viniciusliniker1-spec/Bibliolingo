import { z } from "zod";
import type { AppState } from "../types/progress";
import { migrateState } from "./migrations";

const profileSchema = z.object({
  onboarded: z.boolean(),
  name: z.string().optional(),
  goal: z.enum(["know-bible", "daily-habit", "deepen", "teach", "theology"]),
  dailyGoal: z.union([z.literal(50), z.literal(100), z.literal(150), z.literal(200)]),
  knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]).optional()
});

const annotationSchema = z.object({
  id: z.string(),
  translationId: z.string(),
  bookOsis: z.string(),
  bookName: z.string(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  note: z.string().max(10000),
  bookmarked: z.boolean(),
  updatedAt: z.string()
});

const stateSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8)]),
  contentVersion: z.number().int().positive(),
  profile: profileSchema,
  settings: z.object({
    heartsEnabled: z.boolean(),
    maxHearts: z.number().int().min(1).max(20),
    soundEnabled: z.boolean().optional(),
    hapticsEnabled: z.boolean().optional(),
    dailyReminderEnabled: z.boolean().optional(),
    dailyReminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    lastReminderDate: z.string().optional()
  }),
  xp: z.number().int().nonnegative(),
  hearts: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  lastStudyDate: z.string().optional(),
  completedLessonIds: z.array(z.string()),
  completedCheckpointIds: z.array(z.string()),
  perfectLessonIds: z.array(z.string()),
  attempts: z.array(
    z.object({
      id: z.string(),
      questionId: z.string(),
      lessonId: z.string(),
      conceptId: z.string().optional(),
      correct: z.boolean(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      answeredAt: z.string(),
      mode: z.enum(["lesson", "checkpoint", "review", "formation", "deepen", "greek"])
    })
  ),
  reviewItems: z.array(
    z.object({
      questionId: z.string(),
      conceptId: z.string(),
      dueDate: z.string(),
      intervalIndex: z.number().int().nonnegative(),
      lapses: z.number().int().nonnegative(),
      lastResult: z.enum(["correct", "incorrect"]),
      lastReviewedAt: z.string(),
      state: z.enum(["learning", "review", "relearning"]).optional(),
      stabilityDays: z.number().positive().optional(),
      difficultyScore: z.number().min(1).max(10).optional(),
      retrievability: z.number().min(0).max(1).optional(),
      repetitions: z.number().int().nonnegative().optional(),
      attempts: z.number().int().positive().optional(),
      scheduledDays: z.number().nonnegative().optional()
    })
  ),
  earnedAchievementIds: z.array(z.string()),
  activity: z.record(
    z.object({
      date: z.string(),
      xp: z.number().int().nonnegative(),
      seconds: z.number().int().nonnegative(),
      lessons: z.number().int().nonnegative()
    })
  ),
  activeSession: z
    .object({
      lessonId: z.string(),
      journeyMode: z.enum(["canonical", "individual"]).optional(),
      journeyBookId: z.string().optional(),
      stepIndex: z.number().int().nonnegative(),
      startedAt: z.string(),
      answers: z.record(z.boolean())
    })
    .optional(),
  promptsGenerated: z.record(z.number().int().nonnegative()),
  bibleLocation: z
    .object({
      translationId: z.string(),
      bookOsis: z.string(),
      chapter: z.number().int().positive(),
      verse: z.number().int().positive().optional()
    })
    .optional(),
  bibleAnnotations: z.record(annotationSchema).optional(),
  learnedGreekLexemeIds: z.array(z.string()).optional(),
  greekSkills: z.record(z.object({ correct: z.number().int().nonnegative(), incorrect: z.number().int().nonnegative(), lastPracticedAt: z.string() })).optional(),
  ignoredRecommendationIds: z.array(z.string()).optional(),
  recentRecommendationIds: z.array(z.string()).optional(),
  personalGoals: z.array(z.object({
    id:z.string(),title:z.string(),metric:z.enum(["minutes","lessons","reviews","checkpoints","chapters","concepts","units"]),
    cadence:z.enum(["daily","weekly"]),target:z.number().positive(),scope:z.enum(["all","reading","formation","greek","theology"]).optional(),
    active:z.boolean(),createdAt:z.string(),updatedAt:z.string()
  })).optional(),
  planEnrollments: z.array(z.object({
    id:z.string(),planId:z.string(),planVersion:z.number().int().positive(),title:z.string(),
    status:z.enum(["not-started","active","paused","completed","archived"]),startedOn:z.string(),targetEndDate:z.string(),
    studyWeekdays:z.array(z.number().int().min(0).max(6)),translationId:z.string(),
    stepsSnapshot:z.array(z.object({
      id:z.string(),order:z.number().int().nonnegative(),title:z.string(),
      activityKind:z.enum(["bible-reading","bible","formation","greek","deepen","review"]),
      estimatedMinutes:z.number().positive(),
      chapters:z.array(z.object({bookOsis:z.string(),chapter:z.number().int().positive()})).optional(),
      activityId:z.string().optional()
    })),createdAt:z.string(),updatedAt:z.string(),scheduleRevision:z.number().int().positive(),scheduleOverrides:z.record(z.string()).optional()
  })).optional(),
  planCompletionEvents: z.array(z.object({
    id:z.string(),enrollmentId:z.string(),stepId:z.string(),completed:z.boolean(),occurredAt:z.string(),localDate:z.string(),timezone:z.string()
  })).optional(),
  planChangeEvents: z.array(z.object({
    id:z.string(),enrollmentId:z.string(),kind:z.enum(["created","paused","resumed","archived","rescheduled","completed"]),occurredAt:z.string(),details:z.string().optional()
  })).optional(),
  missionAssignments: z.array(z.object({
    id:z.string(),definitionVersion:z.literal(1),cadence:z.enum(["daily","weekly","thematic","open"]),
    category:z.enum(["practice","reading","continuity","reinforcement","thematic"]),title:z.string(),description:z.string(),reason:z.string(),
    metric:z.enum(["questions","lessons","reviews","checkpoints","plan-steps","chapters","activity"]),target:z.number().int().positive(),
    baseline:z.number().int().nonnegative(),startAt:z.string(),startDate:z.string(),endDate:z.string().optional(),timezone:z.string(),
    reference:z.object({activityId:z.string().optional(),activityKind:z.enum(["bible","formation","greek","deepen","review"]).optional(),enrollmentId:z.string().optional(),conceptId:z.string().optional(),route:z.string()}),createdAt:z.string()
  })).optional(),
  missionEvents: z.array(z.object({
    id:z.string(),missionId:z.string(),kind:z.enum(["mission_started","mission_progressed","mission_completed","mission_expired","mission_cancelled"]),
    occurredAt:z.string(),observedProgress:z.number().int().nonnegative(),sourceEventIds:z.array(z.string())
  })).optional(),
  storageRevision: z.number().int().nonnegative()
});

const backupSchema = z.object({
  app: z.literal("Bibliolingo"),
  backupVersion: z.literal(1),
  exportedAt: z.string(),
  state: stateSchema
});

export function serializeBackup(state: AppState): string {
  return JSON.stringify(
    {
      app: "Bibliolingo",
      backupVersion: 1,
      exportedAt: new Date().toISOString(),
      state
    },
    null,
    2
  );
}

export function parseBackup(input: string): AppState {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("O arquivo não contém JSON válido.");
  }
  const parsed = backupSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Este backup não possui o formato esperado do Bibliolingo.");
  }
  const migrated = migrateState(parsed.data.state);
  if (!migrated) {
    throw new Error("A versão deste backup não é compatível.");
  }
  return migrated;
}
