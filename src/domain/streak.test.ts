import { describe, expect, it } from "vitest";
import { toLocalDateKey, updateStreak } from "./streak";

describe("streak local", () => {
  it("usa os componentes locais da data", () => {
    const date = new Date(2026, 9, 3, 23, 59);
    expect(toLocalDateKey(date)).toBe("2026-10-03");
  });

  it("mantém no mesmo dia, incrementa no seguinte e reinicia após intervalo", () => {
    expect(updateStreak("2026-10-03", 4, 7, new Date(2026, 9, 3, 22)).streak).toBe(4);
    expect(updateStreak("2026-10-03", 4, 7, new Date(2026, 9, 4, 8)).streak).toBe(5);
    expect(updateStreak("2026-10-03", 4, 7, new Date(2026, 9, 6, 8)).streak).toBe(1);
  });
});
