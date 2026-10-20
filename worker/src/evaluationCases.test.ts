import { describe, expect, it } from "vitest";
import { NOAH_EVALUATION_CASES } from "./evaluationCases";

describe("matriz editorial do Noah 2.0", () => {
  it("mantém pelo menos 30 cenários distribuídos pelas seis categorias", () => {
    expect(NOAH_EVALUATION_CASES).toHaveLength(30);
    const categories = new Set(NOAH_EVALUATION_CASES.map((item) => item.category));
    expect(categories).toEqual(
      new Set([
        "biblical-interpretation",
        "historical-context",
        "nazarene-doctrine",
        "koine-greek",
        "objective-exercise",
        "ambiguous-or-insufficient"
      ])
    );
    for (const item of NOAH_EVALUATION_CASES) {
      expect(item.required.length).toBeGreaterThan(0);
      expect(item.note.length).toBeGreaterThan(8);
    }
  });
});
