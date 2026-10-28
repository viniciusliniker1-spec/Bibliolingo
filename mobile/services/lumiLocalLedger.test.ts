import { beforeEach, describe, expect, it, vi } from "vitest";
const storage = vi.hoisted(() => new Map<string, string>());
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { storage.delete(key); })
  }
}));
import { addPendingLumiCredit, clearPendingLumiCredits, loadPendingLumiCredits, pendingLumiTotal } from "./lumiLocalLedger";
beforeEach(() => storage.clear());

describe("offline Lumi credits", () => {
  it("does not lose concurrent educational rewards", async () => {
    await Promise.all([addPendingLumiCredit("a", "lesson-1", 5), addPendingLumiCredit("a", "checkpoint-1", 25)]);
    expect(pendingLumiTotal(await loadPendingLumiCredits("a"))).toBe(30);
  });
  it("does not duplicate the same local event", async () => {
    await Promise.all([addPendingLumiCredit("a", "lesson-1", 5), addPendingLumiCredit("a", "lesson-1", 5)]);
    expect(pendingLumiTotal(await loadPendingLumiCredits("a"))).toBe(5);
  });
  it("retains newer rewards when an older batch is acknowledged", async () => {
    await addPendingLumiCredit("a", "lesson-1", 5);
    const sources = Object.keys((await loadPendingLumiCredits("a")).credits);
    await Promise.all([addPendingLumiCredit("a", "lesson-2", 5), clearPendingLumiCredits("a", sources)]);
    expect((await loadPendingLumiCredits("a")).credits).toEqual({ "lesson-2": 5 });
  });
  it("isolates accounts", async () => {
    await addPendingLumiCredit("a", "lesson-1", 5);
    await addPendingLumiCredit("b", "lesson-2", 5);
    await clearPendingLumiCredits("a", ["lesson-1"]);
    expect(pendingLumiTotal(await loadPendingLumiCredits("b"))).toBe(5);
  });
});
