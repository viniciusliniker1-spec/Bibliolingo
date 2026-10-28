import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("expo-linking", () => ({ clearInitialURL: vi.fn(), getLinkingURL: vi.fn(() => null) }));
vi.mock("expo-local-authentication", () => ({}));
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "device-only"
}));
vi.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn()
}));

import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import {
  completeMobileAuthCallback, getMobileAuthRedirectUrl, saveSecureSession, signInWithOAuth
} from "./auth";
import { authCallbackInbox } from "./authCallbackInbox";

const callback = "bibliolingo://auth/callback#access_token=test-access&refresh_token=test-refresh&expires_in=3600";

beforeEach(() => {
  vi.clearAllMocks();
  authCallbackInbox.clear();
  vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
  vi.stubEnv("EXPO_PUBLIC_AUTH_GOOGLE_ENABLED", "true");
  vi.stubEnv("EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED", "false");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  authCallbackInbox.clear();
});

describe("Google browser return and backend session", () => {
  it("uses the existing registered redirect and returns raw credentials for a single shared completion", async () => {
    vi.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: "success", url: callback });
    expect(getMobileAuthRedirectUrl()).toBe("bibliolingo://auth/callback");
    expect(await signInWithOAuth("google")).toBe(callback);
    const args = vi.mocked(WebBrowser.openAuthSessionAsync).mock.calls[0];
    const url = new URL(args[0]);
    expect(url.origin).toBe("https://project.supabase.co");
    expect(url.searchParams.get("provider")).toBe("google");
    expect(url.searchParams.get("redirect_to")).toBe(getMobileAuthRedirectUrl());
    expect(url.searchParams.get("scopes")).toBe("openid email profile");
    expect(args[1]).toBe(getMobileAuthRedirectUrl());
  });

  it("opens only one browser session for concurrent taps", async () => {
    vi.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: "success", url: callback });
    const first = signInWithOAuth("google");
    const second = signInWithOAuth("google");
    expect(first).toBe(second);
    await Promise.all([first, second]);
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledTimes(1);
  });

  it("accepts Android's late callback after browser dismissal", async () => {
    vi.useFakeTimers();
    vi.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: "dismiss" });
    const login = signInWithOAuth("google");
    setTimeout(() => authCallbackInbox.capture(callback), 200);
    await vi.advanceTimersByTimeAsync(200);
    expect(await login).toBe(callback);
  });

  it("does not treat a previously captured return as a new login", async () => {
    vi.useFakeTimers();
    authCallbackInbox.capture(callback);
    vi.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: "cancel" });
    const login = signInWithOAuth("google");
    const rejected = expect(login).rejects.toThrow("Login cancelado");
    await vi.advanceTimersByTimeAsync(1500);
    await rejected;
  });

  it("verifies identity with Supabase before storing tokens", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "verified-user", email: "student@example.test" })));
    vi.stubGlobal("fetch", fetchMock);
    const completed = await completeMobileAuthCallback(callback);
    expect(completed.session.user.id).toBe("verified-user");
    expect(fetchMock.mock.calls[0][0]).toBe("https://project.supabase.co/auth/v1/user");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer test-access");
    await saveSecureSession(completed.session);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "bibliolingo.auth.session.v1", expect.stringContaining("verified-user"), expect.any(Object)
    );
  });

  it("rejects invalid server sessions without saving or accepting old credentials", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 })));
    await expect(completeMobileAuthCallback(callback)).rejects.toThrow("Invalid token");
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("preserves recovery context after server confirmation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "verified-user" }))));
    expect((await completeMobileAuthCallback(callback + "&type=recovery")).type).toBe("recovery");
  });

  it("rejects foreign callbacks, empty payloads and unsupported code flow without backend calls", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(completeMobileAuthCallback("https://evil.test/auth/callback#access_token=x")).rejects.toThrow("não pertence");
    await expect(completeMobileAuthCallback("bibliolingo://auth/callback")).rejects.toThrow("sessão válida");
    await expect(completeMobileAuthCallback("bibliolingo://auth/callback?code=test")).rejects.toThrow("outro fluxo");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces provider rejection without requesting a session", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(completeMobileAuthCallback("bibliolingo://auth/callback?error_description=Acesso%20negado")).rejects.toThrow("Acesso negado");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("bounds a stalled backend verification", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal!.addEventListener("abort", () => reject(new Error("aborted")));
    })));
    const result = expect(completeMobileAuthCallback(callback)).rejects.toThrow("demorou");
    await vi.advanceTimersByTimeAsync(20_000);
    await result;
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
