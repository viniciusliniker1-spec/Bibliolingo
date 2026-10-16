import { getMobileAuthConfig, type MobileAuthSession } from "./auth";
import type { RemoteProgressProjection, SyncEvent } from "../../src/sync/types";

function headers(session: MobileAuthSession) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("Sincronização ainda não configurada.");
  return {
    config,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  };
}

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => undefined) as T | { message?: string } | undefined;
  if (!response.ok) throw new Error((data as { message?: string } | undefined)?.message ?? "Falha na sincronização.");
  return data as T;
}

export async function submitMobileSyncEvent(session: MobileAuthSession, event: SyncEvent) {
  const { config, headers: authHeaders } = headers(session);
  const rows = await parse<Array<{ server_sequence: number; accepted: boolean; total_xp: number }>>(
    await fetch(config.url + "/rest/v1/rpc/submit_sync_event", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        p_event_id: event.eventId,
        p_device_id: event.deviceId,
        p_platform: event.platform,
        p_event_type: event.eventType,
        p_payload: event.payload,
        p_local_date: event.localDate ?? null,
        p_timezone: event.timezone ?? null
      })
    })
  );
  if (!rows[0]) throw new Error("O servidor não confirmou o evento.");
  return rows[0];
}

export async function fetchMobileRemoteProgress(session: MobileAuthSession): Promise<RemoteProgressProjection> {
  const { config, headers: authHeaders } = headers(session);
  const user = encodeURIComponent(session.user.id);
  const [stats, progress, achievements, active] = await Promise.all([
    parse<Array<{ total_xp: number; current_streak: number; longest_streak: number; last_study_date?: string }>>(
      await fetch(config.url + `/rest/v1/user_stats?user_id=eq.${user}&select=total_xp,current_streak,longest_streak,last_study_date`, { headers: authHeaders })
    ),
    parse<Array<{ activity_id: string; activity_type: "lesson" | "checkpoint" }>>(
      await fetch(config.url + `/rest/v1/lesson_progress?user_id=eq.${user}&status=eq.completed&select=activity_id,activity_type`, { headers: authHeaders })
    ),
    parse<Array<{ achievement_id: string }>>(
      await fetch(config.url + `/rest/v1/user_achievements?user_id=eq.${user}&select=achievement_id`, { headers: authHeaders })
    )
  ]);
  return {
    totalXp: Number(stats[0]?.total_xp ?? 0),
    currentStreak: Number(stats[0]?.current_streak ?? 0),
    longestStreak: Number(stats[0]?.longest_streak ?? 0),
    lastStudyDate: stats[0]?.last_study_date,
    completedLessonIds: progress.filter((item) => item.activity_type === "lesson").map((item) => item.activity_id),
    completedCheckpointIds: progress.filter((item) => item.activity_type === "checkpoint").map((item) => item.activity_id),
    earnedAchievementIds: achievements.map((item) => item.achievement_id)
  };
}
