const rawUrl = process.env.SUPABASE_URL?.trim();
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

if (!rawUrl || !publishableKey) {
  throw new Error("Variáveis públicas do Supabase não foram configuradas.");
}

const parsed = new URL(rawUrl);
if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co") || parsed.pathname !== "/") {
  throw new Error("SUPABASE_URL deve ser a URL-base HTTPS, sem /rest/v1/.");
}
if (publishableKey.toLowerCase().includes("service_role")) {
  throw new Error("Uma chave service_role nunca pode ser usada no cliente.");
}

const headers = { apikey: publishableKey, "Content-Type": "application/json" };

const authResponse = await fetch(`${rawUrl}/auth/v1/settings`, { headers });
if (!authResponse.ok) {
  throw new Error(`Auth indisponível (HTTP ${authResponse.status}).`);
}
const authSettings = await authResponse.json();
if (authSettings.disable_signup === true) {
  throw new Error("Cadastro está desabilitado no Supabase Auth.");
}
if (authSettings.external && authSettings.external.email === false) {
  throw new Error("Login por e-mail está desabilitado no Supabase Auth.");
}
console.log("✓ Supabase Auth acessível; cadastro e provedor de e-mail habilitados.");

const tableResponse = await fetch(
  `${rawUrl}/rest/v1/user_stats?select=user_id&limit=1`,
  { headers }
);
if (tableResponse.status === 404) {
  throw new Error("Tabela user_stats não encontrada; aplique a migration.");
}
if (tableResponse.ok) {
  const rows = await tableResponse.json();
  if (!Array.isArray(rows) || rows.length !== 0) {
    throw new Error("RLS permitiu leitura anônima de dados privados.");
  }
} else if (![401, 403].includes(tableResponse.status)) {
  throw new Error(`Data API respondeu com HTTP ${tableResponse.status}.`);
}
console.log("✓ Data API acessível sem vazamento anônimo de user_stats.");

const rpcResponse = await fetch(`${rawUrl}/rest/v1/rpc/submit_sync_event`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    p_event_id: crypto.randomUUID(),
    p_device_id: crypto.randomUUID(),
    p_platform: "web",
    p_event_type: "profile.updated",
    p_payload: {},
    p_local_date: null,
    p_timezone: "America/Sao_Paulo"
  })
});
if (rpcResponse.status === 404) {
  throw new Error("RPC submit_sync_event não encontrada; aplique a migration completa.");
}
if (rpcResponse.ok) {
  throw new Error("RPC de sincronização aceitou uma chamada sem usuário autenticado.");
}
console.log(`✓ RPC existe e rejeitou acesso anônimo (HTTP ${rpcResponse.status}).`);
console.log("Smoke test concluído sem imprimir credenciais.");
