import { describe, expect, it } from "vitest";
import { buildMonth, currentWeek, monthStats } from "./streakCalendar";

const activity = {
  "2026-11-02": { xp: 20, lessons: 1 },
  "2026-11-03": { xp: 60, lessons: 3 },
  "2026-11-04": { xp: 30, lessons: 1 },
  "2026-11-10": { xp: 0, lessons: 1 }
};

describe("calendário de constância", () => {
  const today = new Date("2026-11-05T10:00:00");
  const weeks = buildMonth(2026, 10, activity, 50, today);

  it("monta semanas de domingo a sábado cobrindo o mês", () => {
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    const inMonth = weeks.flat().filter((day) => day.inMonth);
    expect(inMonth).toHaveLength(30);
    expect(weeks[0][0].key).toBe("2026-11-01"); // 1º de novembro de 2026 é domingo
  });

  it("liga dias seguidos e marca hoje, meta e futuro", () => {
    const byKey = new Map(weeks.flat().map((day) => [day.key, day]));
    expect(byKey.get("2026-11-02")?.joinRight).toBe(true);
    expect(byKey.get("2026-11-03")?.joinLeft && byKey.get("2026-11-03")?.joinRight).toBe(true);
    expect(byKey.get("2026-11-04")?.joinRight).toBe(false);
    expect(byKey.get("2026-11-03")?.goalMet).toBe(true);
    expect(byKey.get("2026-11-05")?.isToday).toBe(true);
    expect(byKey.get("2026-11-06")?.future).toBe(true);
  });

  it("resume o mês", () => {
    expect(monthStats(weeks)).toEqual({ studiedDays: 4, goalDays: 1, perfectWeeks: 0, longestRun: 3, xp: 110 });
  });

  it("acha a semana atual", () => {
    expect(currentWeek(activity, 50, today).map((day) => day.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
