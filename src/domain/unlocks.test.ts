import { describe, expect, it } from "vitest";
import { isCheckpointUnlocked, isLessonUnlocked, nextActivityId } from "./unlocks";

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
});
