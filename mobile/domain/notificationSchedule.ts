import { chooseStudyNotification, type StudyNotificationCandidate, type StudyNotificationPreferences } from "../../src/services/notificationPolicy";
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
