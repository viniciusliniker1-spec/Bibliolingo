/**
 * Resumo da semana: os últimos 7 dias (incluindo hoje) a partir do registro de atividade.
 */
import { toLocalDateKey } from "../../src/domain/streak";
import type { LumiMoodId } from "./lumiMood";

export interface ActivityDayLike { date: string; xp: number; seconds: number; lessons: number }

export interface WeeklyDay {
  date: string;
  /** Inicial do dia da semana, em português (D S T Q Q S S). */
  label: string;
  xp: number;
  active: boolean;
}

export interface WeeklySummary {
  days: WeeklyDay[];
  activeDays: number;
  xp: number;
  lessons: number;
  minutes: number;
  /** Variação do XP em relação aos 7 dias anteriores (undefined se não havia base). */
  xpChange?: number;
  bestDay?: WeeklyDay;
  mood: LumiMoodId;
  headline: string;
}

const LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function totals(activity: Record<string, ActivityDayLike>, end: Date) {
  const days: WeeklyDay[] = [];
  let lessons = 0;
  let seconds = 0;
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addDays(end, -offset);
    const key = toLocalDateKey(date);
    const day = activity[key];
    const xp = day?.xp ?? 0;
    lessons += day?.lessons ?? 0;
    seconds += day?.seconds ?? 0;
    days.push({ date: key, label: LABELS[date.getDay()], xp, active: xp > 0 || (day?.lessons ?? 0) > 0 });
  }
  return { days, lessons, seconds, xp: days.reduce((sum, day) => sum + day.xp, 0) };
}

export function moodForActiveDays(activeDays: number): LumiMoodId {
  if (activeDays >= 7) return "coroa";
  if (activeDays >= 5) return "trofeu";
  if (activeDays >= 3) return "progresso";
  if (activeDays >= 1) return "checklist";
  return "pedindo";
}

export function headlineFor(activeDays: number) {
  if (activeDays >= 7) return "Semana perfeita!";
  if (activeDays >= 5) return "Que semana constante!";
  if (activeDays >= 3) return "Bom ritmo, continue assim";
  if (activeDays >= 1) return "Um passo de cada vez";
  return "Vamos recomeçar juntos?";
}

export function weeklySummary(activity: Record<string, ActivityDayLike>, now = new Date()): WeeklySummary {
  const current = totals(activity, now);
  const previous = totals(activity, addDays(now, -7));
  const activeDays = current.days.filter((day) => day.active).length;
  const bestDay = current.days.reduce<WeeklyDay | undefined>((best, day) => (day.xp > (best?.xp ?? 0) ? day : best), undefined);
  return {
    days: current.days,
    activeDays,
    xp: current.xp,
    lessons: current.lessons,
    minutes: Math.round(current.seconds / 60),
    xpChange: previous.xp > 0 ? Math.round(((current.xp - previous.xp) / previous.xp) * 100) : undefined,
    bestDay,
    mood: moodForActiveDays(activeDays),
    headline: headlineFor(activeDays)
  };
}

export function weeklyCaption(summary: WeeklySummary, name?: string) {
  const who = name ? `${name.split(" ")[0]} estudou` : "Estudei";
  return `${who} a Bíblia em ${summary.activeDays} de 7 dias nesta semana: ${summary.lessons} ${summary.lessons === 1 ? "etapa" : "etapas"} e ${summary.xp.toLocaleString("pt-BR")} XP no Bibliolingo! 🐑📖`;
}
