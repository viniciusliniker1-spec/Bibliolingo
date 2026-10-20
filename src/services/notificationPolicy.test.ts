import { describe, expect, it } from "vitest";
import {
  chooseStudyNotification,
  defaultStudyNotificationPreferences,
  isQuietTime,
  markNotificationSent
} from "./notificationPolicy";

const now = new Date(2026, 9, 16, 19, 30);

describe("notification policy", () => {
  it("não lembra quando a meta já foi cumprida ou o aluno estudou hoje", () => {
    expect(chooseStudyNotification({
      preferences: { ...defaultStudyNotificationPreferences, enabled: true, review: false, streak: false, inactivity: false },
      now, todayXp: 100, dailyGoal: 100, studiedToday: true, streak: 2, reviewCount: 0
    })).toBeUndefined();
  });

  it("prioriza revisão e evita duplicação diária", () => {
    const preferences = { ...defaultStudyNotificationPreferences, enabled: true };
    const first = chooseStudyNotification({
      preferences, now, todayXp: 0, dailyGoal: 100, studiedToday: false, streak: 3, reviewCount: 4
    });
    expect(first?.category).toBe("review");
    expect(chooseStudyNotification({
      preferences: markNotificationSent(preferences, "review", now),
      now, todayXp: 0, dailyGoal: 100, studiedToday: false, streak: 0, reviewCount: 4
    })?.category).toBe("daily");
  });

  it("respeita horário de silêncio inclusive quando cruza meia-noite", () => {
    expect(isQuietTime(new Date(2026, 9, 16, 23), "22:00", "08:00")).toBe(true);
    expect(isQuietTime(new Date(2026, 9, 16, 12), "22:00", "08:00")).toBe(false);
  });
});
