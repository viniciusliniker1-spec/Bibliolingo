import { describe,expect,it } from "vitest";
import sql from "../../supabase/migrations/202610180004_pedagogical_missions.sql?raw";
describe("schema de missões",()=>{
 it("isola dados por usuário autenticado",()=>{expect(sql).toContain("auth.uid())=user_id");expect(sql).toContain("enable row level security");});
 it("deduplica envios e eventos pedagógicos entre dispositivos",()=>{expect(sql).toContain("unique(user_id,event_id)");expect(sql).toContain("mission_events_user_payload_id");expect(sql).toContain("on conflict do nothing");});
 it("valida transições terminais e conclusão",()=>{expect(sql).toContain("Mission already terminal");expect(sql).toContain("Mission target not reached");expect(sql).toContain("Mission assignment not found");});
 it("não concede XP",()=>expect(sql).not.toMatch(/update\s+public\.user_stats/i));});
