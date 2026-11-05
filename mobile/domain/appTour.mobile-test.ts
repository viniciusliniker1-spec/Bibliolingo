/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { APP_TOUR, calloutPlacement, isNewLearner, tourChapters } from "./appTour";

const root = path.resolve(__dirname, "..");
const sources = (dir: string): string[] => readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? sources(path.join(dir, entry.name)) : /\.tsx$/.test(entry.name) ? [readFileSync(path.join(root, dir, entry.name), "utf8")] : []);

describe("tour da Lumi", () => {
  it("passa por todas as abas funcionais e começa e termina na Trilha", () => {
    expect(new Set(APP_TOUR.map((step) => step.route))).toEqual(new Set(["/(tabs)", "/(tabs)/bible", "/(tabs)/study", "/(tabs)/achievements", "/(tabs)/profile"]));
    expect(APP_TOUR[0].route).toBe("/(tabs)");
    expect(APP_TOUR[APP_TOUR.length - 1].route).toBe("/(tabs)");
    expect(new Set(APP_TOUR.map((step) => step.id)).size).toBe(APP_TOUR.length);
    expect(tourChapters()).toEqual(["Boas-vindas", "Trilha", "Bíblia", "Estudar", "Conquistas", "Perfil", "Tudo pronto"]);
  });

  it("cada alvo e cada rolagem existem de verdade nas telas", () => {
    const code = [...sources("app"), ...sources("components")].join("\n");
    for (const step of APP_TOUR) {
      if (step.target) expect(code, step.target).toContain(`useTourTarget("${step.target}")`);
      if (step.scroll) expect(code, step.scroll).toContain(`useTourScroll("${step.scroll}")`);
    }
  });

  it("cobre os recursos principais", () => {
    const ids = APP_TOUR.map((step) => step.id);
    for (const id of ["trail-challenges", "trail-paths", "study-languages", "study-tools", "profile-calendar", "profile-settings"]) expect(ids).toContain(id);
  });

  it("abre sozinho só para contas novas", () => {
    expect(isNewLearner({ xp: 0, completedLessonIds: [], activity: {} })).toBe(true);
    expect(isNewLearner({ xp: 30, completedLessonIds: ["a"], activity: { "2026-11-05": {} }, lastStudyDate: "2026-11-05" })).toBe(false);
    expect(isNewLearner({ xp: 0, completedLessonIds: [], activity: {}, lastStudyDate: "2026-10-01" })).toBe(false);
  });

  it("textos curtos o bastante para o balão", () => {
    for (const step of APP_TOUR) expect(step.text.length).toBeLessThanOrEqual(150);
  });

  it("põe o balão abaixo do alvo quando cabe, senão acima", () => {
    expect(calloutPlacement({ x: 0, y: 100, width: 50, height: 40 }, 800, 200)).toEqual({ top: 154, side: "below" });
    expect(calloutPlacement({ x: 0, y: 700, width: 50, height: 60 }, 800, 200)).toEqual({ top: 486, side: "above" });
    expect(calloutPlacement(undefined, 800, 200).side).toBe("center");
  });
});
