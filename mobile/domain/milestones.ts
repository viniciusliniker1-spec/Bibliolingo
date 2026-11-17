/** Marcos de ofensiva que viram cartão para compartilhar. */
import type { LumiMoodId } from "./lumiMood";

export const STREAK_MILESTONES = [7, 14, 30, 50, 100, 200, 365] as const;

export function reachedMilestones(streak: number): number[] {
  return STREAK_MILESTONES.filter((days) => streak >= days);
}

/** O maior marco já atingido que ainda não foi comemorado. */
export function pendingMilestone(streak: number, celebrated: readonly number[]): number | undefined {
  return reachedMilestones(streak).filter((days) => !celebrated.includes(days)).at(-1);
}

export function nextMilestone(streak: number): number | undefined {
  return STREAK_MILESTONES.find((days) => days > streak);
}

export function milestoneMood(days: number): LumiMoodId {
  if (days >= 100) return "amor";
  if (days >= 30) return "coroa";
  if (days >= 14) return "trofeu";
  return "calendario";
}

export function milestoneTitle(days: number) {
  if (days >= 365) return "Um ano com a Palavra!";
  if (days >= 100) return "100 dias com a Palavra!";
  if (days >= 30) return "Um mês inteiro de constância!";
  if (days >= 7) return days === 7 ? "Uma semana de fogo!" : `${days} dias seguidos!`;
  return `${days} dias seguidos!`;
}

export function milestoneCaption(days: number, name?: string) {
  const who = name ? `${name.split(" ")[0]} está` : "Estou";
  return `${who} há ${days} dias seguidos estudando a Bíblia no Bibliolingo! 🔥🐑 Venha estudar com a Lumi também.`;
}
