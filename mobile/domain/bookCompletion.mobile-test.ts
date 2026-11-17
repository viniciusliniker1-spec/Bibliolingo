import { describe, expect, it } from "vitest";
import { journeyBooks } from "../../src/content/catalog";
import { bookActivityIds, bookCelebration, isBookComplete, nextBookOf } from "./bookCompletion";

const ruth = journeyBooks.find((book) => book.id === "ruth")!;
const ruthIds = bookActivityIds(ruth);
const split = (ids: string[]) => ({
  lessons: ids.filter((id) => ruth.units.some((unit) => unit.lessons.some((lesson) => lesson.id === id))),
  checkpoints: ids.filter((id) => ruth.units.some((unit) => unit.checkpoint.id === id))
});

describe("conclusão de livro", () => {
  it("o livro só está completo com todas as lições e todos os checkpoints", () => {
    const all = split(ruthIds);
    expect(isBookComplete(ruth, all.lessons, all.checkpoints)).toBe(true);
    const missing = split(ruthIds.slice(0, -1));
    expect(isBookComplete(ruth, missing.lessons, missing.checkpoints)).toBe(false);
    expect(isBookComplete(ruth, [], [])).toBe(false);
  });

  it("comemora quando a última etapa fecha o livro e indica o próximo", () => {
    const all = split(ruthIds);
    const result = bookCelebration({ books: journeyBooks, activityId: ruthIds[ruthIds.length - 1], completedLessonIds: all.lessons, completedCheckpointIds: all.checkpoints, celebrated: [] });
    expect(result?.book.id).toBe("ruth");
    expect(result?.next?.id).toBe("1-samuel");
    expect(result?.activities).toBe(ruthIds.length);
    expect(result?.lastOfBible).toBe(false);
  });

  it("não comemora duas vezes nem com o livro incompleto", () => {
    const all = split(ruthIds);
    const base = { books: journeyBooks, activityId: ruthIds[0], completedLessonIds: all.lessons, completedCheckpointIds: all.checkpoints };
    expect(bookCelebration({ ...base, celebrated: ["ruth"] })).toBeUndefined();
    const partial = split(ruthIds.slice(0, -1));
    expect(bookCelebration({ ...base, completedLessonIds: partial.lessons, completedCheckpointIds: partial.checkpoints, celebrated: [] })).toBeUndefined();
    expect(bookCelebration({ ...base, activityId: "nao-existe", celebrated: [] })).toBeUndefined();
  });

  it("o último livro da Bíblia fecha a jornada", () => {
    const apocalipse = journeyBooks[journeyBooks.length - 1];
    expect(apocalipse.id).toBe("revelation");
    expect(nextBookOf(journeyBooks, apocalipse.id)).toBeUndefined();
    const ids = bookActivityIds(apocalipse);
    const lessons = apocalipse.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
    const checkpoints = apocalipse.units.map((unit) => unit.checkpoint.id);
    expect(bookCelebration({ books: journeyBooks, activityId: ids[ids.length - 1], completedLessonIds: lessons, completedCheckpointIds: checkpoints, celebrated: [] })?.lastOfBible).toBe(true);
  });

  it("a ordem dos livros segue a jornada", () => {
    expect(nextBookOf(journeyBooks, "genesis")?.id).toBe("exodus");
    expect(nextBookOf(journeyBooks, "malachi")?.id).toBe("matthew");
    expect(nextBookOf(journeyBooks, "naoexiste")).toBeUndefined();
  });
});
