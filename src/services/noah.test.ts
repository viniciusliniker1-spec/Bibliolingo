import { describe, expect, it } from "vitest";
import { buildNoahPrompt } from "./noah";

describe("Noah", () => {
  it("gera prompt contextualizado sem depender de API", () => {
    const prompt = buildNoahPrompt("connections", {
      title: "Deus tornou em bem",
      reference: "Gênesis 50:15–26"
    });
    expect(prompt).toContain("Gênesis 50:15–26");
    expect(prompt).toContain("Deus tornou em bem");
    expect(prompt).toContain("perspectiva wesleyana/arminiana");
    expect(prompt).toContain("conexões canônicas");
  });
});
