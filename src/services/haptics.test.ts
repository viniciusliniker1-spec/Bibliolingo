import { describe, expect, it } from "vitest";
import { HAPTIC_PATTERNS } from "./haptics";

describe("feedback tátil", () => {
  it("usa pulsos breves e diferentes para acerto e erro", () => {
    expect(HAPTIC_PATTERNS.correct).toEqual([24]);
    expect(HAPTIC_PATTERNS.incorrect).toEqual([45, 35, 45]);
    expect(HAPTIC_PATTERNS.incorrect).not.toEqual(HAPTIC_PATTERNS.correct);
  });
});
