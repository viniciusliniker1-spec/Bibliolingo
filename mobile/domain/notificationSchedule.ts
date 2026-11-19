import { chooseStudyNotification, isQuietTime, type StudyNotificationCandidate, type StudyNotificationPreferences } from "../../src/services/notificationPolicy";
import { lumiReminder, shiftTime, type LumiReminderKind } from "./lumiNotifications";
import { activeEnrollments, stepLabel, todayReading } from "./readingPlans";
import { getReviewQueue } from "../../src/domain/review";
import { toLocalDateKey } from "../../src/domain/streak";
import { daysBetweenKeys } from "./lumiMood";
import type { MobileProgress } from "../types/progress";

function scheduledDate(dayOffset: number, time: string, now: Date) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(Number.isFinite(hour) ? hour : 19, Number.isFinite(minute) ? minute : 0, 0, 0);
  return date;
}

export function nextMobileStudyReminder(
  progress: MobileProgress,
  preferences: StudyNotificationPreferences,
  now = new Date()
): { date: Date; candidate: StudyNotificationCandidate } | undefined {
  for (let offset = 0; offset < 14; offset += 1) {
    const date = scheduledDate(offset, preferences.time, now);
    if (date.getTime() <= now.getTime() + 60_000) continue;
    const dateKey = toLocalDateKey(date);
    const studied = progress.lastStudyDate === dateKey;
    const candidate = chooseStudyNotification({
      preferences,
      now: date,
      todayXp: studied ? progress.profile.dailyGoal : 0,
      dailyGoal: progress.profile.dailyGoal,
      studiedToday: studied,
      streak: progress.streak,
      lastStudyDate: progress.lastStudyDate,
      reviewCount: getReviewQueue(progress.reviewItems, date).length
    });
    if (candidate) return { date, candidate };
  }
  return undefined;
}

export interface PlannedReminder {
  date: Date;
  category: StudyNotificationCandidate["category"];
  kind: LumiReminderKind;
  title: string;
  body: string;
  route: "/(tabs)" | "/(tabs)/review" | "/plans" | "/devotional";
}

export interface ReminderContext { name?: string; nextLessonTitle?: string; /** Datas (AAAA-MM-DD) em que o devocional já foi concluído. */ devotionalDone?: string[] }

const RISK_TIME = "21:00";

function minutesOf(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

/**
 * Plano de lembretes da Lumi para os próximos dias: no máximo um por dia no
 * horário escolhido (com textos que variam) e, hoje, um aviso noturno se a
 * sequência estiver em risco. Ao estudar, o app replaneja tudo.
 */
export function planMobileReminders(
  progress: MobileProgress,
  preferences: StudyNotificationPreferences,
  now = new Date(),
  context: ReminderContext = {},
  days = 6
): PlannedReminder[] {
  if (!preferences.enabled) return [];
  const plan: PlannedReminder[] = [];
  const todayKey = toLocalDateKey(now);
  const studiedToday = progress.lastStudyDate === todayKey;
  const vars = (streak: number, reviews: number) => ({ nome: context.name?.split(" ")[0], dias: streak, revisoes: reviews, licao: context.nextLessonTitle });

  for (let offset = 0; offset < days; offset += 1) {
    const date = scheduledDate(offset, preferences.time, now);
    if (date.getTime() <= now.getTime() + 60_000) continue;
    const dateKey = toLocalDateKey(date);
    const yesterday = scheduledDate(offset - 1, preferences.time, now);
    // A sequência só vale no dia se o último estudo foi na véspera.
    const streak = progress.lastStudyDate === toLocalDateKey(yesterday) ? progress.streak : 0;
    const studied = progress.lastStudyDate === dateKey;
    const reviews = getReviewQueue(progress.reviewItems, date).length;
    const candidate = chooseStudyNotification({
      preferences: offset === 0 ? preferences : { ...preferences, lastSent: {} },
      now: date,
      todayXp: studied ? progress.profile.dailyGoal : 0,
      dailyGoal: progress.profile.dailyGoal,
      studiedToday: studied,
      streak,
      lastStudyDate: progress.lastStudyDate,
      reviewCount: reviews
    });
    if (!candidate) continue;
    // Mesma escada do ícone do app: nublada (2 dias), cada vez mais triste (3–7) e, de brincadeira, brava (8+).
    const gap = progress.lastStudyDate ? daysBetweenKeys(progress.lastStudyDate, dateKey) : 0;
    const moodKind: LumiReminderKind | undefined = candidate.category === "review" ? undefined : gap >= 8 ? "grumpy" : gap >= 3 ? "crying" : gap === 2 ? "missed" : undefined;
    const kind: LumiReminderKind = moodKind ?? (candidate.category === "daily" && minutesOf(preferences.time) < 11 * 60 ? "morning" : candidate.category);
    const copy = lumiReminder(kind, dateKey, vars(streak, reviews));
    plan.push({ date, category: candidate.category, kind, ...copy, route: candidate.category === "review" ? "/(tabs)/review" : "/(tabs)" });
  }

  plan.push(...planReadingReminders(progress, preferences, now, context, days));
  plan.push(...devotionalReminders(preferences, now, context, days));

  // Hoje à noite: a sequência acaba à meia-noite se ninguém estudar.
  const riskDate = scheduledDate(0, RISK_TIME, now);
  const streakAlive = progress.streak > 0 && progress.lastStudyDate === toLocalDateKey(scheduledDate(-1, RISK_TIME, now));
  if (preferences.streak && streakAlive && !studiedToday
    && riskDate.getTime() > now.getTime() + 60_000
    && minutesOf(RISK_TIME) > minutesOf(preferences.time) + 60
    && !isQuietTime(riskDate, preferences.quietStart, preferences.quietEnd)) {
    plan.push({ date: riskDate, category: "streak", kind: "streakRisk", ...lumiReminder("streakRisk", todayKey, vars(progress.streak, 0)), route: "/(tabs)" });
  }
  return plan.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Quantos minutos depois do lembrete de estudo o lembrete da leitura chega (para não vir junto). */
export const READING_REMINDER_OFFSET_MIN = 45;

/**
 * Um lembrete por dia para cada plano de leitura ativo, com o trecho do dia (“João 3”).
 * Segue a ordem das etapas: hoje a próxima ainda não lida, nos dias seguintes as que vêm depois.
 * Não agenda hoje se a leitura de hoje já foi feita, nem dentro do horário silencioso.
 */
export function planReadingReminders(
  progress: MobileProgress,
  preferences: StudyNotificationPreferences,
  now: Date,
  context: ReminderContext,
  days: number
): PlannedReminder[] {
  const reminders: PlannedReminder[] = [];
  const time = shiftTime(preferences.time, READING_REMINDER_OFFSET_MIN);
  for (const enrollment of activeEnrollments(progress)) {
    const next = todayReading(progress, enrollment, toLocalDateKey(now));
    if (!next) continue;
    const steps = enrollment.stepsSnapshot;
    const start = steps.findIndex((step) => step.id === next.step.id);
    const total = steps.length;
    for (let offset = 0; offset < days; offset += 1) {
      if (offset === 0 && next.completedToday) continue;
      const index = start + offset - (next.completedToday ? 1 : 0);
      const step = steps[index];
      if (!step) break;
      const date = scheduledDate(offset, time, now);
      if (date.getTime() <= now.getTime() + 60_000 || isQuietTime(date, preferences.quietStart, preferences.quietEnd)) continue;
      const kind: LumiReminderKind = index === total - 1 ? "planLast" : "plan";
      const copy = lumiReminder(kind, `${enrollment.id}-${index}`, {
        nome: context.name?.split(" ")[0], trecho: stepLabel(step), plano: enrollment.title, dia: index + 1, total, min: step.estimatedMinutes
      });
      reminders.push({ date, category: "daily", kind, ...copy, route: "/plans" });
    }
  }
  return reminders;
}

/** Horário do lembrete do devocional: manhã tranquila, fora do silêncio e longe do lembrete de estudo. */
export const DEVOTIONAL_REMINDER_TIME = "08:30";

/**
 * Um lembrete por dia para o devocional (junto da opção "Lembrete diário"). Não agenda se o de
 * hoje já foi concluído nem dentro do horário silencioso.
 */
export function devotionalReminders(
  preferences: StudyNotificationPreferences,
  now: Date,
  context: ReminderContext,
  days: number
): PlannedReminder[] {
  if (!preferences.enabled || !preferences.daily) return [];
  const reminders: PlannedReminder[] = [];
  const studyMinutes = minutesOf(preferences.time);
  // Se o horário de estudo cair em cima, o devocional vai 45 minutos antes.
  const time = Math.abs(studyMinutes - minutesOf(DEVOTIONAL_REMINDER_TIME)) < 30 ? shiftTime(preferences.time, -45) : DEVOTIONAL_REMINDER_TIME;
  for (let offset = 0; offset < days; offset += 1) {
    const date = scheduledDate(offset, time, now);
    if (date.getTime() <= now.getTime() + 60_000 || isQuietTime(date, preferences.quietStart, preferences.quietEnd)) continue;
    const dateKey = toLocalDateKey(date);
    if (context.devotionalDone?.includes(dateKey)) continue;
    const copy = lumiReminder("devotional", dateKey, { nome: context.name?.split(" ")[0] });
    reminders.push({ date, category: "daily", kind: "devotional", ...copy, route: "/devotional" });
  }
  return reminders;
}
