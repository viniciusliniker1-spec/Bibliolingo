import { afterEach, describe, expect, it, vi } from "vitest";
import { SupabaseAuthApi } from "./supabaseAuth";

const api = new SupabaseAuthApi({
  url: "https://example.supabase.co",
  publishableKey: "public-test-key",
  googleEnabled: false,
  facebookEnabled: false
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SupabaseAuthApi", () => {
  it("cria uma sessão somente quando o servidor devolve tokens e usuário", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
      user: { id: "user-1", email: "aluno@example.com" }
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", request);

    const session = await api.signIn("aluno@example.com", "senha-segura");
    expect(session.user.id).toBe("user-1");
    expect(session.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(request).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/token?grant_type=password",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("propaga a mensagem segura retornada pela autenticação", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: "Credenciais inválidas"
    }), { status: 400, headers: { "Content-Type": "application/json" } })));

    await expect(api.signIn("aluno@example.com", "incorreta"))
      .rejects.toThrow("Credenciais inválidas");
  });

  it("envia o token somente no cabeçalho ao excluir a própria conta", async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", request);
    await api.deleteAccount("access-token");
    const options = request.mock.calls[0][1] as RequestInit;
    expect(options.headers).toMatchObject({
      Authorization: "Bearer access-token",
      apikey: "public-test-key"
    });
    expect(JSON.stringify(options)).not.toContain("service_role");
  });
});
