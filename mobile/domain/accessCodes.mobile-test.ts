import { describe, expect, it } from "vitest";
import { isFormationCode, isFormationUnlocked } from "./accessCodes";

describe("acesso à Formação Pastoral", () => {
  it("só libera com o código certo", () => {
    expect(isFormationCode("12345")).toBe(true);
    expect(isFormationCode(" 12345 ")).toBe(true);
    expect(isFormationCode("1234")).toBe(false);
    expect(isFormationCode("")).toBe(false);
  });
  it("fica oculta por padrão", () => {
    expect(isFormationUnlocked({})).toBe(false);
    expect(isFormationUnlocked({ formationUnlocked: true })).toBe(true);
  });
});
