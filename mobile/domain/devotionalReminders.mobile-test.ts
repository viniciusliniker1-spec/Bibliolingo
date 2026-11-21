import { describe, expect, it } from "vitest";
import { defaultStudyNotificationPreferences } from "../../src/services/notificationPolicy";
import { devotionalReminders } from "./notificationSchedule";
import { createInitialProgress } from "./progress";
import { planMobileReminders } from "./notificationSchedule";

const prefs = { ...defaultStudyNotificationPreferences, enabled: true };
const at = (day: number, hour = 6) => new Date(2026, 10, day, hour, 0, 0);

describe("lembrete do devocional", () => {
  it("não agenda com notificações desligadas ou sem o lembrete diário", () => {
    expect(devotionalReminders({ ...prefs, enabled: false }, at(19), {}, 3)).toEqual([]);
    expect(devotionalReminders({ ...prefs, daily: false }, at(19), {}, 3)).toEqual([]);
  });

  it("agenda um por dia às 08:30 e leva ao devocional", () => {
    const list = devotionalReminders(prefs, at(19), { name: "Marina Souza" }, 3);
    expect(list).toHaveLength(3);
    expect(list.map((r) => r.date.getHours() * 60 + r.date.getMinutes())).toEqual([510, 510, 510]);
    expect(list.every((r) => r.route === "/devotional" && r.kind === "devotional")).toBe(true);
  });

  it("pula o dia já concluído e o que cai no horário silencioso", () => {
    const done = devotionalReminders(prefs, at(19), { devotionalDone: ["2026-11-19"] }, 3);
    expect(done).toHaveLength(2);
    expect(devotionalReminders({ ...prefs, quietEnd: "09:00" }, at(19), {}, 3)).toEqual([]);
  });

  it("afasta o horário quando o estudo está marcado em cima dele", () => {
    const list = devotionalReminders({ ...prefs, time: "08:50" }, at(19), {}, 1);
    expect(list[0].date.getHours() * 60 + list[0].date.getMinutes()).toBe(8 * 60 + 50 - 45);
  });

  it("entra no plano geral de lembretes", () => {
    const plan = planMobileReminders(createInitialProgress(), prefs, at(19), {}, 2);
    expect(plan.some((r) => r.kind === "devotional")).toBe(true);
  });
});
