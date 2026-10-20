import { describe, expect, it } from "vitest";
import { NoahUnavailableError, validateNoahQuestion } from "./noahRemote";

describe("cliente seguro do Noah", () => {
  it("limpa controles e preserva caracteres gregos", () => {
    expect(validateNoahQuestion("  Explique λόγος\u0000  ")).toBe("Explique λόγος");
  });
  it("rejeita pergunta vazia e excessiva", () => {
    expect(() => validateNoahQuestion("   ")).toThrow(NoahUnavailableError);
    expect(() => validateNoahQuestion("a".repeat(1201))).toThrow("1.200");
  });
});
