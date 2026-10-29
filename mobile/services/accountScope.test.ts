import { describe, expect, it } from "vitest";
import { normalizeStorageOwner, scopedStorageKey, storageClaimKey } from "./accountScope";

describe("account scoped mobile storage", () => {
  it("keeps guest data on the legacy key", () => {
    expect(scopedStorageKey("@bibliolingo/progress/v1")).toBe("@bibliolingo/progress/v1");
  });

  it("isolates each authenticated account", () => {
    expect(scopedStorageKey("@bibliolingo/progress/v1", "user-a"))
      .toBe("@bibliolingo/progress/v1/account/user-a");
    expect(scopedStorageKey("@bibliolingo/progress/v1", "user-b"))
      .not.toBe(scopedStorageKey("@bibliolingo/progress/v1", "user-a"));
  });

  it("does not accept an empty owner and keeps a separate claim marker", () => {
    expect(normalizeStorageOwner("   ")).toBeUndefined();
    expect(storageClaimKey("@bibliolingo/progress/v1"))
      .toBe("@bibliolingo/progress/v1/legacy-claim/v1");
  });
});
