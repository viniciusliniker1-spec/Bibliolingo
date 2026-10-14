import { describe, expect, it } from "vitest";
import { journeyBooks, orderedActivityIds } from "../content/catalog";
import {
  isBookActivityUnlocked,
  isCheckpointUnlocked,
  isJourneyActivityUnlocked,
  isLessonUnlocked,
  nextActivityId,
  nextBookActivityId
} from "./unlocks";

const ids = ["l1", "l2", "l3"];

describe("unlocks", () => {
  it("libera sequencialmente", () => {
    expect(isLessonUnlocked("l1", ids, [])).toBe(true);
    expect(isLessonUnlocked("l2", ids, [])).toBe(false);
    expect(isLessonUnlocked("l2", ids, ["l1"])).toBe(true);
  });

  it("só libera checkpoint após todas as lições", () => {
    expect(isCheckpointUnlocked(ids, ["l1", "l2"])).toBe(false);
    expect(isCheckpointUnlocked(ids, ids)).toBe(true);
    expect(nextActivityId(ids, "cp", ids, [])).toBe("cp");
  });

  it("não permite que conclusões avulsas saltem etapas da jornada", () => {
    const sequence = ["a", "b", "c", "d"];
    expect(isJourneyActivityUnlocked("d", sequence, ["c"], [])).toBe(false);
    expect(isJourneyActivityUnlocked("d", sequence, ["a", "b", "c"], [])).toBe(true);
  });

  it("mantém a progressão avulsa restrita ao livro escolhido", () => {
    const bookActivities = ["book-l1", "book-l2", "book-cp"];
    expect(isBookActivityUnlocked("book-l1", bookActivities, [], [])).toBe(true);
    expect(isBookActivityUnlocked("book-l2", bookActivities, [], [])).toBe(false);
    expect(isBookActivityUnlocked("book-l2", bookActivities, ["book-l1"], [])).toBe(true);
    expect(nextBookActivityId(bookActivities, ["book-l1"], [])).toBe("book-l2");
    expect(nextBookActivityId(bookActivities, ["book-l1", "book-l2"], ["book-cp"])).toBeUndefined();
  });

  it("libera cada livro somente após o checkpoint final do anterior", () => {
    for (let index = 1; index < journeyBooks.length; index += 1) {
      const current = journeyBooks[index];
      const previousBooks = journeyBooks.slice(0, index);
      const firstActivity = current.units[0].lessons[0].id;
      const completedLessons = previousBooks.flatMap((book) =>
        book.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id))
      );
      const completedCheckpoints = previousBooks.flatMap((book) =>
        book.units.map((unit) => unit.checkpoint.id)
      );
      expect(isJourneyActivityUnlocked(
        firstActivity,
        orderedActivityIds,
        completedLessons,
        completedCheckpoints.slice(0, -1)
      )).toBe(false);
      expect(isJourneyActivityUnlocked(
        firstActivity,
        orderedActivityIds,
        completedLessons,
        completedCheckpoints
      )).toBe(true);
    }
  });
});
