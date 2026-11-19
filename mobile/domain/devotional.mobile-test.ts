import { describe, expect, it } from "vitest";
import { awardDevotional, DEVOTIONAL_XP, devotionalFor, devotionalStreak, markDevotionalDone, mergeDevotionals, parseDevotional, parseDevotionalState } from "./devotional";
import seed from "../content/devotionals/seed.json";
import type { MobileProgress } from "../types/progress";

const base = parseDevotional(seed)!;

describe("devocional", () => {
  it("aceita o devocional embutido e rejeita formatos inválidos", () => {
    expect(base.date).toBe("2026-11-19");
    expect(parseDevotional({ ...seed, date: "19/11/2026" })).toBeUndefined();
    expect(parseDevotional({ ...seed, reflection: ["curto"] })).toBeUndefined();
    expect(parseDevotional({ ...seed, verse: { book: "Titus", chapter: 2, from: 12, to: 11 } })).toBeUndefined();
    expect(parseDevotional({ ...seed, verse: { book: "Titus", chapter: 2, from: 1, to: 40 } })).toBeUndefined();
    expect(parseDevotional(null)).toBeUndefined();
    expect(parseDevotional({ ...seed, questions: [] })).toBeUndefined();
  });

  it("usa o de hoje; sem ele, o mais recente anterior", () => {
    const older = { ...base, date: "2026-11-10" };
    expect(devotionalFor("2026-11-19", [older, base])).toEqual({ devotional: base, isToday: true });
    expect(devotionalFor("2026-11-20", [older, base])).toEqual({ devotional: base, isToday: false });
    expect(devotionalFor("2026-11-01", [older, base]).devotional).toBeUndefined();
  });

  it("une por data com a última lista vencendo", () => {
    const edited = { ...base, title: "Novo título" };
    expect(mergeDevotionals([base], [edited])).toEqual([edited]);
  });

  it("marca como concluído sem duplicar e guarda respostas", () => {
    const first = markDevotionalDone({ done: [], answers: {} }, "2026-11-19", ["a", ""]);
    const again = markDevotionalDone(first, "2026-11-19");
    expect(again.done).toEqual(["2026-11-19"]);
    expect(again.answers["2026-11-19"]).toEqual(["a", ""]);
    expect(parseDevotionalState({ done: ["x", "2026-11-19", "2026-11-19"], answers: { "2026-11-19": ["ok"], lixo: ["n"] } })).toEqual({ done: ["2026-11-19"], answers: { "2026-11-19": ["ok"] } });
  });

  it("conta dias seguidos terminando hoje ou ontem", () => {
    expect(devotionalStreak(["2026-11-17", "2026-11-18", "2026-11-19"], "2026-11-19")).toBe(3);
    expect(devotionalStreak(["2026-11-17", "2026-11-18"], "2026-11-19")).toBe(2);
    expect(devotionalStreak(["2026-11-10"], "2026-11-19")).toBe(0);
  });

  it("concede XP e conta o dia de estudo sem alterar o resto do progresso", () => {
    const progress = { xp: 5, streak: 0, bestStreak: 0, activity: {}, storageRevision: 3 } as unknown as MobileProgress;
    const next = awardDevotional(progress, new Date("2026-11-19T12:00:00"));
    expect(next.xp).toBe(5 + DEVOTIONAL_XP);
    expect(next.streak).toBe(1);
    expect(next.storageRevision).toBe(4);
    expect(next.activity["2026-11-19"].xp).toBe(DEVOTIONAL_XP);
  });
});
