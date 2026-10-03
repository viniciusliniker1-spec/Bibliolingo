import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { parseBackup, serializeBackup } from "./backup";

describe("backup", () => {
  it("exporta e importa sem perder o estado", () => {
    const state = { ...initialState, xp: 125 };
    expect(parseBackup(serializeBackup(state)).xp).toBe(125);
  });

  it("rejeita arquivo inválido antes de substituir dados", () => {
    expect(() => parseBackup('{"app":"outro"}')).toThrow();
    expect(() => parseBackup("não é json")).toThrow();
  });
});
