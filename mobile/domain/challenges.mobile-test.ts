import { describe, expect, it } from "vitest";
import { dailyQuests, monthlyChallenge, nextStreakTier, streakChallengeStatus } from "./challenges";

const day = (key: string, xp = 30) => ({ [key]: { xp, lessons: 1, seconds: 600 } });

describe("desafio de ofensiva", () => {
  const today = new Date("2026-11-05T15:00:00");
  it("conta dias seguidos desde o início e pede o de hoje", () => {
    const status = streakChallengeStatus({ days: 7, startedOn: "2026-11-03" }, { ...day("2026-11-03"), ...day("2026-11-04") }, today);
    expect(status.state).toBe("active");
    expect(status.done).toBe(2);
    expect(status.dueToday).toBe(true);
    expect(status.days.map((d) => d.state).slice(0, 4)).toEqual(["done", "done", "today", "future"]);
  });
  it("falha se um dia passado ficou sem estudo", () => {
    const status = streakChallengeStatus({ days: 7, startedOn: "2026-11-02" }, { ...day("2026-11-02"), ...day("2026-11-04") }, today);
    expect(status.state).toBe("failed");
  });
  it("conclui ao completar os dias e sugere o próximo nível", () => {
    const activity = Object.assign({}, ...["01", "02", "03", "04", "05", "06", "07"].map((d) => day(`2026-11-${d}`)));
    const status = streakChallengeStatus({ days: 7, startedOn: "2026-11-01" }, activity, new Date("2026-11-07T20:00:00"));
    expect(status.state).toBe("completed");
    expect(nextStreakTier(7)?.days).toBe(14);
  });
});

describe("missões diárias", () => {
  it("são três, estáveis no dia e medem o progresso", () => {
    const today = new Date("2026-11-05T15:00:00");
    const input = { activity: day("2026-11-05", 40), attempts: [{ correct: true, answeredAt: "2026-11-05T14:00:00", mode: "review" }], dailyGoal: 50 };
    const quests = dailyQuests(input, today);
    expect(quests).toHaveLength(3);
    expect(quests[0]).toMatchObject({ title: "Ganhe 50 XP", current: 40, target: 50 });
    expect(dailyQuests(input, today).map((q) => q.id)).toEqual(quests.map((q) => q.id));
    expect(new Set(quests.map((q) => q.id)).size).toBe(3);
  });
});

describe("desafio do mês", () => {
  it("conta os dias estudados no mês", () => {
    const challenge = monthlyChallenge({ activity: { ...day("2026-11-01"), ...day("2026-11-03"), ...day("2026-10-30") } }, new Date("2026-11-05T12:00:00"));
    expect(challenge).toMatchObject({ id: "2026-11", current: 2, target: 20, daysLeft: 25, title: "Novembro de gratidão" });
  });
});
