import { describe, expect, it } from "vitest";
import {
  checkHandle, formatXp, medalFor, nextWeekEnd, rankStatus, sanitizeHandle, socialErrorMessage, SocialError,
  suggestHandle, toLeaderboard, toProfile, weekCountdown, type LeaderboardEntry, type LeaderboardRow
} from "./social";

const entry = (rank: number, handle: string, weeklyXp: number, isMe = false): LeaderboardEntry => ({
  rank, userId: handle, handle, name: handle, skinId: "lumi_base", weeklyXp, totalXp: 100, streak: 0, isMe, isFollowing: false
});

describe("@usuário", () => {
  it("limpa acentos, espaços e símbolos", () => {
    expect(sanitizeHandle("João da Silva!")).toBe("joao_da_silva");
    expect(sanitizeHandle("Ana.Souza-99")).toBe("ana_souza_99");
    expect(sanitizeHandle("x".repeat(40))).toHaveLength(20);
  });
  it("valida como o servidor", () => {
    expect(checkHandle("ana_souza")).toBe("ok");
    expect(checkHandle("ab")).toBe("short");
    expect(checkHandle("Ana Souza")).toBe("invalid");
    expect(checkHandle("é_valido")).toBe("invalid");
  });
  it("sugere a partir do que a conta tem, pulando fontes curtas", () => {
    expect(suggestHandle(undefined, "Maria Clara", "maria@x.com")).toBe("maria_clara");
    expect(suggestHandle("ab", undefined, "pedro.lima@gmail.com")).toBe("pedro_lima");
    expect(suggestHandle(undefined, "", undefined)).toBe("");
  });
});

describe("semana (Brasília)", () => {
  it("o ranking zera na próxima segunda às 00:00 de Brasília (03:00 UTC)", () => {
    // quinta-feira, 5 de novembro de 2026, 15:00 UTC
    expect(nextWeekEnd(new Date("2026-11-05T15:00:00Z")).toISOString()).toBe("2026-11-09T03:00:00.000Z");
    // domingo à noite em Brasília ainda é a mesma semana
    expect(nextWeekEnd(new Date("2026-11-09T01:00:00Z")).toISOString()).toBe("2026-11-09T03:00:00.000Z");
    // segunda 00:30 em Brasília já começa a próxima
    expect(nextWeekEnd(new Date("2026-11-09T03:30:00Z")).toISOString()).toBe("2026-11-16T03:00:00.000Z");
  });
  it("conta o tempo restante", () => {
    const end = new Date("2026-11-09T03:00:00Z");
    expect(weekCountdown(end, new Date("2026-11-05T22:00:00Z"))).toMatchObject({ label: "3d 5h", ending: false });
    expect(weekCountdown(end, new Date("2026-11-08T22:30:00Z"))).toMatchObject({ label: "4h 30min", ending: true });
    expect(weekCountdown(end, new Date("2026-11-09T02:40:00Z"))).toMatchObject({ label: "20 min", ending: true });
    expect(weekCountdown(end, new Date("2026-11-09T03:00:01Z"))).toMatchObject({ over: true });
  });
});

describe("posição", () => {
  it("medalhas só para o pódio", () => {
    expect([1, 2, 3, 4].map(medalFor)).toEqual(["🥇", "🥈", "🥉", undefined]);
  });
  it("diz quanto falta para passar quem está à frente", () => {
    const board = [entry(1, "ana", 200), entry(2, "bia", 150), entry(3, "eu", 120, true)];
    expect(rankStatus(board)).toEqual({ tone: "chase", text: "Faltam 31 XP para passar @bia." });
  });
  it("comemora a liderança com a vantagem", () => {
    expect(rankStatus([entry(1, "eu", 200, true), entry(2, "bia", 150)])).toEqual({ tone: "lead", text: "Você lidera! 50 XP à frente de @bia." });
  });
  it("incentiva quem ainda não pontuou e quem está sozinho", () => {
    expect(rankStatus([entry(1, "ana", 90), entry(2, "eu", 0, true)])?.tone).toBe("start");
    expect(rankStatus([entry(1, "eu", 10, true)])?.tone).toBe("alone");
    expect(rankStatus([entry(1, "eu", 10, true)], "friends")?.text).toBe("Siga amigos para disputar com eles.");
    expect(rankStatus([entry(1, "eu", 200, true), entry(2, "bia", 150)], "friends")?.text).toContain("entre os amigos");
    expect(rankStatus([entry(1, "ana", 90)])).toBeUndefined();
  });
  it("não inventa quem está à frente quando a minha linha vem fora do topo", () => {
    expect(rankStatus([entry(1, "ana", 500), entry(80, "eu", 5, true)])?.tone).toBe("far");
  });
  it("formata XP grande", () => {
    expect([950, 12_400, 150_000].map(formatXp)).toEqual(["950", "12,4 mil", "150 mil"]);
  });
});

describe("dados do servidor", () => {
  it("converte linhas (bigint chega como texto ou número)", () => {
    const row: LeaderboardRow = {
      rank: "2", user_id: "u1", handle: "ana", display_name: "", skin_id: "lumi_oculos", weekly_xp: "80", total_xp: 1200,
      current_streak: 3, is_me: false, is_following: true, week_ends_at: "2026-11-09T03:00:00+00:00"
    };
    const board = toLeaderboard([row]);
    expect(board.entries[0]).toMatchObject({ rank: 2, name: "ana", weeklyXp: 80, totalXp: 1200, isFollowing: true });
    expect(board.weekEndsAt.toISOString()).toBe("2026-11-09T03:00:00.000Z");
  });
  it("perfil sem posição na semana", () => {
    const profile = toProfile({
      user_id: "u1", handle: "ana", display_name: "Ana", skin_id: "lumi_base", total_xp: "50", current_streak: 0, longest_streak: 2,
      lessons_completed: 1, week_xp: 0, week_rank: null, days: [{ day: "2026-11-05", xp: "40" as unknown as number }],
      followers: "3", following: 1, is_following: false, is_me: false, joined_at: "2026-11-01T00:00:00Z"
    });
    expect(profile.weekRank).toBeUndefined();
    expect(profile.days[0].xp).toBe(40);
    expect(profile.followers).toBe(3);
  });
  it("mensagens de erro amigáveis", () => {
    expect(socialErrorMessage(new SocialError("handle-taken", "handle-taken"))).toMatch(/já está em uso/);
    expect(socialErrorMessage(new TypeError("Network request failed"))).toMatch(/Sem conexão/);
  });
});
