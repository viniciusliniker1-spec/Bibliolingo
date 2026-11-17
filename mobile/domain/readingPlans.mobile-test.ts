import { describe, expect, it } from "vitest";
import { planProgress } from "../../src/domain/studyPlans";
import { createInitialProgress } from "./progress";
import { SHOWCASE_PLANS, activeEnrollments, archivePlan, enrollmentForPlan, readingParams, setStepDone, startPlan, stepLabel, todayReading, READING_XP } from "./readingPlans";

const day = (date: string) => new Date(`${date}T09:00:00`);

describe("planos de leitura no celular", () => {
  it("a vitrine tem planos válidos com ids únicos", () => {
    const ids = SHOWCASE_PLANS.map((item) => item.plan.id);
    expect(new Set(ids).size).toBe(ids.length);
    const joao = SHOWCASE_PLANS.find((item) => item.plan.id === "reading-john-21")!;
    expect(joao.plan.steps).toHaveLength(21);
    expect(stepLabel(joao.plan.steps[0])).toBe("João 1");
    expect(readingParams(joao.plan.steps[2])).toEqual({ osis: "John", chapter: "3" });
    for (const item of SHOWCASE_PLANS) expect(item.plan.steps.length).toBeGreaterThan(0);
  });

  it("começa um plano uma única vez e mostra a leitura de hoje", () => {
    const plan = SHOWCASE_PLANS[0].plan;
    let progress = startPlan(createInitialProgress(), plan, day("2026-11-10"));
    expect(activeEnrollments(progress)).toHaveLength(1);
    expect(startPlan(progress, plan, day("2026-11-10"))).toBe(progress);
    const enrollment = enrollmentForPlan(progress, plan.id)!;
    const today = todayReading(progress, enrollment, "2026-11-10")!;
    expect(stepLabel(today.step)).toBe("João 1");
    expect(today.overdue).toBe(false);
    expect(today.progress.completed).toBe(0);
    progress = setStepDone(progress, enrollment.id, today.step.id, true, day("2026-11-10"));
    expect(todayReading(progress, enrollment, "2026-11-10")?.step.id).not.toBe(today.step.id);
  });

  it("concluir uma etapa conta como estudo: ofensiva, XP e atividade do dia", () => {
    const plan = SHOWCASE_PLANS[0].plan;
    let progress = startPlan(createInitialProgress(), plan, day("2026-11-10"));
    const enrollment = enrollmentForPlan(progress, plan.id)!;
    progress = setStepDone(progress, enrollment.id, enrollment.stepsSnapshot[0].id, true, day("2026-11-10"));
    expect(progress.streak).toBe(1);
    expect(progress.xp).toBe(READING_XP);
    expect(progress.activity["2026-11-10"].xp).toBe(READING_XP);
    progress = setStepDone(progress, enrollment.id, enrollment.stepsSnapshot[1].id, true, day("2026-11-11"));
    expect(progress.streak).toBe(2);
    // desmarcar não devolve nem cobra XP
    const undone = setStepDone(progress, enrollment.id, enrollment.stepsSnapshot[1].id, false, day("2026-11-11"));
    expect(undone.xp).toBe(progress.xp);
    expect(planProgress(undone.planEnrollments[0], undone.planCompletionEvents).completed).toBe(1);
  });

  it("termina o plano ao concluir todas as etapas e permite encerrar", () => {
    const plan = SHOWCASE_PLANS.find((item) => item.plan.id === "reading-philippians-4")!.plan;
    let progress = startPlan(createInitialProgress(), plan, day("2026-11-10"));
    const enrollment = enrollmentForPlan(progress, plan.id)!;
    enrollment.stepsSnapshot.forEach((step, index) => { progress = setStepDone(progress, enrollment.id, step.id, true, day(`2026-11-${10 + index}`)); });
    expect(progress.planEnrollments[0].status).toBe("completed");
    expect(progress.planChangeEvents.some((event) => event.kind === "completed")).toBe(true);
    const other = startPlan(createInitialProgress(), plan, day("2026-11-10"));
    const archived = archivePlan(other, other.planEnrollments[0].id, day("2026-11-11"));
    expect(activeEnrollments(archived)).toHaveLength(0);
  });
});
