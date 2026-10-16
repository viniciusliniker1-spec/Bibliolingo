import type { AuthConfiguration, AuthSession } from "../auth/supabaseAuth";
import type { RemoteProgressProjection, SyncEvent } from "./types";

interface StatsRow {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
}

interface ProgressRow {
  activity_id: string;
  activity_type: "lesson" | "checkpoint";
  status: "completed" | "failed" | "in_progress";
}

interface AchievementRow {
  achievement_id: string;
}

interface ActiveRow {
  activity_id: string;
  step_index: number;
  started_at: string;
  answers: Record<string, boolean>;
}

async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => undefined) as T | { message?: string } | undefined;
  if (!response.ok) {
    throw new Error((data as { message?: string } | undefined)?.message ?? "Falha na sincronização.");
  }
  return data as T;
}

function headers(config: AuthConfiguration, session: AuthSession) {
  return {
    apikey: config.publishableKey,
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json"
  };
}

export async function submitEvent(
  config: AuthConfiguration,
  session: AuthSession,
  event: SyncEvent
) {
  const rows = await json<Array<{ server_sequence: number; accepted: boolean; total_xp: number }>>(
    await fetch(`${config.url}/rest/v1/rpc/submit_sync_event`, {
      method: "POST",
      headers: headers(config, session),
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

export async function fetchRemoteProgress(
  config: AuthConfiguration,
  session: AuthSession
): Promise<RemoteProgressProjection> {
  const common = { headers: headers(config, session) };
  const user = encodeURIComponent(session.user.id);
  const [stats, progress, achievements, active] = await Promise.all([
    json<StatsRow[]>(await fetch(
      `${config.url}/rest/v1/user_stats?user_id=eq.${user}&select=total_xp,current_streak,longest_streak,last_study_date`,
      common
    )),
    json<ProgressRow[]>(await fetch(
      `${config.url}/rest/v1/lesson_progress?user_id=eq.${user}&status=eq.completed&select=activity_id,activity_type,status`,
      common
    )),
    json<AchievementRow[]>(await fetch(
      `${config.url}/rest/v1/user_achievements?user_id=eq.${user}&select=achievement_id`,
      common
    )),
    json<ActiveRow[]>(await fetch(
      `${config.url}/rest/v1/active_progress?user_id=eq.${user}&select=activity_id,step_index,started_at,answers&order=updated_at.desc&limit=1`,
      common
    ))
  ]);
  const current = stats[0];
  return {
    totalXp: Number(current?.total_xp ?? 0),
    currentStreak: Number(current?.current_streak ?? 0),
    longestStreak: Number(current?.longest_streak ?? 0),
    lastStudyDate: current?.last_study_date,
    completedLessonIds: progress.filter((item) => item.activity_type === "lesson").map((item) => item.activity_id),
    completedCheckpointIds: progress.filter((item) => item.activity_type === "checkpoint").map((item) => item.activity_id),
    earnedAchievementIds: achievements.map((item) => item.achievement_id),
    activeSession: active[0] ? {
      activityId: active[0].activity_id,
      stepIndex: active[0].step_index,
      startedAt: active[0].started_at,
      answers: active[0].answers ?? {}
    } : undefined
  };
}
