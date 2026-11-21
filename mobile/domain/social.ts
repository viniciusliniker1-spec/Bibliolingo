/**
 * Social: ranking semanal real, amigos e perfis de outros alunos.
 * Aqui ficam só as regras puras (sem rede): modelos, @usuário, contagem da semana e textos.
 */
import { getLevelProgress } from "../../src/domain/gamification";

export type SocialScope = "global" | "friends";

export interface SocialMe { handle: string; visible: boolean; suspended: boolean }

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  handle: string;
  name: string;
  skinId: string;
  weeklyXp: number;
  totalXp: number;
  streak: number;
  isMe: boolean;
  isFollowing: boolean;
}

export interface Leaderboard { entries: LeaderboardEntry[]; weekEndsAt: Date }

export interface SocialDay { day: string; xp: number }

export interface SocialProfile {
  userId: string;
  handle: string;
  name: string;
  skinId: string;
  totalXp: number;
  streak: number;
  longestStreak: number;
  lessons: number;
  weekXp: number;
  weekRank?: number;
  days: SocialDay[];
  followers: number;
  following: number;
  isFollowing: boolean;
  isMe: boolean;
  joinedAt: string;
}

export interface SocialSearchResult { userId: string; handle: string; name: string; skinId: string; totalXp: number; isFollowing: boolean }

// ---------------------------------------------------------------- linhas do servidor

export interface LeaderboardRow {
  rank: number | string; user_id: string; handle: string; display_name: string; skin_id: string;
  weekly_xp: number | string; total_xp: number | string; current_streak: number;
  is_me: boolean; is_following: boolean; week_ends_at: string;
}

export interface ProfileRow {
  user_id: string; handle: string; display_name: string; skin_id: string;
  total_xp: number | string; current_streak: number; longest_streak: number; lessons_completed: number;
  week_xp: number | string; week_rank: number | string | null; days: SocialDay[] | null;
  followers: number | string; following: number | string; is_following: boolean; is_me: boolean; joined_at: string;
}

export interface SearchRow { user_id: string; handle: string; display_name: string; skin_id: string; total_xp: number | string; is_following: boolean }

export function toLeaderboard(rows: LeaderboardRow[]): Leaderboard {
  const entries = rows.map((row) => ({
    rank: Number(row.rank), userId: row.user_id, handle: row.handle, name: row.display_name || row.handle, skinId: row.skin_id,
    weeklyXp: Number(row.weekly_xp), totalXp: Number(row.total_xp), streak: row.current_streak,
    isMe: row.is_me, isFollowing: row.is_following
  } satisfies LeaderboardEntry));
  const end = rows[0]?.week_ends_at ? new Date(rows[0].week_ends_at) : nextWeekEnd();
  return { entries, weekEndsAt: Number.isNaN(end.getTime()) ? nextWeekEnd() : end };
}

export function toProfile(row: ProfileRow): SocialProfile {
  return {
    userId: row.user_id, handle: row.handle, name: row.display_name || row.handle, skinId: row.skin_id,
    totalXp: Number(row.total_xp), streak: row.current_streak, longestStreak: row.longest_streak, lessons: row.lessons_completed,
    weekXp: Number(row.week_xp), weekRank: row.week_rank === null || row.week_rank === undefined ? undefined : Number(row.week_rank),
    days: (row.days ?? []).map((day) => ({ day: day.day, xp: Number(day.xp) })),
    followers: Number(row.followers), following: Number(row.following),
    isFollowing: row.is_following, isMe: row.is_me, joinedAt: row.joined_at
  };
}

export function toSearchResult(row: SearchRow): SocialSearchResult {
  return { userId: row.user_id, handle: row.handle, name: row.display_name || row.handle, skinId: row.skin_id, totalXp: Number(row.total_xp), isFollowing: row.is_following };
}

// ---------------------------------------------------------------- @usuário

export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

/** Deixa só letras minúsculas sem acento, números e “_”, com até 20 caracteres. */
export function sanitizeHandle(input: string) {
  return input
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s.-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

export type HandleCheck = "ok" | "short" | "invalid";

export function checkHandle(input: string): HandleCheck {
  const handle = input.trim().toLowerCase();
  if (HANDLE_PATTERN.test(handle)) return "ok";
  return handle.length < 3 ? "short" : "invalid";
}

/** Sugere um @usuário a partir do que a conta já tem (usuário, nome ou e-mail). */
export function suggestHandle(...sources: (string | undefined)[]) {
  for (const source of sources) {
    const handle = sanitizeHandle((source ?? "").split("@")[0] ?? "");
    if (handle.length >= 3) return handle;
  }
  return "";
}

// ---------------------------------------------------------------- semana (Brasília, UTC-3)

const BRASILIA_OFFSET_MS = -3 * 3600_000;

/** Próxima segunda-feira, 00:00 em Brasília (o ranking zera nesse momento). */
export function nextWeekEnd(now = new Date()) {
  const local = new Date(now.getTime() + BRASILIA_OFFSET_MS);
  const day = local.getUTCDay(); // 0 = domingo
  const daysUntilMonday = ((8 - day) % 7) || 7;
  const mondayLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + daysUntilMonday);
  return new Date(mondayLocal - BRASILIA_OFFSET_MS);
}

export interface Countdown { label: string; ending: boolean; over: boolean }

export function weekCountdown(endsAt: Date, now = new Date()): Countdown {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return { label: "Semana encerrada", ending: true, over: true };
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days >= 1) return { label: `${days}d ${hours}h`, ending: false, over: false };
  if (hours >= 1) return { label: `${hours}h ${String(mins).padStart(2, "0")}min`, ending: hours < 6, over: false };
  return { label: `${Math.max(1, mins)} min`, ending: true, over: false };
}

// ---------------------------------------------------------------- posição

export function medalFor(rank: number): string | undefined {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : undefined;
}

export function levelOf(totalXp: number) {
  return getLevelProgress(totalXp).level;
}

export interface RankStatus { tone: "lead" | "chase" | "start" | "alone" | "far"; text: string }

/** Mensagem de incentivo: quanto falta para passar quem está à frente. */
export function rankStatus(entries: readonly LeaderboardEntry[], scope: SocialScope = "global"): RankStatus | undefined {
  const me = entries.find((entry) => entry.isMe);
  if (!me) return undefined;
  const others = entries.filter((entry) => !entry.isMe);
  if (!others.length) {
    return { tone: "alone", text: scope === "friends" ? "Siga amigos para disputar com eles." : "Você é o primeiro a entrar! Chame amigos para disputar com você." };
  }
  if (me.weeklyXp === 0) return { tone: "start", text: "Conclua uma lição para entrar na disputa desta semana." };
  if (me.rank === 1) {
    const second = others.find((entry) => entry.rank === 2);
    return { tone: "lead", text: second ? `Você lidera${scope === "friends" ? " entre os amigos" : ""}! ${me.weeklyXp - second.weeklyXp} XP à frente de @${second.handle}.` : "Você lidera a semana!" };
  }
  const ahead = entries.find((entry) => entry.rank === me.rank - 1);
  if (!ahead) return { tone: "far", text: `Você está em ${me.rank}º lugar. Continue estudando para subir!` };
  const missing = ahead.weeklyXp - me.weeklyXp + 1;
  return { tone: "chase", text: `Faltam ${Math.max(1, missing)} XP para passar @${ahead.handle}.` };
}

export function formatXp(value: number) {
  return value >= 10_000 ? `${(value / 1000).toFixed(value >= 100_000 ? 0 : 1).replace(".", ",")} mil` : String(Math.round(value));
}

// ---------------------------------------------------------------- erros

export class SocialError extends Error {
  constructor(public readonly code: string, message: string) { super(message); }
}

/** O servidor ainda não tem o ranking (migration não aplicada). */
export class SocialUnavailableError extends Error {}

const MESSAGES: Record<string, string> = {
  "invalid-handle": "Use de 3 a 20 letras minúsculas, números ou “_”.",
  "handle-taken": "Este @usuário já está em uso. Escolha outro.",
  "handle-reserved": "Este @usuário não pode ser usado. Escolha outro.",
  "join-required": "Entre no ranking para seguir outros alunos.",
  "user-not-found": "Este aluno não está mais disponível.",
  "follow-limit": "Você chegou ao limite de 300 pessoas seguidas.",
  "invalid-follow": "Não é possível seguir a si mesmo.",
  "invalid-report": "Descreva rapidamente o motivo da denúncia.",
  "authentication-required": "Entre na sua conta para usar o ranking."
};

export function socialErrorMessage(error: unknown) {
  if (error instanceof SocialError) return MESSAGES[error.code] ?? "Não foi possível concluir agora. Tente de novo.";
  return "Sem conexão agora. Confira a internet e tente de novo.";
}
