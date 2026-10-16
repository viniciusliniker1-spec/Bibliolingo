import { describe, expect, it } from "vitest";

import migration from "../../supabase/migrations/202610160001_auth_sync.sql?raw";

describe("schema remoto de progresso", () => {
  it("habilita RLS em todas as tabelas privadas", () => {
    const tables = [
      "profiles", "devices", "sync_events", "user_stats", "study_days",
      "lesson_progress", "answer_history", "user_achievements",
      "active_progress", "legacy_imports"
    ];
    for (const table of tables) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toMatch(new RegExp(`on public\\.${table}\\s+for select`));
    }
  });

  it("deriva o usuário da sessão e não aceita user_id do cliente na RPC", () => {
    expect(migration).toContain("v_user_id uuid := auth.uid()");
    expect(migration).not.toMatch(/submit_sync_event\s*\([^)]*p_user_id/is);
  });

  it("mantém eventos idempotentes e restringe funções privilegiadas", () => {
    expect(migration).toContain("event_id uuid primary key");
    expect(migration).toContain("on conflict (event_id) do nothing");
    expect(migration).toContain("revoke all on function public.submit_sync_event");
    expect(migration).toContain("to authenticated");
  });
});
