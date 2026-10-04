import { describe, expect, it } from "vitest";
import { exodusUnits, genesisUnits, orderedActivityIds } from "../content/catalog";
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

  it("libera Êxodo somente depois do checkpoint final de Gênesis", () => {
    const firstExodus = exodusUnits[0].lessons[0].id;
    const genesisLessons = genesisUnits.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
    const genesisCheckpoints = genesisUnits.map((unit) => unit.checkpoint.id);
    expect(
      isJourneyActivityUnlocked(
        firstExodus,
        orderedActivityIds,
        genesisLessons,
        genesisCheckpoints.slice(0, -1)
      )
    ).toBe(false);
    expect(
      isJourneyActivityUnlocked(
        firstExodus,
        orderedActivityIds,
        genesisLessons,
        genesisCheckpoints
      )
    ).toBe(true);
  });
});
