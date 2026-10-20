import { describe, expect, it } from "vitest";
import {
  APPROVED_ACHIEVEMENTS,
  achievementProgress,
  evaluateAchievements,
  visibleApprovedAchievements
} from "./achievements";
import { journeyBooks } from "../content/catalog";
import { initialState } from "../state/initialState";

describe("achievements", () => {
  it("preserva as conquistas legadas e concede o ID estável da primeira lição", () => {
    const earned = evaluateAchievements({
      ...initialState,
      xp: 120,
      completedLessonIds: ["genesis-u01-l01"],
      perfectLessonIds: ["genesis-u01-l01"]
    });
    expect(earned).toEqual(expect.arrayContaining(["first-step", "perfect-lesson", "one-hundred-xp", "01"]));
  });

  it("desbloqueia os marcos legados do Novo Testamento sem migrar dados destrutivamente", () => {
    const earned = evaluateAchievements({
      ...initialState,
      completedCheckpointIds: ["revelation-u06-checkpoint"]
    });
    expect(earned).toEqual(expect.arrayContaining(["new-testament-complete", "whole-bible-complete"]));
  });

  it("não infla lições repetidas", () => {
    const achievement = APPROVED_ACHIEVEMENTS.find((item)=>item.id==="02")!;
    const value = achievementProgress({...initialState,completedLessonIds:Array(20).fill("same-lesson")},achievement);
    expect(value.current).toBe(1);
    expect(value.target).toBe(10);
  });

  it("exige a conclusão real de todas as atividades do livro", () => {
    const book = journeyBooks[0];
    const achievement = APPROVED_ACHIEVEMENTS.find((item)=>item.id==="07")!;
    const completedLessonIds = book.units.flatMap((unit)=>unit.lessons.map((lesson)=>lesson.id));
    const completedCheckpointIds = book.units.map((unit)=>unit.checkpoint.id);
    expect(achievementProgress({...initialState,completedLessonIds,completedCheckpointIds},achievement).current).toBe(1);
  });

  it("mantém a conquista 09 fora do catálogo público e fora da platina", () => {
    expect(visibleApprovedAchievements().some((item)=>item.id==="09")).toBe(false);
    expect(visibleApprovedAchievements({formationEntitled:true}).some((item)=>item.id==="09")).toBe(true);
    const platinum = APPROVED_ACHIEVEMENTS.find((item)=>item.id==="30")!;
    expect(achievementProgress(initialState,platinum).target).toBe(28);
  });

  it("não concede conquistas que ainda dependem de telemetria", () => {
    const earned = evaluateAchievements({...initialState,earnedAchievementIds:["09"]});
    expect(earned).not.toContain("14");
    expect(earned).not.toContain("18");
    expect(earned).not.toContain("29");
  });
});
