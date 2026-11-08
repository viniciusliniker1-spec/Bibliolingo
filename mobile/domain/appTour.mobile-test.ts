/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calloutPlacement, destinationFor, isNewLearner, TOUR_ROUTES, TOUR_STEP_COUNT, tourStepsFor, typedText, type TourRouteChoice } from "./appTour";

const root = path.resolve(__dirname, "..");
const sources = (dir: string): string[] => readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? sources(path.join(dir, entry.name)) : /\.tsx$/.test(entry.name) ? [readFileSync(path.join(root, dir, entry.name), "utf8")] : []);

const ROUTES: TourRouteChoice[] = ["bible", "greek", "hebrew"];

describe("tutorial da Lumi", () => {
  it("começa com as boas-vindas e diz que foi propósito de Deus", () => {
    const [welcome] = tourStepsFor();
    expect(welcome.kind).toBe("message");
    expect(welcome.text).toContain("propósito de Deus");
    expect(welcome.text).toMatch(/conduzir/);
    expect(welcome.text).toContain("Palavra de Deus");
    expect(welcome.title).toContain("{nome}");
  });

  it("depois pergunta o que o aluno quer estudar, com as três rotas", () => {
    const steps = tourStepsFor();
    expect(steps.map((step) => step.kind)).toEqual(["message", "choice"]);
    expect(steps[1].title).toBe("O que você quer estudar?");
    expect(TOUR_ROUTES.map((option) => option.id)).toEqual(ROUTES);
    expect(TOUR_ROUTES.map((option) => option.title)).toEqual(["Rota bíblica", "Grego bíblico", "Hebraico e aramaico"]);
  });

  it("cada rota mostra três recursos e se despede levando o aluno até ela", () => {
    for (const route of ROUTES) {
      const steps = tourStepsFor(route);
      expect(steps).toHaveLength(TOUR_STEP_COUNT);
      expect(steps.map((step) => step.kind)).toEqual(["message", "choice", "spot", "spot", "spot", "message"]);
      expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
      expect(steps.at(-1)?.id).toBe("finish");
      expect(steps.at(-1)?.button).toBe("Começar a estudar");
    }
  });

  it("libera o aluno já na rota escolhida", () => {
    expect(destinationFor("bible")).toBe("/(tabs)");
    expect(destinationFor("greek")).toBe("/greek");
    expect(destinationFor("hebrew")).toBe("/hebrew");
    // as telas de destino existem
    expect(existsSync(path.join(root, "app/greek/index.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "app/hebrew/index.tsx"))).toBe(true);
  });

  it("os recursos de cada rota são os dela", () => {
    const text = (route: TourRouteChoice) => tourStepsFor(route).map((step) => `${step.title} ${step.text}`).join(" ");
    expect(text("greek")).toMatch(/24 letras/);
    expect(text("greek")).toMatch(/Novo Testamento/);
    expect(text("hebrew")).toMatch(/22 letras/);
    expect(text("hebrew")).toMatch(/direita para a esquerda/);
    expect(text("bible")).toMatch(/ofensiva|🔥/i);
  });

  it("cada alvo e cada rolagem existem de verdade nas telas", () => {
    const code = [...sources("app"), ...sources("components")].join("\n");
    for (const route of ROUTES) {
      for (const step of tourStepsFor(route)) {
        if (step.target) expect(code, step.target).toContain(`useTourTarget("${step.target}")`);
        if (step.scroll) expect(code, step.scroll).toContain(`useTourScroll("${step.scroll}")`);
      }
    }
  });

  it("textos curtos o bastante para o balão", () => {
    for (const route of ROUTES) {
      for (const step of tourStepsFor(route)) expect(step.text.length, step.id).toBeLessThanOrEqual(step.kind === "spot" ? 110 : 160);
    }
  });

  it("abre sozinho só para contas novas", () => {
    expect(isNewLearner({ xp: 0, completedLessonIds: [], activity: {} })).toBe(true);
    expect(isNewLearner({ xp: 30, completedLessonIds: ["a"], activity: { "2026-11-05": {} }, lastStudyDate: "2026-11-05" })).toBe(false);
    expect(isNewLearner({ xp: 0, completedLessonIds: [], activity: {}, lastStudyDate: "2026-10-01" })).toBe(false);
  });

  it("põe o balão abaixo do alvo quando cabe, senão acima", () => {
    expect(calloutPlacement({ x: 0, y: 100, width: 50, height: 40 }, 800, 200)).toEqual({ top: 154, side: "below" });
    expect(calloutPlacement({ x: 0, y: 700, width: 50, height: 60 }, 800, 200)).toEqual({ top: 486, side: "above" });
    expect(calloutPlacement(undefined, 800, 200).side).toBe("center");
  });

  it("o efeito de digitação não corta emoji ao meio", () => {
    expect(typedText("Oi 🔥!", 4)).toBe("Oi 🔥");
    expect(typedText("Oi", 0)).toBe("");
    expect(typedText("Oi", 99)).toBe("Oi");
  });
});
