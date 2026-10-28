import { afterEach, describe, expect, it, vi } from "vitest";
import { authCallbackInbox, createAuthCallbackInbox } from "./authCallbackInbox";
import { redirectSystemPath } from "../app/+native-intent";

const callback = "bibliolingo://auth/callback#access_token=test-access&refresh_token=test-refresh";
afterEach(() => { authCallbackInbox.clear(); vi.useRealTimers(); });

describe("native OAuth return delivery", () => {
  it.each([true, false])("captures raw callback before route mount (initial=%s)", (initial) => {
    expect(redirectSystemPath({ path: callback, initial })).toBe("/auth/callback");
    expect(authCallbackInbox.get()?.url).toBe(callback);
    expect(authCallbackInbox.get()?.id).toBeGreaterThan(0);
  });

  it("preserves non-auth navigation and rejects foreign callbacks", () => {
    expect(redirectSystemPath({ path: "bibliolingo://book/genesis", initial: false })).toBe("bibliolingo://book/genesis");
    expect(authCallbackInbox.capture("https://evil.test/auth/callback#access_token=x")).toBeUndefined();
    expect(authCallbackInbox.get()).toBeUndefined();
  });

  it("does not overwrite a captured callback with the sanitized route", () => {
    const inbox = createAuthCallbackInbox<void>();
    inbox.capture(callback);
    expect(inbox.capture("/auth/callback")).toBeUndefined();
    expect(inbox.get()?.url).toBe(callback);
  });

  it("verifies and persists only once when browser, provider and screen receive the same URL", async () => {
    const inbox = createAuthCallbackInbox<string>();
    const persist = vi.fn(async () => "confirmed-user");
    const first = inbox.complete(callback, persist);
    const second = inbox.complete(callback, persist);
    const third = inbox.complete(callback, persist);
    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(await first).toBe("confirmed-user");
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("does not resolve completion before the session is persisted", async () => {
    const inbox = createAuthCallbackInbox<string>();
    let saved!: () => void;
    const storage = new Promise<void>((resolve) => { saved = resolve; });
    let done = false;
    const completion = inbox.complete(callback, async () => { await storage; return "saved"; });
    void completion.then(() => { done = true; });
    await Promise.resolve();
    expect(done).toBe(false);
    saved();
    expect(await completion).toBe("saved");
  });

  it("shares backend failure with all consumers instead of accepting an old session", async () => {
    const inbox = createAuthCallbackInbox<string>();
    const verify = vi.fn(async () => { throw new Error("server rejected"); });
    const first = inbox.complete(callback, verify);
    const second = inbox.complete(callback, verify);
    await expect(first).rejects.toThrow("server rejected");
    await expect(second).rejects.toThrow("server rejected");
    expect(verify).toHaveBeenCalledTimes(1);
  });

  it("expires retained credentials and clears the previous attempt", () => {
    let time = 1;
    const inbox = createAuthCallbackInbox<void>(() => time, 100);
    const previous = inbox.capture(callback)!;
    time = 101;
    expect(inbox.get()).toBeUndefined();
    expect(inbox.capture(callback)!.id).not.toBe(previous.id);
    inbox.clear();
    expect(inbox.get()).toBeUndefined();
  });

  it("receives a callback delivered after the browser reports dismissal", async () => {
    vi.useFakeTimers();
    const inbox = createAuthCallbackInbox<void>();
    const waiting = inbox.wait(1500);
    setTimeout(() => inbox.capture(callback), 200);
    await vi.advanceTimersByTimeAsync(200);
    expect((await waiting)?.url).toBe(callback);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("has bounded waiting when no callback arrives", async () => {
    vi.useFakeTimers();
    const inbox = createAuthCallbackInbox<void>();
    const waiting = inbox.wait(1500);
    await vi.advanceTimersByTimeAsync(1500);
    expect(await waiting).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("retains provider errors and password recovery callbacks", () => {
    const inbox = createAuthCallbackInbox<void>();
    expect(inbox.capture("bibliolingo://auth/callback?error=access_denied")?.url).toContain("access_denied");
    inbox.clear();
    expect(inbox.capture(callback + "&type=recovery")?.url).toContain("type=recovery");
  });
});
