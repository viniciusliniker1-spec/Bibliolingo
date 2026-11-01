import { describe, expect, it } from "vitest";
import { APP_TOUR, calloutPlacement, tourChapters } from "./appTour";

describe("tour da Lumi", () => {
  it("passa por todas as abas funcionais e começa e termina na Trilha", () => {
    expect(new Set(APP_TOUR.map((step) => step.route))).toEqual(new Set(["/(tabs)", "/(tabs)/bible", "/(tabs)/study", "/(tabs)/achievements", "/(tabs)/profile"]));
    expect(APP_TOUR[0].route).toBe("/(tabs)");
    expect(APP_TOUR[APP_TOUR.length - 1].route).toBe("/(tabs)");
    expect(new Set(APP_TOUR.map((step) => step.id)).size).toBe(APP_TOUR.length);
    expect(tourChapters()).toEqual(["Boas-vindas", "Trilha", "Bíblia", "Estudar", "Conquistas", "Perfil", "Tudo pronto"]);
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
