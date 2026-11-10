import { toLocalDateKey } from "../../src/domain/streak";

export interface CalendarDay {
  key: string;
  day: number;
  inMonth: boolean;
  studied: boolean;
  goalMet: boolean;
  isToday: boolean;
  future: boolean;
  /** Dia estudado colado ao anterior/seguinte na mesma semana: forma a faixa da ofensiva. */
  joinLeft: boolean;
  joinRight: boolean;
  xp: number;
}

export interface MonthStats {
  studiedDays: number;
  goalDays: number;
  perfectWeeks: number;
  longestRun: number;
  xp: number;
}

type Activity = Record<string, { xp?: number; lessons?: number } | undefined>;

const studiedOn = (activity: Activity, key: string) => {
  const day = activity[key];
  return Boolean(day && ((day.xp ?? 0) > 0 || (day.lessons ?? 0) > 0));
};

/** Semanas (domingo a sábado) do mês, com os dias de borda dos meses vizinhos. */
export function buildMonth(year: number, month: number, activity: Activity, dailyGoal: number, today = new Date()): CalendarDay[][] {
  const todayKey = toLocalDateKey(today);
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const last = new Date(year, month + 1, 0);
  const totalDays = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
  const days: CalendarDay[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = toLocalDateKey(date);
    const xp = activity[key]?.xp ?? 0;
    days.push({
      key, day: date.getDate(), inMonth: date.getMonth() === month,
      studied: studiedOn(activity, key), goalMet: xp >= Math.max(1, dailyGoal),
      isToday: key === todayKey, future: key > todayKey,
      joinLeft: false, joinRight: false, xp
    });
  }
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  for (const week of weeks) {
    week.forEach((day, i) => {
      day.joinLeft = day.studied && i > 0 && week[i - 1].studied;
      day.joinRight = day.studied && i < 6 && week[i + 1].studied;
    });
  }
  return weeks;
}

export function monthStats(weeks: CalendarDay[][]): MonthStats {
  const days = weeks.flat().filter((day) => day.inMonth);
  let longestRun = 0;
  let run = 0;
  for (const day of days) {
    run = day.studied ? run + 1 : 0;
    longestRun = Math.max(longestRun, run);
  }
  return {
    studiedDays: days.filter((day) => day.studied).length,
    goalDays: days.filter((day) => day.goalMet).length,
    perfectWeeks: weeks.filter((week) => week.every((day) => day.studied)).length,
    longestRun,
    xp: days.reduce((sum, day) => sum + day.xp, 0)
  };
}

/** Os 7 dias da semana atual (domingo a sábado), para a faixa compacta. */
export function currentWeek(activity: Activity, dailyGoal: number, today = new Date()) {
  const weeks = buildMonth(today.getFullYear(), today.getMonth(), activity, dailyGoal, today);
  return weeks.find((week) => week.some((day) => day.isToday)) ?? weeks[0];
}

export const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];
export const MONTH_NAMES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
