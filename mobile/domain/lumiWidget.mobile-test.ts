import { describe, expect, it } from "vitest";
import { compactXpByDay, widgetView, type WidgetSnapshot } from "./lumiWidget";
import { LUMI_REMINDERS, lumiReminder } from "./lumiNotifications";

const at = (h: number) => new Date(2026, 10, 2, h, 0);
const base: WidgetSnapshot = { name: "Ana Maria", streak: 5, lastStudyDate: "2026-11-01", xpByDay: {}, dailyGoal: 100, nextLessonTitle: "A criação", updatedAt: "" };

describe("widget da Lumi", () => {
  it("comemora quando a meta do dia foi batida", () => {
    const view = widgetView({ ...base, lastStudyDate: "2026-11-02", xpByDay: { "2026-11-02": 120 } }, at(15));
    expect(view.mood).toBe("goal");
    expect(view.goalRatio).toBe(1);
  });

  it("avisa à noite que a sequência acaba hoje", () => {
    const view = widgetView(base, at(20));
    expect(view.mood).toBe("risk");
    expect(view.title).toContain("5 dias");
  });

  it("dá bom dia com a próxima lição e o primeiro nome", () => {
    const view = widgetView(base, at(8));
    expect(view).toMatchObject({ mood: "morning", title: "Bom dia, Ana!" });
    expect(view.message).toContain("A criação");
  });

  it("dorme depois de 3 dias sem estudo e zera a sequência vencida", () => {
    const view = widgetView({ ...base, lastStudyDate: "2026-10-28" }, at(15));
    expect(view).toMatchObject({ mood: "sleepy", streak: 0 });
  });

  it("quem nunca estudou recebe convite, não a Lumi dormindo", () => {
    expect(widgetView({ ...base, lastStudyDate: undefined, streak: 0 }, at(15)).mood).toBe("invite");
  });

  it("guarda só os últimos dias de XP", () => {
    expect(compactXpByDay({ "2026-11-02": { xp: 30 }, "2026-10-20": { xp: 99 } }, at(10))).toEqual({ "2026-11-02": 30 });
  });
});

describe("lembretes da Lumi", () => {
  it("variam por dia, cabem na notificação e não deixam variável sobrando", () => {
    for (const kind of Object.keys(LUMI_REMINDERS) as (keyof typeof LUMI_REMINDERS)[]) {
      const texts = new Set<string>();
      for (let day = 1; day <= 20; day += 1) {
        const copy = lumiReminder(kind, `2026-11-${day}`, { nome: "Ana", dias: 4, revisoes: 3, licao: "A criação" });
        expect(copy.title.length).toBeLessThanOrEqual(60);
        expect(copy.body.length).toBeLessThanOrEqual(120);
        expect(copy.title + copy.body).not.toMatch(/\{\w+\}/);
        texts.add(copy.title);
      }
      expect(texts.size).toBe(LUMI_REMINDERS[kind].length);
    }
  });

  it("funciona sem nome nem lição", () => {
    const copy = lumiReminder("morning", "x", {});
    expect(copy.title).not.toMatch(/,\s*!|^\s*,/);
    expect(copy.body).not.toContain("“”");
  });
});

describe("horários", () => {
  it("ajusta em passos e dá a volta no dia", async () => {
    const { shiftTime } = await import("./lumiNotifications");
    expect(shiftTime("19:00", 15)).toBe("19:15");
    expect(shiftTime("23:50", 15)).toBe("00:05");
    expect(shiftTime("00:10", -15)).toBe("23:55");
  });
});
