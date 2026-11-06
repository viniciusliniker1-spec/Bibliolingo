import { describe, expect, it } from "vitest";
import { defaultStudyNotificationPreferences } from "../../src/services/notificationPolicy";
import type { MobileProgress } from "../types/progress";
import { nextMobileStudyReminder, planMobileReminders } from "./notificationSchedule";

const progress = {
  streak: 3,
  lastStudyDate: "2026-10-16",
  reviewItems: [],
  profile: { dailyGoal: 100 }
} as unknown as MobileProgress;

describe("mobile notification schedule", () => {
  it("selects only the next reminder instead of a week of duplicates", () => {
    const reminder = nextMobileStudyReminder(
      progress,
      { ...defaultStudyNotificationPreferences, enabled: true, time: "19:00" },
      new Date(2026, 9, 17, 10, 0)
    );
    expect(reminder?.date).toEqual(new Date(2026, 9, 17, 19, 0));
    expect(reminder?.candidate.category).toBe("streak");
  });

  it("does not create a reminder when notifications are disabled", () => {
    expect(nextMobileStudyReminder(progress, defaultStudyNotificationPreferences, new Date(2026, 9, 17, 10))).toBeUndefined();
  });
});

describe("plano de lembretes da Lumi", () => {
  const prefs = { ...defaultStudyNotificationPreferences, enabled: true, time: "19:00" };
  it("um por dia com textos variados e aviso noturno de sequência em risco", () => {
    const plan = planMobileReminders(progress, prefs, new Date(2026, 9, 17, 10, 0), { name: "Ana Souza", nextLessonTitle: "A criação" });
    const today = plan.filter((item) => item.date.getDate() === 17);
    expect(today.map((item) => item.kind)).toEqual(["streak", "streakRisk"]);
    expect(today[1].date).toEqual(new Date(2026, 9, 17, 21, 0));
    expect(today[1].title + today[1].body).toMatch(/sequência/);
    expect(new Set(plan.map((item) => item.date.toDateString())).size).toBe(plan.length - 1);
    // Amanhã a sequência já terá acabado: o lembrete deixa de falar dela.
    expect(plan.find((item) => item.date.getDate() === 18)?.kind).not.toBe("streak");
  });

  it("sem aviso de risco quando já estudou hoje", () => {
    const plan = planMobileReminders({ ...progress, lastStudyDate: "2026-10-17" } as MobileProgress, prefs, new Date(2026, 9, 17, 10, 0));
    expect(plan.some((item) => item.kind === "streakRisk")).toBe(false);
    expect(plan.some((item) => item.date.getDate() === 17)).toBe(false);
  });

  it("nada quando os lembretes estão desligados", () => {
    expect(planMobileReminders(progress, defaultStudyNotificationPreferences, new Date(2026, 9, 17, 10))).toEqual([]);
  });
});
