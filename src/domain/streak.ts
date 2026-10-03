export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function serialDay(dateKey: string): number {
  const parts = dateKey.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return Number.NaN;
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86_400_000);
}

export function updateStreak(
  lastStudyDate: string | undefined,
  currentStreak: number,
  bestStreak: number,
  now = new Date()
) {
  const today = toLocalDateKey(now);
  if (!lastStudyDate) {
    return { lastStudyDate: today, streak: 1, bestStreak: Math.max(1, bestStreak) };
  }

  const difference = serialDay(today) - serialDay(lastStudyDate);
  if (difference <= 0) {
    return { lastStudyDate, streak: currentStreak, bestStreak };
  }

  const streak = difference === 1 ? currentStreak + 1 : 1;
  return {
    lastStudyDate: today,
    streak,
    bestStreak: Math.max(bestStreak, streak)
  };
}
