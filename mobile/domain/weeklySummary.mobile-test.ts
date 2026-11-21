import { describe, expect, it } from "vitest";
import { milestoneCaption, nextMilestone, pendingMilestone, reachedMilestones } from "./milestones";
import { inviteMessage } from "./invite";
import { weeklyCaption, weeklySummary } from "./weeklySummary";

const day = (offset: number, xp: number, lessons = 1) => {
  const date = new Date("2026-11-15T10:00:00");
  date.setDate(date.getDate() - offset);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return [key, { date: key, xp, seconds: 300, lessons }] as const;
};
const now = new Date("2026-11-15T20:00:00");

describe("resumo da semana", () => {
  it("soma os últimos 7 dias e conta os dias ativos", () => {
    const activity = Object.fromEntries([day(0, 50), day(1, 30), day(3, 70), day(6, 20), day(8, 999)]);
    const summary = weeklySummary(activity, now);
    expect(summary.days).toHaveLength(7);
    expect(summary.activeDays).toBe(4);
    expect(summary.xp).toBe(170);
    expect(summary.lessons).toBe(4);
    expect(summary.minutes).toBe(20);
    expect(summary.bestDay?.xp).toBe(70);
    expect(summary.mood).toBe("progresso");
  });

  it("compara com a semana anterior e trata semana vazia", () => {
    const grown = weeklySummary(Object.fromEntries([day(0, 100), day(8, 50)]), now);
    expect(grown.xpChange).toBe(100);
    const empty = weeklySummary({}, now);
    expect(empty.activeDays).toBe(0);
    expect(empty.mood).toBe("pedindo");
    expect(empty.xpChange).toBeUndefined();
    expect(weeklyCaption(empty)).toContain("0 de 7 dias");
  });

  it("a semana perfeita ganha a coroa", () => {
    const activity = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((offset) => day(offset, 40)));
    const summary = weeklySummary(activity, now);
    expect(summary.activeDays).toBe(7);
    expect(summary.mood).toBe("coroa");
    expect(summary.headline).toBe("Semana perfeita!");
  });
});

describe("marcos de ofensiva e convite", () => {
  it("lista marcos atingidos e o pendente mais alto", () => {
    expect(reachedMilestones(6)).toEqual([]);
    expect(reachedMilestones(31)).toEqual([7, 14, 30]);
    expect(pendingMilestone(31, [7])).toBe(30);
    expect(pendingMilestone(31, [7, 14, 30])).toBeUndefined();
    expect(nextMilestone(31)).toBe(50);
    expect(nextMilestone(400)).toBeUndefined();
    expect(milestoneCaption(30, "Marina Souza")).toContain("Marina");
  });

  it("o convite usa o link só quando existe", () => {
    expect(inviteMessage({ name: "Marina Souza", url: "https://exemplo.app" })).toContain("https://exemplo.app");
    expect(inviteMessage({})).toContain("Procure por Bibliolingo");
  });
});
