import { describe, expect, it } from "vitest";
import { FORMATION_ACCESS_CODE, isValidFormationAccessCode } from "./FormationAccessGate";

describe("acesso à Formação Pastoral Nazarena", () => {
  it("aceita somente a senha configurada", () => {
    expect(FORMATION_ACCESS_CODE).toBe("12345");
    expect(isValidFormationAccessCode("12345")).toBe(true);
    expect(isValidFormationAccessCode("1234")).toBe(false);
    expect(isValidFormationAccessCode("54321")).toBe(false);
  });
});
