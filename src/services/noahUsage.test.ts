import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NOAH_DAILY_QUESTION_LIMIT,
  noahQuestionsRemaining,
  registerNoahQuestion
} from "./noahUsage";

describe("limite diário do Noah", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear()
    });
  });

  it("limita perguntas bem-sucedidas por dia", () => {
    expect(noahQuestionsRemaining()).toBe(NOAH_DAILY_QUESTION_LIMIT);
    for (let index = 0; index < NOAH_DAILY_QUESTION_LIMIT; index += 1) registerNoahQuestion();
    expect(noahQuestionsRemaining()).toBe(0);
  });
});
