import { describe, expect, it } from "vitest";
import { activityIdsForKind, resolveMobileActivity, type MobileActivityKind } from "./activityCatalog";
import { arrangeOptions } from "./lessonPlan";
import { createInitialProgress, createLessonSession, recordProgressAnswer } from "./progress";
import type { MobileProgress } from "../types/progress";

describe("alternativas embaralhadas", () => {
  it("a resposta certa cai em todas as posições, de forma equilibrada", () => {
    const positions = [0, 0, 0, 0];
    let total = 0;
    for (const kind of ["bible", "greek", "hebrew", "formation", "deepen"] as MobileActivityKind[]) {
      for (const id of activityIdsForKind(kind)) {
        for (const step of resolveMobileActivity(kind, id)?.steps ?? []) {
          if ((step.type === "multiple-choice" || step.type === "fill-choice") && step.options.length === 4) {
            const arranged = arrangeOptions(step.id, step.options, step.correctOptionId);
            expect(arranged.map((option) => option.id).sort()).toEqual(step.options.map((option) => option.id).sort());
            positions[arranged.findIndex((option) => option.id === step.correctOptionId)] += 1;
            total += 1;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(1000);
    for (const count of positions) {
      expect(count / total).toBeGreaterThan(0.2);
      expect(count / total).toBeLessThan(0.3);
    }
  });

  it("é estável para a mesma questão", () => {
    const options = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    expect(arrangeOptions("q1", options, "a")).toEqual(arrangeOptions("q1", options, "a"));
  });
});

describe("corações", () => {
  it("errar custa um coração, inclusive numa pergunta que volta na lição", () => {
    let progress: MobileProgress = { ...createInitialProgress(), activeLesson: createLessonSession("L1") };
    progress = recordProgressAnswer(progress, { questionId: "q1", correct: false, lessonId: "L1", mode: "lesson" });
    expect(progress.hearts).toBe(4);
    const xp = progress.xp;
    progress = recordProgressAnswer(progress, { questionId: "q1", correct: false, lessonId: "L1", mode: "lesson" });
    expect(progress.hearts).toBe(3);
    expect(progress.xp).toBe(xp);
    progress = recordProgressAnswer(progress, { questionId: "q1", correct: true, lessonId: "L1", mode: "lesson" });
    expect(progress.hearts).toBe(3);
  });

  it("não perde coração na revisão nem com corações desligados", () => {
    const base = { ...createInitialProgress(), activeLesson: createLessonSession("L1") };
    expect(recordProgressAnswer(base, { questionId: "q1", correct: false, lessonId: "review", mode: "review" }).hearts).toBe(5);
    const off = { ...base, settings: { ...base.settings, heartsEnabled: false } };
    expect(recordProgressAnswer(off, { questionId: "q1", correct: false, lessonId: "L1", mode: "lesson" }).hearts).toBe(5);
  });
});
