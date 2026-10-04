import { describe, expect, it } from "vitest";
import {
  createDailyReminderCalendar,
  isReminderDue,
  isValidReminderTime,
  millisecondsUntilReminder
} from "./dailyReminder";

describe("lembrete diário", () => {
  it("valida horário e respeita o dia local", () => {
    expect(isValidReminderTime("19:05")).toBe(true);
    expect(isValidReminderTime("24:00")).toBe(false);
    const now = new Date(2026, 9, 4, 19, 5);
    expect(isReminderDue({
      dailyReminderEnabled: true,
      dailyReminderTime: "19:00"
    }, now)).toBe(true);
    expect(isReminderDue({
      dailyReminderEnabled: true,
      dailyReminderTime: "19:00",
      lastReminderDate: "2026-10-04"
    }, now)).toBe(false);
    expect(isReminderDue({
      dailyReminderEnabled: true,
      dailyReminderTime: "20:00"
    }, now)).toBe(false);
  });

  it("agenda a próxima ocorrência sem depender de UTC", () => {
    const now = new Date(2026, 9, 4, 18, 30);
    expect(millisecondsUntilReminder("19:00", now)).toBe(30 * 60 * 1000);
    const calendar = createDailyReminderCalendar("19:00", now, "https://example.test/#/");
    expect(calendar).toContain("DTSTART:20261004T190000");
    expect(calendar).toContain("RRULE:FREQ=DAILY");
    expect(calendar).toContain("URL:https://example.test/#/");
  });
});
