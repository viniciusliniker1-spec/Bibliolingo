/**
 * Widget da Lumi (tela inicial do Android): o humor dela muda conforme o dia,
 * como um bichinho que torce por você.
 */
import { toLocalDateKey } from "../../src/domain/streak";
import { lumiStreakMood, type LumiMoodId } from "./lumiMood";

export interface WidgetSnapshot {
  name?: string;
  streak: number;
  lastStudyDate?: string;
  /** XP por dia (somente os últimos dias). */
  xpByDay: Record<string, number>;
  dailyGoal: number;
  nextLessonTitle?: string;
  updatedAt: string;
}

export type WidgetMood = "proud" | "risk" | "sleepy" | "morning" | "invite" | "goal";

export interface WidgetView {
  mood: WidgetMood;
  title: string;
  message: string;
  streak: number;
  studiedToday: boolean;
  xpToday: number;
  dailyGoal: number;
  goalRatio: number;
  /** Pose da Lumi: mais feliz com a ofensiva, mais triste sem estudo. */
  lumi: LumiMoodId;
  /** -4 … +5 */
  happiness: number;
}

function daysBetween(fromKey: string, toKey: string) {
  const from = new Date(fromKey + "T12:00:00");
  const to = new Date(toKey + "T12:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function widgetView(snapshot: WidgetSnapshot, now = new Date()): WidgetView {
  const today = toLocalDateKey(now);
  const studiedToday = snapshot.lastStudyDate === today;
  const gap = snapshot.lastStudyDate ? daysBetween(snapshot.lastStudyDate, today) : Infinity;
  // A sequência só continua valendo se o último estudo foi hoje ou ontem.
  const streak = gap <= 1 ? snapshot.streak : 0;
  const xpToday = snapshot.xpByDay[today] ?? 0;
  const goal = Math.max(1, snapshot.dailyGoal);
  const goalRatio = Math.min(1, xpToday / goal);
  const hour = now.getHours();
  const name = snapshot.name?.split(" ")[0];
  const lesson = snapshot.nextLessonTitle ? `“${snapshot.nextLessonTitle}”` : "a próxima lição";
  const feeling = lumiStreakMood({ streak: snapshot.streak, lastStudyDate: snapshot.lastStudyDate, goalRatio, now });
  const base = { streak, studiedToday, xpToday, dailyGoal: goal, goalRatio, lumi: feeling.mood, happiness: feeling.level };

  if (studiedToday && goalRatio >= 1) return { ...base, mood: "goal", title: "Meta batida! 🎉", message: name ? `Que orgulho, ${name}! Até amanhã.` : "Que orgulho! Até amanhã." };
  if (studiedToday) return { ...base, mood: "proud", title: streak > 1 ? `${streak} dias seguidos!` : "Estudou hoje!", message: `Faltam ${goal - xpToday} XP para a meta.` };
  if (snapshot.lastStudyDate && gap >= 5) return { ...base, mood: "sleepy", title: "Tô com muita saudade 😭", message: "Uma lição curtinha e eu paro de chorar!" };
  if (snapshot.lastStudyDate && gap >= 3) return { ...base, mood: "sleepy", title: `${gap} dias sem você? 😤`, message: "Tô bravinha… mas uma lição resolve!" };
  if (snapshot.lastStudyDate && gap === 2) return { ...base, mood: "sleepy", title: "Dia nublado por aqui 🌧️", message: "Sua ofensiva apagou. Recomeça comigo?" };
  if (streak > 0 && hour >= 18) return { ...base, mood: "risk", title: `Sua sequência de ${streak} ${streak === 1 ? "dia" : "dias"} acaba hoje!`, message: "Ainda dá tempo. Bora?" };
  if (hour < 12) return { ...base, mood: "morning", title: name ? `Bom dia, ${name}!` : "Bom dia!", message: `Que tal ${lesson} com o café?` };
  return { ...base, mood: "invite", title: streak > 0 ? `🔥 ${streak} ${streak === 1 ? "dia" : "dias"}` : "Vamos estudar?", message: `${lesson[0].toUpperCase()}${lesson.slice(1)} está te esperando.` };
}

/** Guarda só os últimos 3 dias de XP para o widget. */
export function compactXpByDay(activity: Record<string, { xp?: number } | undefined>, now = new Date()) {
  const result: Record<string, number> = {};
  for (let offset = 0; offset < 3; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    const key = toLocalDateKey(date);
    const xp = activity[key]?.xp;
    if (xp) result[key] = xp;
  }
  return result;
}
