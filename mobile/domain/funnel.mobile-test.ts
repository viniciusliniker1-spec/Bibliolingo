import { describe, expect, it } from "vitest";
import { EMPTY_FUNNEL, funnelReport, funnelStages, recordEvent, recordOpen } from "./funnel";

const at = (date: string) => new Date(`${date}T10:00:00`);
const stage = (state: Parameters<typeof funnelStages>[0], id: string, now: Date) => funnelStages(state, now).find((item) => item.id === id)!;

describe("funil de uso", () => {
  it("registra cada evento só na primeira vez", () => {
    const first = recordEvent(EMPTY_FUNNEL, "first_lesson", at("2026-11-10"));
    const again = recordEvent(first, "first_lesson", at("2026-11-12"));
    expect(again.events.first_lesson).toBe(first.events.first_lesson);
  });

  it("não repete o mesmo dia de abertura e guarda no máximo 90", () => {
    let state = recordOpen(EMPTY_FUNNEL, at("2026-11-10"));
    state = recordOpen(state, at("2026-11-10"));
    expect(state.openDays).toEqual(["2026-11-10"]);
    expect(state.events.first_open).toBeDefined();
    for (let i = 0; i < 120; i += 1) state = recordOpen(state, new Date(2026, 0, 1 + i, 10));
    expect(state.openDays.length).toBe(90);
  });

  it("mede retorno no dia seguinte e depois de uma semana", () => {
    let state = recordOpen(EMPTY_FUNNEL, at("2026-11-10"));
    expect(stage(state, "return_d1", at("2026-11-10")).pending).toBe(true);
    expect(stage(state, "return_d1", at("2026-11-14")).reached).toBe(false);
    state = recordOpen(state, at("2026-11-11"));
    expect(stage(state, "return_d1", at("2026-11-11")).reached).toBe(true);
    expect(stage(state, "return_d7", at("2026-11-12")).pending).toBe(true);
    state = recordOpen(state, at("2026-11-18"));
    expect(stage(state, "return_d7", at("2026-11-18")).reached).toBe(true);
  });

  it("gera um relatório legível", () => {
    const state = recordEvent(recordOpen(EMPTY_FUNNEL, at("2026-11-10")), "first_lesson", at("2026-11-10"));
    const report = funnelReport(state, at("2026-11-10"));
    expect(report).toContain("✔ Abriu o app");
    expect(report).toContain("✔ Concluiu a primeira lição");
    expect(report).toContain("… Voltou no dia seguinte");
    expect(report).toContain("✘ Concluiu um livro");
  });
});
