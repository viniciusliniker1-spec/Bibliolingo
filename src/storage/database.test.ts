import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { initialState } from "../state/initialState";
import { loadState, saveState } from "./database";

describe("IndexedDB repository", () => {
  it("persiste e restaura o progresso estruturado", async () => {
    await saveState({ ...initialState, xp: 75, storageRevision: 2 });
    const restored = await loadState();
    expect(restored?.xp).toBe(75);
    expect(restored?.storageRevision).toBe(2);
  });
});
