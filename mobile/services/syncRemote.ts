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
  const adaptive = event.eventType === "adaptive.preferences_updated";
  const rows = await parse<Array<{ server_sequence: number; accepted: boolean; total_xp: number }>>(
    await fetch(config.url + "/rest/v1/rpc/" + (adaptive ? "submit_adaptive_preference_event" : "submit_sync_event"), {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(adaptive ? {
        p_event_id: event.eventId,
        p_device_id: event.deviceId,
        p_platform: event.platform,
        p_payload: event.payload
      } : {
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
  const [stats, progress, achievements, active, answers, reviews] = await Promise.all([
    parse<Array<{ total_xp: number; current_streak: number; longest_streak: number; last_study_date?: string }>>(
      await fetch(config.url + `/rest/v1/user_stats?user_id=eq.${user}&select=total_xp,current_streak,longest_streak,last_study_date`, { headers: authHeaders })
    ),
    parse<Array<{ activity_id: string; activity_type: "lesson" | "checkpoint" }>>(
      await fetch(config.url + `/rest/v1/lesson_progress?user_id=eq.${user}&status=eq.completed&select=activity_id,activity_type`, { headers: authHeaders })
    ),
    parse<Array<{ achievement_id: string }>>(
      await fetch(config.url + `/rest/v1/user_achievements?user_id=eq.${user}&select=achievement_id`, { headers: authHeaders })
    ),
    parse<Array<{ activity_id: string; step_index: number; started_at: string; answers: Record<string, boolean> }>>(
      await fetch(config.url + `/rest/v1/active_progress?user_id=eq.${user}&select=activity_id,step_index,started_at,answers&order=updated_at.desc&limit=1`, { headers: authHeaders })
    ),
    parse<Array<{ question_id: string; is_correct: boolean; answered_at: string }>>(
      await fetch(config.url + `/rest/v1/answer_history?user_id=eq.${user}&select=question_id,is_correct,answered_at&order=answered_at.asc&limit=500`, { headers: authHeaders })
    ),
    parse<Array<{
      concept_id: string; question_id: string; memory_state: "learning" | "review" | "relearning";
      stability_days: number; difficulty_score: number; retrievability: number;
      repetitions: number; lapses: number; attempts: number; scheduled_days: number;
      due_at: string; last_reviewed_at: string; last_result: boolean;
    }>>(
      await fetch(config.url + `/rest/v1/concept_review_state?user_id=eq.${user}&select=concept_id,question_id,memory_state,stability_days,difficulty_score,retrievability,repetitions,lapses,attempts,scheduled_days,due_at,last_reviewed_at,last_result`, { headers: authHeaders })
    )
  ]);
  return {
    totalXp: Number(stats[0]?.total_xp ?? 0),
    currentStreak: Number(stats[0]?.current_streak ?? 0),
    longestStreak: Number(stats[0]?.longest_streak ?? 0),
    lastStudyDate: stats[0]?.last_study_date,
    completedLessonIds: progress.filter((item) => item.activity_type === "lesson").map((item) => item.activity_id),
    completedCheckpointIds: progress.filter((item) => item.activity_type === "checkpoint").map((item) => item.activity_id),
    earnedAchievementIds: achievements.map((item) => item.achievement_id),
    answerHistory: answers.map((item) => ({
      questionId: item.question_id,
      correct: item.is_correct,
      answeredAt: item.answered_at
    })),
    reviewItems: reviews.map((item) => ({
      conceptId: item.concept_id,
      questionId: item.question_id,
      dueDate: item.due_at.slice(0, 10),
      intervalIndex: Math.max(0, Math.round(Math.log2(Math.max(1, item.scheduled_days)))),
      lapses: item.lapses,
      lastResult: item.last_result ? "correct" : "incorrect",
      lastReviewedAt: item.last_reviewed_at,
      state: item.memory_state,
      stabilityDays: Number(item.stability_days),
      difficultyScore: Number(item.difficulty_score),
      retrievability: Number(item.retrievability),
      repetitions: item.repetitions,
      attempts: item.attempts,
      scheduledDays: item.scheduled_days
    })),
    activeSession: active[0] ? {
      activityId: active[0].activity_id,
      stepIndex: active[0].step_index,
      startedAt: active[0].started_at,
      answers: active[0].answers ?? {}
    } : undefined
  };
}
