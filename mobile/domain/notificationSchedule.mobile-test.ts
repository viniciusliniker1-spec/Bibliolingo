import { describe, expect, it } from "vitest";
import { defaultStudyNotificationPreferences } from "../../src/services/notificationPolicy";
import type { MobileProgress } from "../types/progress";
import { nextMobileStudyReminder } from "./notificationSchedule";

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
