import { describe, expect, it } from "vitest";
import {
  assertPublicAuthConfig,
  getOAuthScopes,
  isEnabledFlag,
  parseAuthCallback
} from "./authCore";

describe("mobile auth callback", () => {
  it("reads Supabase tokens from the URL fragment", () => {
    expect(parseAuthCallback(
      "bibliolingo://auth/callback#access_token=access-123&refresh_token=refresh-456&expires_in=3600&type=recovery"
    )).toEqual({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      expiresAt: undefined,
      expiresIn: 3600,
      type: "recovery",
      error: undefined
    });
  });

  it("reads provider errors without creating a session", () => {
    expect(parseAuthCallback(
      "bibliolingo://auth/callback?error=access_denied&error_description=Login%20cancelado"
    ).error).toBe("Login cancelado");
  });

  it("requests only valid minimum Facebook scope", () => {
    expect(getOAuthScopes("facebook")).toBe("public_profile");
    expect(getOAuthScopes("facebook")).not.toContain("email");
    expect(getOAuthScopes("google")).toBe("openid email profile");
  });
});

describe("mobile auth configuration", () => {
  it("requires HTTPS and rejects administrative keys", () => {
    expect(() => assertPublicAuthConfig("http://example.test", "anon-key")).toThrow("HTTPS");
    expect(() => assertPublicAuthConfig("https://example.test", "service_role-secret")).toThrow("administrativa");
    expect(() => assertPublicAuthConfig("https://example.test", "publishable-key")).not.toThrow();
  });

  it("enables providers only through an explicit true value", () => {
    expect(isEnabledFlag("true")).toBe(true);
    expect(isEnabledFlag("TRUE")).toBe(true);
    expect(isEnabledFlag(undefined)).toBe(false);
    expect(isEnabledFlag("1")).toBe(false);
  });
});
