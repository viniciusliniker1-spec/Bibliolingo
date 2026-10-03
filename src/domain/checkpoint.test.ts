import { describe, expect, it } from "vitest";
import { checkpointPassed } from "./checkpoint";

describe("checkpoint", () => {
  it("exige a precisão configurada", () => {
    expect(checkpointPassed(6, 8, 0.75)).toBe(true);
    expect(checkpointPassed(5, 8, 0.75)).toBe(false);
    expect(checkpointPassed(0, 0, 0.75)).toBe(false);
  });
});
