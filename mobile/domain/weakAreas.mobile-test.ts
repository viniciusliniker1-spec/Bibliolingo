import { describe, expect, it } from "vitest";
import type { QuestionAttempt } from "../../src/types/progress";
import { weakAreaMessage, weakestBook, type BookWithActivities } from "./weakAreas";

const books: BookWithActivities[] = [
  { id: "exodus", title: "Êxodo", units: [{ lessons: [{ id: "ex-l1" }, { id: "ex-l2" }], checkpoint: { id: "ex-c1" } }] },
  { id: "ruth", title: "Rute", units: [{ lessons: [{ id: "ru-l1" }], checkpoint: { id: "ru-c1" } }] }
];
const now = new Date("2026-11-15T12:00:00Z");
const attempt = (lessonId: string, correct: boolean, daysAgo = 1, mode: QuestionAttempt["mode"] = "lesson"): QuestionAttempt => ({
  id: `${lessonId}-${Math.random()}`, questionId: "q", lessonId, correct, difficulty: "medium", mode,
  answeredAt: new Date(now.getTime() - daysAgo * 86_400_000).toISOString()
});

describe("área com mais erros", () => {
  it("aponta o livro com mais erros recentes", () => {
    const attempts = [
      ...Array.from({ length: 4 }, () => attempt("ex-l1", false)), attempt("ex-l2", true), attempt("ex-c1", true),
      ...Array.from({ length: 3 }, () => attempt("ru-l1", false)), attempt("ru-l1", true)
    ];
    const area = weakestBook(attempts, books, now)!;
    expect(area.bookId).toBe("exodus");
    expect(area.wrong).toBe(4);
    expect(area.accuracy).toBe(33);
    expect(weakAreaMessage(area)).toContain("Êxodo");
  });

  it("ignora poucos erros, respostas antigas e revisões", () => {
    expect(weakestBook([attempt("ex-l1", false), attempt("ex-l1", false)], books, now)).toBeUndefined();
    expect(weakestBook(Array.from({ length: 5 }, () => attempt("ex-l1", false, 30)), books, now)).toBeUndefined();
    expect(weakestBook(Array.from({ length: 5 }, () => attempt("ex-l1", false, 1, "review")), books, now)).toBeUndefined();
    expect(weakestBook([], books, now)).toBeUndefined();
  });
});
