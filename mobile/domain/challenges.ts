/**
 * Desafios no estilo dos apps de idiomas:
 *  - Desafio de ofensiva: o aluno se compromete com 7, 14, 30, 50 ou 100 dias seguidos.
 *  - Missões diárias: três por dia, sorteadas pela data e ajustadas à meta diária.
 *  - Desafio do mês: estudar em muitos dias do mês.
 * Tudo é calculado a partir do progresso (atividade e respostas), sem depender de servidor.
 */
import { toLocalDateKey } from "../../src/domain/streak";
import { stableHash } from "./lessonPlan";
import type { LumiMoodId } from "./lumiMood";

type Activity = Record<string, { xp?: number; lessons?: number; seconds?: number } | undefined>;
interface Attempt { correct: boolean; answeredAt: string; mode: string }
export interface ChallengeProgressInput { activity: Activity; attempts: readonly Attempt[]; dailyGoal: number }

const studied = (activity: Activity, key: string) => Boolean((activity[key]?.xp ?? 0) > 0 || (activity[key]?.lessons ?? 0) > 0);
const addDays = (key: string, days: number) => { const date = new Date(key + "T12:00:00"); date.setDate(date.getDate() + days); return toLocalDateKey(date); };

// ---------- Desafio de ofensiva ----------
export interface StreakChallengeTier { days: number; reward: number; title: string; mood: LumiMoodId }
export const STREAK_CHALLENGES: StreakChallengeTier[] = [
  { days: 7, reward: 50, title: "Uma semana firme", mood: "calendario" },
  { days: 14, reward: 120, title: "Duas semanas de fogo", mood: "progresso" },
  { days: 30, reward: 300, title: "Um mês com a Palavra", mood: "trofeu" },
  { days: 50, reward: 500, title: "Jubileu de constância", mood: "coroa" },
  { days: 100, reward: 1200, title: "Cem dias com a Palavra", mood: "amor" }
];

export interface StreakChallenge { days: number; startedOn: string }
export interface StreakChallengeStatus {
  tier: StreakChallengeTier;
  done: number;
  state: "active" | "completed" | "failed";
  /** Hoje ainda falta estudar para não perder o desafio. */
  dueToday: boolean;
  /** Dias do desafio (para a faixa de bolinhas). */
  days: { key: string; state: "done" | "missed" | "today" | "future" }[];
}

export function streakChallengeStatus(challenge: StreakChallenge, activity: Activity, today = new Date()): StreakChallengeStatus {
  const tier = STREAK_CHALLENGES.find((item) => item.days === challenge.days) ?? STREAK_CHALLENGES[0];
  const todayKey = toLocalDateKey(today);
  const days: StreakChallengeStatus["days"] = [];
  let done = 0;
  let state: StreakChallengeStatus["state"] = "active";
  for (let i = 0; i < tier.days; i += 1) {
    const key = addDays(challenge.startedOn, i);
    if (state === "failed") { days.push({ key, state: "future" }); continue; }
    if (studied(activity, key)) { done += 1; days.push({ key, state: "done" }); continue; }
    if (key < todayKey) { state = "failed"; days.push({ key, state: "missed" }); continue; }
    days.push({ key, state: key === todayKey ? "today" : "future" });
  }
  if (state !== "failed" && done >= tier.days) state = "completed";
  return { tier, done, state, dueToday: state === "active" && !studied(activity, todayKey), days };
}

/** Próximo nível sugerido depois de concluir um desafio. */
export function nextStreakTier(days: number) {
  return STREAK_CHALLENGES.find((item) => item.days > days);
}

// ---------- Missões diárias ----------
export interface Quest { id: string; title: string; icon: "star" | "book" | "check" | "refresh" | "memory" | "globe"; target: number; current: number; reward: number }

type QuestKind = { id: string; title: (target: number) => string; icon: Quest["icon"]; target: (goal: number) => number; measure: (input: ChallengeProgressInput, day: string) => number };

const attemptsOn = (attempts: readonly Attempt[], day: string) => attempts.filter((attempt) => toLocalDateKey(new Date(attempt.answeredAt)) === day);

const QUEST_POOL: QuestKind[] = [
  { id: "xp", title: (t) => `Ganhe ${t} XP`, icon: "star", target: (goal) => goal, measure: ({ activity }, day) => activity[day]?.xp ?? 0 },
  { id: "lessons", title: (t) => `Conclua ${t} lições`, icon: "book", target: () => 2, measure: ({ activity }, day) => activity[day]?.lessons ?? 0 },
  { id: "correct", title: (t) => `Acerte ${t} perguntas`, icon: "check", target: (goal) => (goal >= 150 ? 25 : 15), measure: ({ attempts }, day) => attemptsOn(attempts, day).filter((a) => a.correct).length },
  { id: "review", title: (t) => `Revise ${t} perguntas`, icon: "refresh", target: () => 5, measure: ({ attempts }, day) => attemptsOn(attempts, day).filter((a) => a.mode === "review").length },
  { id: "minutes", title: (t) => `Estude ${t} minutos`, icon: "memory", target: (goal) => (goal >= 150 ? 15 : 10), measure: ({ activity }, day) => Math.floor((activity[day]?.seconds ?? 0) / 60) },
  { id: "languages", title: (t) => `Responda ${t} em grego ou hebraico`, icon: "globe", target: () => 5, measure: ({ attempts }, day) => attemptsOn(attempts, day).filter((a) => a.mode === "greek" || a.mode === "hebrew").length }
];

export const QUEST_REWARD = 10;
export const ALL_QUESTS_BONUS = 20;

/** Três missões do dia: “ganhe XP” sempre, mais duas sorteadas pela data. */
export function dailyQuests(input: ChallengeProgressInput, today = new Date()): Quest[] {
  const day = toLocalDateKey(today);
  const others = QUEST_POOL.slice(1).map((kind) => ({ kind, key: stableHash(day + kind.id) })).sort((a, b) => a.key - b.key).slice(0, 2).map(({ kind }) => kind);
  return [QUEST_POOL[0], ...others].map((kind) => {
    const target = kind.target(Math.max(10, input.dailyGoal));
    return { id: `${day}:${kind.id}`, title: kind.title(target), icon: kind.icon, target, current: Math.min(target, kind.measure(input, day)), reward: QUEST_REWARD };
  });
}

// ---------- Desafio do mês ----------
export interface MonthlyChallenge { id: string; title: string; target: number; current: number; daysLeft: number; reward: number; mood: LumiMoodId }

const MONTH_THEMES: { title: string; mood: LumiMoodId }[] = [
  { title: "Janeiro de recomeços", mood: "ideia" }, { title: "Fevereiro na Palavra", mood: "escrevendo" },
  { title: "Março de raízes", mood: "lupa" }, { title: "Abril da ressurreição", mood: "pulo" },
  { title: "Maio de oração", mood: "pedindo" }, { title: "Junho de sabedoria", mood: "notebook" },
  { title: "Julho dos salmos", mood: "amor" }, { title: "Agosto das cartas", mood: "escrevendo" },
  { title: "Setembro da Bíblia", mood: "checklist" }, { title: "Outubro da Reforma", mood: "trofeu" },
  { title: "Novembro de gratidão", mood: "amor" }, { title: "Dezembro do Emanuel", mood: "coroa" }
];

export function monthlyChallenge({ activity }: Pick<ChallengeProgressInput, "activity">, today = new Date()): MonthlyChallenge {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let current = 0;
  for (let day = 1; day <= daysInMonth; day += 1) if (studied(activity, toLocalDateKey(new Date(year, month, day)))) current += 1;
  const theme = MONTH_THEMES[month];
  const target = 20;
  return { id: `${year}-${String(month + 1).padStart(2, "0")}`, title: theme.title, target, current: Math.min(target, current), daysLeft: daysInMonth - today.getDate(), reward: 300, mood: theme.mood };
}
