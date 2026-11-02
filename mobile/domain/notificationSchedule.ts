import { chooseStudyNotification, isQuietTime, type StudyNotificationCandidate, type StudyNotificationPreferences } from "../../src/services/notificationPolicy";
import { lumiReminder, type LumiReminderKind } from "./lumiNotifications";
import { getReviewQueue } from "../../src/domain/review";
import { toLocalDateKey } from "../../src/domain/streak";
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
  route: "/(tabs)" | "/(tabs)/review";
}

export interface ReminderContext { name?: string; nextLessonTitle?: string }

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
  days = 4
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
    const kind: LumiReminderKind = candidate.category === "daily" && minutesOf(preferences.time) < 11 * 60 ? "morning" : candidate.category;
    const copy = lumiReminder(kind, dateKey, vars(streak, reviews));
    plan.push({ date, category: candidate.category, kind, ...copy, route: candidate.category === "review" ? "/(tabs)/review" : "/(tabs)" });
  }

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
