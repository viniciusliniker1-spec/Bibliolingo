import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { migrateState } from "./migrations";

describe("migrations", () => {
  it("preserva progresso ao migrar estado legado", () => {
    const migrated = migrateState({
      ...initialState,
      schemaVersion: 0,
      xp: 420,
      completedLessonIds: ["genesis-u01-l01"]
    });
    expect(migrated?.schemaVersion).toBe(1);
    expect(migrated?.xp).toBe(420);
    expect(migrated?.completedLessonIds).toContain("genesis-u01-l01");
  });

  it("rejeita versão desconhecida", () => {
    expect(migrateState({ schemaVersion: 99 })).toBeUndefined();
  });
});
