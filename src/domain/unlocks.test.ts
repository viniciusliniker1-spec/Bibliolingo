import { describe, expect, it } from "vitest";
import { journeyBooks, orderedActivityIds } from "../content/catalog";
import {
  isCheckpointUnlocked,
  isJourneyActivityUnlocked,
  isLessonUnlocked,
  nextActivityId
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
