/**
 * Devocional do dia: um texto novo por dia (gerado por IA e publicado como JSON), com reflexão,
 * aplicação, perguntas e oração. O texto do versículo NÃO vem do JSON: o app o lê da Bíblia local
 * a partir da referência, para nunca citar errado.
 */
import { toLocalDateKey, updateStreak } from "../../src/domain/streak";
import type { MobileProgress } from "../types/progress";

/** XP por devocional concluído. */
export const DEVOTIONAL_XP = 10;

export interface DevotionalVerse {
  /** Código OSIS do livro (ex.: "Titus"). */
  book: string;
  chapter: number;
  from: number;
  to: number;
}

export interface Devotional {
  /** Data local (YYYY-MM-DD) em que o devocional é o "de hoje". */
  date: string;
  title: string;
  verse: DevotionalVerse;
  /** Frase curta para destacar e compartilhar. */
  keyPhrase: string;
  reflection: string[];
  application: string;
  questions: string[];
  prayer: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const text = (value: unknown, min: number, max: number): value is string =>
  typeof value === "string" && value.trim().length >= min && value.trim().length <= max;

/** Valida e limpa um JSON desconhecido. Devolve undefined se algo estiver fora do formato. */
export function parseDevotional(value: unknown): Devotional | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const verse = raw.verse as Record<string, unknown> | undefined;
  if (typeof raw.date !== "string" || !DATE.test(raw.date)) return undefined;
  if (!text(raw.title, 3, 120) || !text(raw.keyPhrase, 3, 220) || !text(raw.application, 10, 700) || !text(raw.prayer, 10, 900)) return undefined;
  if (!verse || typeof verse.book !== "string" || !/^[A-Za-z0-9]{2,8}$/.test(verse.book)) return undefined;
  const { chapter, from, to } = verse as Record<string, unknown>;
  if (![chapter, from, to].every((n) => Number.isInteger(n) && (n as number) >= 1) || (to as number) < (from as number) || (to as number) - (from as number) > 12) return undefined;
  if (!Array.isArray(raw.reflection) || raw.reflection.length < 2 || raw.reflection.length > 6 || !raw.reflection.every((p) => text(p, 20, 900))) return undefined;
  if (!Array.isArray(raw.questions) || raw.questions.length < 1 || raw.questions.length > 4 || !raw.questions.every((q) => text(q, 8, 280))) return undefined;
  return {
    date: raw.date,
    title: raw.title.trim(),
    verse: { book: verse.book, chapter: chapter as number, from: from as number, to: to as number },
    keyPhrase: raw.keyPhrase.trim(),
    reflection: (raw.reflection as string[]).map((p) => p.trim()),
    application: raw.application.trim(),
    questions: (raw.questions as string[]).map((q) => q.trim()),
    prayer: raw.prayer.trim()
  };
}

/** Data local de hoje no formato do devocional. */
export const devotionalDateKey = (now = new Date()) => toLocalDateKey(now);

/** "Hoje" se houver, senão o mais recente já conhecido (para o app nunca ficar vazio). */
export function devotionalFor(date: string, known: Devotional[]): { devotional?: Devotional; isToday: boolean } {
  const exact = known.find((item) => item.date === date);
  if (exact) return { devotional: exact, isToday: true };
  const past = known.filter((item) => item.date < date).sort((a, b) => b.date.localeCompare(a.date))[0];
  return { devotional: past, isToday: false };
}

/** Une listas de devocionais por data (a última da lista vence). */
export function mergeDevotionals(...lists: Devotional[][]): Devotional[] {
  const byDate = new Map<string, Devotional>();
  for (const list of lists) for (const item of list) byDate.set(item.date, item);
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export interface DevotionalState {
  /** Datas (YYYY-MM-DD) já concluídas. */
  done: string[];
  /** Respostas às perguntas, por data. */
  answers: Record<string, string[]>;
}

export const emptyDevotionalState = (): DevotionalState => ({ done: [], answers: {} });

export function parseDevotionalState(value: unknown): DevotionalState {
  if (!value || typeof value !== "object") return emptyDevotionalState();
  const raw = value as Partial<DevotionalState>;
  const done = Array.isArray(raw.done) ? raw.done.filter((d): d is string => typeof d === "string" && DATE.test(d)) : [];
  const answers: Record<string, string[]> = {};
  if (raw.answers && typeof raw.answers === "object") {
    for (const [date, list] of Object.entries(raw.answers)) {
      if (DATE.test(date) && Array.isArray(list)) answers[date] = list.map((a) => (typeof a === "string" ? a.slice(0, 1200) : ""));
    }
  }
  return { done: [...new Set(done)].sort(), answers };
}

/** Marca como concluído (idempotente). */
export function markDevotionalDone(state: DevotionalState, date: string, answers?: string[]): DevotionalState {
  return {
    done: state.done.includes(date) ? state.done : [...state.done, date].sort(),
    answers: answers?.some((a) => a.trim()) ? { ...state.answers, [date]: answers } : state.answers
  };
}

/** Concede o XP e conta o dia de estudo na ofensiva (mesma regra do plano de leitura). */
export function awardDevotional(progress: MobileProgress, now = new Date()): MobileProgress {
  const streak = updateStreak(progress.lastStudyDate, progress.streak, progress.bestStreak, now);
  const date = toLocalDateKey(now);
  const day = progress.activity[date] ?? { date, xp: 0, seconds: 0, lessons: 0 };
  return {
    ...progress,
    ...streak,
    xp: progress.xp + DEVOTIONAL_XP,
    activity: { ...progress.activity, [date]: { ...day, xp: day.xp + DEVOTIONAL_XP } },
    storageRevision: progress.storageRevision + 1
  };
}

/** Quantos dias seguidos (terminando hoje ou ontem) o aluno concluiu o devocional. */
export function devotionalStreak(done: string[], today: string): number {
  const set = new Set(done);
  const step = (key: string, delta: number) => {
    const d = new Date(key + "T12:00:00");
    d.setDate(d.getDate() + delta);
    return toLocalDateKey(d);
  };
  let cursor = set.has(today) ? today : step(today, -1);
  let count = 0;
  while (set.has(cursor)) { count += 1; cursor = step(cursor, -1); }
  return count;
}
