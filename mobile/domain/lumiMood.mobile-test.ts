import { describe, expect, it } from "vitest";
import { lumiStreakMood } from "./lumiMood";

const at = (date: string, hour = 15) => new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);

describe("humor da Lumi pela ofensiva", () => {
  it("fica mais feliz conforme a ofensiva cresce", () => {
    const levels = [1, 3, 7, 14, 30].map((streak) => lumiStreakMood({ streak, lastStudyDate: "2026-11-05", now: at("2026-11-05") }));
    expect(levels.map((item) => item.mood)).toEqual(["checklist", "progresso", "calendario", "trofeu", "coroa"]);
    for (let i = 1; i < levels.length; i += 1) expect(levels[i].level).toBeGreaterThanOrEqual(levels[i - 1].level);
    expect(lumiStreakMood({ streak: 120, lastStudyDate: "2026-11-05", now: at("2026-11-05") }).mood).toBe("amor");
  });
  it("comemora a meta batida no começo", () => {
    expect(lumiStreakMood({ streak: 1, lastStudyDate: "2026-11-05", goalRatio: 1, now: at("2026-11-05") }).mood).toBe("pulo");
  });
  it("fica aflita ao longo do dia sem lição", () => {
    expect(lumiStreakMood({ streak: 5, lastStudyDate: "2026-11-04", now: at("2026-11-05", 9) }).mood).toBe("sono");
    expect(lumiStreakMood({ streak: 5, lastStudyDate: "2026-11-04", now: at("2026-11-05", 14) }).mood).toBe("confusa");
    expect(lumiStreakMood({ streak: 5, lastStudyDate: "2026-11-04", now: at("2026-11-05", 20) }).mood).toBe("pedindo");
  });
  it("fica mais triste quanto mais tempo sem estudar", () => {
    const sad = [2, 3, 5, 9].map((gap) => {
      const last = new Date(at("2026-11-10")); last.setDate(last.getDate() - gap);
      return lumiStreakMood({ streak: 4, lastStudyDate: last.toISOString().slice(0, 10), now: at("2026-11-10") });
    });
    expect(sad.map((item) => item.mood)).toEqual(["chuva", "brava", "chorando", "chorando"]);
    expect(sad[0].level).toBeGreaterThan(sad[2].level);
  });
  it("convida quem nunca estudou", () => {
    expect(lumiStreakMood({ streak: 0 }).mood).toBe("ideia");
  });
});
