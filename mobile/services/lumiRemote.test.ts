import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("expo-file-system", () => ({ File: class {} }));
vi.mock("./auth", () => ({
  getMobileAuthConfig: () => ({ url: "https://project.supabase.co", publishableKey: "test-key" })
}));
import { purchaseMobileLumiItem } from "./lumiRemote";

const session = { access_token: "test-token", refresh_token: "refresh", expires_at: 9999999999, user: { id: "student-a" } };
const owned = [{ item_id: "lumi_oculos", acquired_at: "2026-10-28T00:00:00Z", acquisition_type: "purchase" }];
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("confirmed Lumi purchase", () => {
  it("returns authoritative wallet and inventory after a successful transaction", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response([{ balance: 50, acquired: true }])).mockResolvedValueOnce(response(owned));
    vi.stubGlobal("fetch", fetchMock);
    const receipt = await purchaseMobileLumiItem(session, "lumi_oculos");
    expect(receipt.balance).toBe(50);
    expect(receipt.inventoryEntry.itemId).toBe("lumi_oculos");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.p_item_id).toBe("lumi_oculos");
    expect(body).not.toHaveProperty("balance");
    expect(fetchMock.mock.calls[1][0]).toContain("user_id=eq.student-a&item_id=eq.lumi_oculos");
  });

  it("accepts an already-owned item without a second debit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response([{ balance: 50, acquired: false }])).mockResolvedValueOnce(response(owned)));
    const receipt = await purchaseMobileLumiItem(session, "lumi_oculos");
    expect(receipt.acquired).toBe(false);
    expect(receipt.inventoryEntry.itemId).toBe("lumi_oculos");
  });

  it("rejects the legacy false-success response when the skin is not owned", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response([{ balance: 150, acquired: false }])).mockResolvedValueOnce(response([])));
    await expect(purchaseMobileLumiItem(session, "lumi_oculos")).rejects.toThrow("inventário");
  });

  it("rejects an empty receipt instead of resetting the button silently", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
    await expect(purchaseMobileLumiItem(session, "lumi_oculos")).rejects.toThrow("não confirmou");
  });

  it.each([
    ["insufficient-lumi-coins", "Saldo insuficiente"],
    ["item-locked", "bloqueado"],
    ['column reference "balance" is ambiguous', "LOJA-42702"]
  ])("surfaces %s without reporting success", async (serverMessage, expected) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ message: serverMessage }, 400)));
    await expect(purchaseMobileLumiItem(session, "lumi_oculos")).rejects.toThrow(expected);
  });

  it("does not spin forever when the transaction response is lost", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal!.addEventListener("abort", () => reject(new Error("aborted")));
    })));
    const failure = expect(purchaseMobileLumiItem(session, "lumi_oculos")).rejects.toThrow("não será cobrada duas vezes");
    await vi.advanceTimersByTimeAsync(20_000);
    await failure;
  });
});
