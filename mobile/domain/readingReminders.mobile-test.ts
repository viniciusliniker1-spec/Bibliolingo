import { describe, expect, it } from "vitest";
import { defaultStudyNotificationPreferences } from "../../src/services/notificationPolicy";
import { createInitialProgress } from "./progress";
import { planMobileReminders, planReadingReminders, READING_REMINDER_OFFSET_MIN } from "./notificationSchedule";
import { SHOWCASE_PLANS, enrollmentForPlan, setStepDone, startPlan } from "./readingPlans";

const prefs = { ...defaultStudyNotificationPreferences, enabled: true, time: "19:00", quietStart: "22:00", quietEnd: "07:00" };
const joao = SHOWCASE_PLANS.find((item) => item.plan.id === "reading-john-21")!.plan;
const at = (day: number, hour = 9) => new Date(2026, 10, day, hour, 0);

describe("lembretes do plano de leitura", () => {
  it("sem plano ativo não gera lembrete de leitura", () => {
    expect(planReadingReminders(createInitialProgress(), prefs, at(10), {}, 6)).toEqual([]);
  });

  it("gera um lembrete por dia com o trecho do dia, na ordem das etapas", () => {
    const progress = startPlan(createInitialProgress(), joao, at(10));
    const list = planReadingReminders(progress, prefs, at(10), { name: "Marina Souza" }, 4);
    expect(list).toHaveLength(4);
    expect(list.every((item) => item.route === "/plans")).toBe(true);
    expect(list[0].title + list[0].body).toContain("João 1");
    expect(list[1].title + list[1].body).toContain("João 2");
    expect(list[3].title + list[3].body).toContain("João 4");
    // 45 minutos depois do lembrete de estudo (19:00 → 19:45)
    expect(list[0].date.getHours() * 60 + list[0].date.getMinutes()).toBe(19 * 60 + READING_REMINDER_OFFSET_MIN);
  });

  it("depois da leitura de hoje, o próximo lembrete é só amanhã e já com o trecho seguinte", () => {
    let progress = startPlan(createInitialProgress(), joao, at(10));
    const enrollment = enrollmentForPlan(progress, joao.id)!;
    progress = setStepDone(progress, enrollment.id, enrollment.stepsSnapshot[0].id, true, at(10, 8));
    const list = planReadingReminders(progress, prefs, at(10, 9), {}, 3);
    expect(list[0].date.getDate()).toBe(11);
    expect(list[0].title + list[0].body).toContain("João 2");
  });

  it("o último dia do plano usa a mensagem de reta final", () => {
    let progress = startPlan(createInitialProgress(), joao, at(10));
    const enrollment = enrollmentForPlan(progress, joao.id)!;
    enrollment.stepsSnapshot.slice(0, 20).forEach((step, index) => { progress = setStepDone(progress, enrollment.id, step.id, true, at(10 + index, 8)); });
    const list = planReadingReminders(progress, prefs, at(31, 9), {}, 2);
    expect(list[0].kind).toBe("planLast");
    expect(list[0].title + list[0].body).toContain("João 21");
  });

  it("respeita o horário silencioso e entra no plano geral de lembretes", () => {
    const progress = startPlan(createInitialProgress(), joao, at(10));
    expect(planReadingReminders(progress, { ...prefs, time: "21:30" }, at(10), {}, 3)).toEqual([]);
    const all = planMobileReminders(progress, prefs, at(10), {}, 3);
    expect(all.some((item) => item.route === "/plans")).toBe(true);
  });
});
