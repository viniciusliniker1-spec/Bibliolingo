/**
 * Humor da Lumi pela ofensiva: ela fica mais feliz a cada dia seguido de estudo
 * e mais tristonha (e depois “brava”, de brincadeira) quando o aluno some.
 * Usado no widget, nas notificações, no calendário e nos desafios.
 */
import { toLocalDateKey } from "../../src/domain/streak";

export type LumiMoodId =
  | "brava" | "chorando" | "pedindo" | "chuva" | "sono" | "confusa"
  | "surpresa" | "ideia" | "lupa" | "escrevendo" | "notebook" | "checklist"
  | "progresso" | "calendario" | "trofeu" | "coroa" | "amor" | "pulo";

export interface StreakMoodInput {
  streak: number;
  lastStudyDate?: string;
  /** Fração da meta diária já cumprida hoje (0–1). */
  goalRatio?: number;
  now?: Date;
}

export interface StreakMood {
  mood: LumiMoodId;
  /** -4 (muito triste) … +5 (radiante). */
  level: number;
  /** Dias desde o último estudo (0 = hoje). */
  gap: number;
  label: string;
}

export function daysBetweenKeys(fromKey: string, toKey: string) {
  const from = new Date(fromKey + "T12:00:00");
  const to = new Date(toKey + "T12:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** Escada de alegria quando o aluno já estudou hoje (cresce com a ofensiva). */
export const HAPPY_LADDER: { from: number; mood: LumiMoodId; level: number; label: string }[] = [
  { from: 1, mood: "checklist", level: 1, label: "Lição do dia feita!" },
  { from: 3, mood: "progresso", level: 2, label: "Subindo todo dia" },
  { from: 7, mood: "calendario", level: 3, label: "Uma semana de fogo" },
  { from: 14, mood: "trofeu", level: 4, label: "Campeã da constância" },
  { from: 30, mood: "coroa", level: 5, label: "Realeza da ofensiva" },
  { from: 100, mood: "amor", level: 5, label: "100 dias com a Palavra" }
];

/** Escada de tristeza quando o aluno some. */
export const SAD_LADDER: { gap: number; mood: LumiMoodId; level: number; label: string }[] = [
  { gap: 1, mood: "pedindo", level: -1, label: "Esperando a lição de hoje" },
  { gap: 2, mood: "chuva", level: -2, label: "Dia nublado sem você" },
  { gap: 3, mood: "brava", level: -3, label: "Bravinha com o sumiço" },
  { gap: 5, mood: "chorando", level: -4, label: "Morrendo de saudade" }
];

export function lumiStreakMood({ streak, lastStudyDate, goalRatio = 0, now = new Date() }: StreakMoodInput): StreakMood {
  const today = toLocalDateKey(now);
  if (!lastStudyDate) return { mood: "ideia", level: 0, gap: Infinity, label: "Pronta para começar" };
  const gap = Math.max(0, daysBetweenKeys(lastStudyDate, today));
  if (gap === 0) {
    const step = [...HAPPY_LADDER].reverse().find((item) => streak >= item.from) ?? HAPPY_LADDER[0];
    // Meta batida no começo da ofensiva: pulinho de alegria.
    if (goalRatio >= 1 && step.level < 3) return { mood: "pulo", level: step.level + 1, gap, label: "Meta do dia batida!" };
    return { mood: step.mood, level: step.level, gap, label: step.label };
  }
  if (gap === 1) {
    const hour = now.getHours();
    // Ofensiva viva, mas ainda sem lição hoje: fica mais aflita conforme o dia passa.
    if (hour < 12) return { mood: "sono", level: 0, gap, label: "Acordando para a lição" };
    if (hour < 18) return { mood: "confusa", level: -1, gap, label: "Cadê a lição de hoje?" };
    return { mood: "pedindo", level: -1, gap, label: "A ofensiva acaba hoje" };
  }
  const step = [...SAD_LADDER].reverse().find((item) => gap >= item.gap)!;
  return { mood: step.mood, level: step.level, gap, label: step.label };
}
