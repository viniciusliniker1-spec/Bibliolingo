import { describe, expect, it } from "vitest";
import { classifySyncFailure, isRewardableSyncEvent, syncFailureMessage } from "./syncCore";

describe("mobile sync classification", () => {
  it("distinguishes network failures from backend failures", () => {
    expect(classifySyncFailure(new TypeError("Network request failed"))).toBe("offline");
    expect(classifySyncFailure(new Error("relation user_account_state does not exist"))).toBe("error");
    expect(syncFailureMessage(new Error("permission denied"))).toContain("permission denied");
  });

  it("identifies events whose Lumi reward must be committed atomically", () => {
    expect(isRewardableSyncEvent("lesson.completed")).toBe(true);
    expect(isRewardableSyncEvent("checkpoint.completed")).toBe(true);
    expect(isRewardableSyncEvent("achievement.unlocked")).toBe(true);
    expect(isRewardableSyncEvent("answer.recorded")).toBe(false);
  });
});
