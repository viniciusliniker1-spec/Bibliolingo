import { describe, expect, it } from "vitest";
import { createInitialProgress } from "./progress";
import { PLAN_MILESTONES, pendingPlanMilestone, planBackgroundBookId, planCaption, planMood, planStatus, reachedPlanMilestones } from "./planMilestones";
import { SHOWCASE_PLANS, enrollmentForPlan, setStepDone, startPlan } from "./readingPlans";
import { existsSync } from "node:fs";
import path from "node:path";

const day = (n: number) => new Date(2026, 10, n, 9, 0);

describe("marcos do plano de leitura", () => {
  it("lista os marcos atingidos e o pendente mais alto", () => {
    expect(PLAN_MILESTONES).toEqual([25, 50, 75, 100]);
    expect(reachedPlanMilestones(10)).toEqual([]);
    expect(reachedPlanMilestones(60)).toEqual([25, 50]);
    expect(pendingPlanMilestone(60, [25])).toBe(50);
    expect(pendingPlanMilestone(60, [25, 50])).toBeUndefined();
    expect(pendingPlanMilestone(100, [25, 50])).toBe(100);
  });

  it("acompanha o avanço real do plano e muda o humor da Lumi", () => {
    const plan = SHOWCASE_PLANS.find((item) => item.plan.id === "reading-philippians-4")!.plan;
    let progress = startPlan(createInitialProgress(), plan, day(10));
    const enrollment = enrollmentForPlan(progress, plan.id)!;
    expect(planStatus(enrollment, progress.planCompletionEvents).percent).toBe(0);
    progress = setStepDone(progress, enrollment.id, enrollment.stepsSnapshot[0].id, true, day(10));
    const quarter = planStatus(progress.planEnrollments[0], progress.planCompletionEvents);
    expect(quarter).toEqual({ percent: 25, completed: 1, total: 4 });
    expect(pendingPlanMilestone(quarter.percent, [])).toBe(25);
    expect(planMood(25)).toBe("checklist");
    expect(planMood(50)).toBe("progresso");
    expect(planMood(75)).toBe("trofeu");
    expect(planMood(100)).toBe("coroa");
  });

  it("a legenda muda quando o plano termina e o fundo vem do livro lido", () => {
    expect(planCaption("João em 21 dias", { percent: 50, completed: 10, total: 21 }, "Marina Souza")).toContain("50% lido");
    expect(planCaption("João em 21 dias", { percent: 100, completed: 21, total: 21 }, "Marina Souza")).toContain("concluiu");
    for (const item of SHOWCASE_PLANS) {
      const progress = startPlan(createInitialProgress(), item.plan, day(10));
      const bookId = planBackgroundBookId(progress.planEnrollments[0]);
      expect(existsSync(path.resolve(__dirname, `../assets/routes/${bookId}.webp`)), item.plan.id).toBe(true);
    }
  });
});
