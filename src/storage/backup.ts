import { z } from "zod";
import type { AppState } from "../types/progress";
import { migrateState } from "./migrations";

const profileSchema = z.object({
  onboarded: z.boolean(),
  name: z.string().optional(),
  goal: z.enum(["know-bible", "daily-habit", "deepen", "teach", "theology"]),
  dailyGoal: z.union([z.literal(50), z.literal(100), z.literal(150), z.literal(200)])
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
  schemaVersion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  contentVersion: z.number().int().positive(),
  profile: profileSchema,
  settings: z.object({
    heartsEnabled: z.boolean(),
    maxHearts: z.number().int().min(1).max(20),
    soundEnabled: z.boolean().optional(),
    hapticsEnabled: z.boolean().optional(),
    dailyReminderEnabled: z.boolean().optional(),
    dailyReminderTime: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/).optional(),
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
      correct: z.boolean(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      answeredAt: z.string(),
      mode: z.enum(["lesson", "checkpoint", "review"])
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
      lastReviewedAt: z.string()
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
