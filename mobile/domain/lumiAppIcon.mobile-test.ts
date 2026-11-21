import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "../assets/app-icons/catalog.json";
import { ALL_LADDER_ICONS, DEFAULT_APP_ICON, HAPPY_ICONS, MISSED_ICONS, iconForAccess, recordAccess, type AccessState } from "./lumiAppIcon";

const day = (date: string) => new Date(`${date}T15:00:00`);

describe("ícone do app pela frequência", () => {
  it("o neutro é o padrão: sem acessos e no primeiro dia", () => {
    expect(iconForAccess({ streak: 0 }, day("2026-11-10"))).toBe(DEFAULT_APP_ICON);
    expect(iconForAccess(recordAccess({ streak: 0 }, day("2026-11-10")), day("2026-11-10"))).toBe(DEFAULT_APP_ICON);
  });

  it("acessar todo dia deixa a Lumi cada vez mais feliz", () => {
    let state: AccessState = { streak: 0 };
    const seen: string[] = [];
    for (let d = 1; d <= 30; d += 1) {
      const now = day(`2026-11-${String(d).padStart(2, "0")}`);
      state = recordAccess(state, now);
      seen.push(iconForAccess(state, now));
    }
    expect(state.streak).toBe(30);
    expect(seen[0]).toBe("neutra");
    expect(seen[1]).toBe("sorriso");
    expect(seen[6]).toBe("piscadinha");
    expect(seen[29]).toBe("coroa");
    // nunca volta a um ícone anterior da escada enquanto a sequência cresce
    const order = HAPPY_ICONS.map((step) => step.icon);
    const positions = seen.map((icon) => order.indexOf(icon));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("abrir mais de uma vez no mesmo dia não aumenta a sequência", () => {
    const first = recordAccess({ streak: 0 }, day("2026-11-10"));
    expect(recordAccess(first, day("2026-11-10"))).toEqual(first);
  });

  it("não abrir deixa a Lumi neutra, depois triste, cada vez mais triste e por fim brava", () => {
    const state: AccessState = { lastOpen: "2026-11-01", streak: 40 };
    const icons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20].map((gap) => iconForAccess(state, day(`2026-11-${String(1 + gap).padStart(2, "0")}`)));
    expect(icons[0]).toBe("neutra");
    expect(icons[1]).toBe("triste");
    expect(icons[6]).toBe("rosto_coberto");
    expect(icons[7]).toBe("emburrada");
    expect(icons[12]).toBe("explosao");
    expect(icons[13]).toBe("explosao");
  });

  it("voltar depois de uma pausa recomeça a sequência", () => {
    const back = recordAccess({ lastOpen: "2026-11-01", streak: 40 }, day("2026-11-09"));
    expect(back).toEqual({ lastOpen: "2026-11-09", streak: 1 });
    expect(iconForAccess(back, day("2026-11-09"))).toBe("neutra");
  });

  it("as escadas começam no neutro e crescem sem repetir ícones", () => {
    expect(HAPPY_ICONS[0].icon).toBe(DEFAULT_APP_ICON);
    expect(MISSED_ICONS[0].icon).toBe(DEFAULT_APP_ICON);
    const fromHappy = HAPPY_ICONS.map((step) => step.from);
    expect(fromHappy).toEqual([...fromHappy].sort((a, b) => a - b));
    const icons = [...HAPPY_ICONS.slice(1), ...MISSED_ICONS.slice(1)].map((step) => step.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("todo ícone da escada existe no catálogo e foi gerado em assets/app-icons", () => {
    const dir = path.resolve(__dirname, "../assets/app-icons");
    const files = readdirSync(dir).filter((file) => file.endsWith(".png")).map((file) => file.replace(".png", ""));
    for (const icon of ALL_LADDER_ICONS) {
      expect(Object.keys(catalog.icons), icon).toContain(icon);
      expect(files, icon).toContain(icon);
    }
    expect(Object.keys(catalog.icons)).toHaveLength(48);
  });
});
