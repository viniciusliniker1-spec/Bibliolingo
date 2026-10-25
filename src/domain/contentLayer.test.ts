import { describe, expect, it } from "vitest";
import { contentLayerLabel } from "./contentLayer";

describe("contentLayerLabel", () => {
  it("explica as quatro camadas editoriais sem misturá-las", () => {
    expect(contentLayerLabel("biblical-text")).toBe("Texto bíblico");
    expect(contentLayerLabel("history")).toBe("Contexto histórico");
    expect(contentLayerLabel("theology")).toBe("Interpretação");
    expect(contentLayerLabel("application")).toBe("Aplicação");
  });
});
