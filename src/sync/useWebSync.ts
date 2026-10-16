import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getWebAuthConfiguration } from "../auth/supabaseAuth";
import { toLocalDateKey } from "../domain/streak";
import type { AppState } from "../types/progress";
import {
  createSyncEvent,
  enqueueSyncEvent,
  hasMeaningfulLocalProgress,
  mergeProgressProjection,
  progressFingerprint
} from "./engine";
import { fetchRemoteProgress, submitEvent } from "./remote";
import { getWebDeviceId, loadSyncMetadata, saveSyncMetadata } from "./webStorage";
import type {
  CommonProgressProjection,
  SyncConnectionState,
  SyncEvent,
  SyncMetadata
} from "./types";

export type SyncableAction = {
  type: string;
  lessonId?: string;
  stepIndex?: number;
  questionId?: string;
  correct?: boolean;
  mode?: string;
  checkpoint?: boolean;
};

function projection(state: AppState): CommonProgressProjection {
  return {
    xp: state.xp,
    streak: state.streak,
    bestStreak: state.bestStreak,
    lastStudyDate: state.lastStudyDate,
    completedLessonIds: state.completedLessonIds,
    completedCheckpointIds: state.completedCheckpointIds,
    perfectLessonIds: state.perfectLessonIds,
    earnedAchievementIds: state.earnedAchievementIds,
    incorrectQuestionIds: state.attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.questionId)
  };
}

const EMPTY_METADATA: SyncMetadata = {
  cursor: { lastServerSequence: 0 },
  pendingEvents: [],
  status: "local-only"
};

export function useWebSync(
  state: AppState,
  ready: boolean,
  applyRemoteState: (state: AppState) => void
) {
  const { session } = useAuth();
  const config = getWebAuthConfiguration();
  const [metadata, setMetadata] = useState<SyncMetadata>(EMPTY_METADATA);
  const [metadataReady, setMetadataReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncConnectionState>("local-only");
  const [migrationRequired, setMigrationRequired] = useState(false);
  const stateRef = useRef(state);
  const syncingRef = useRef(false);
  const remoteXpRef = useRef(0);
  const knownAchievements = useRef<Set<string>>();

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    let active = true;
    loadSyncMetadata().then((stored) => {
      if (!active) return;
      setMetadata(stored);
      setMetadataReady(true);
    }).catch(() => setSyncStatus("error"));
    return () => { active = false; };
  }, []);

  const queueEvent = useCallback(async (
    eventType: SyncEvent["eventType"],
    payload: Record<string, unknown>
  ) => {
    const now = new Date();
    const event = createSyncEvent({
      deviceId: await getWebDeviceId(),
      platform: "web",
      eventType,
      payload,
      localDate: toLocalDateKey(now),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const latest = await loadSyncMetadata();
    const next: SyncMetadata = {
      ...latest,
      pendingEvents: enqueueSyncEvent(latest.pendingEvents, event),
      status: session ? "syncing" : "local-only"
    };
    await saveSyncMetadata(next);
    setMetadata(next);
  }, [session]);

  const recordAction = useCallback((action: SyncableAction) => {
    const current = stateRef.current;
    if (action.type === "START_SESSION" && action.lessonId) {
      void queueEvent("active_session.updated", {
        activity_id: action.lessonId,
        step_index: 0,
        started_at: new Date().toISOString(),
        answers: {}
      });
      return;
    }
    if (action.type === "SET_STEP" && current.activeSession && typeof action.stepIndex === "number") {
      void queueEvent("active_session.updated", {
        activity_id: current.activeSession.lessonId,
        step_index: action.stepIndex,
        started_at: current.activeSession.startedAt,
        answers: current.activeSession.answers
      });
      return;
    }
    if (action.type === "ANSWER" && action.lessonId && action.questionId) {
      void queueEvent("answer.recorded", {
        lesson_id: action.lessonId,
        question_id: action.questionId,
        is_correct: Boolean(action.correct),
        mode: action.mode,
        answered_at: new Date().toISOString()
      });
      return;
    }
    if (action.type === "FINISH" && action.lessonId && current.activeSession) {
      const answers = Object.values(current.activeSession.answers);
      if (answers.length > 0) {
        void queueEvent(action.checkpoint ? "checkpoint.completed" : "lesson.completed", {
          activity_id: action.lessonId,
          total: answers.length,
          correct: answers.filter(Boolean).length
        });
      }
    }
  }, [queueEvent]);

  useEffect(() => {
    if (!ready) return;
    if (!knownAchievements.current) {
      knownAchievements.current = new Set(state.earnedAchievementIds);
      return;
    }
    state.earnedAchievementIds
      .filter((id) => !knownAchievements.current?.has(id))
      .forEach((achievementId) => {
        knownAchievements.current?.add(achievementId);
        void queueEvent("achievement.unlocked", { achievement_id: achievementId });
      });
  }, [queueEvent, ready, state.earnedAchievementIds]);

  const syncNow = useCallback(async () => {
    if (!session || !config || !metadataReady || syncingRef.current) return;
    if (!navigator.onLine) {
      setSyncStatus("offline");
      return;
    }
    syncingRef.current = true;
    setSyncStatus("syncing");
    try {
      let nextMetadata = await loadSyncMetadata();
      for (const event of nextMetadata.pendingEvents) {
        const confirmation = await submitEvent(config, session, event);
        nextMetadata = {
          ...nextMetadata,
          cursor: {
            lastServerSequence: Math.max(
              nextMetadata.cursor.lastServerSequence,
              Number(confirmation.server_sequence ?? 0)
            ),
            lastSyncedAt: new Date().toISOString()
          },
          pendingEvents: nextMetadata.pendingEvents.filter((item) => item.eventId !== event.eventId),
          status: "syncing"
        };
        await saveSyncMetadata(nextMetadata);
      }

      const remote = await fetchRemoteProgress(config, session);
      remoteXpRef.current = remote.totalXp;
      const current = stateRef.current;
      const local = projection(current);
      const merged = mergeProgressProjection(local, remote);
      const useRemoteSession = Boolean(remote.activeSession && (
        !current.activeSession
        || (
          current.activeSession.lessonId === remote.activeSession.activityId
          && remote.activeSession.stepIndex > current.activeSession.stepIndex
        )
      ));
      if (merged.changed || useRemoteSession) {
        applyRemoteState({
          ...current,
          xp: merged.merged.xp,
          streak: merged.merged.streak,
          bestStreak: merged.merged.bestStreak,
          lastStudyDate: merged.merged.lastStudyDate,
          completedLessonIds: merged.merged.completedLessonIds,
          completedCheckpointIds: merged.merged.completedCheckpointIds,
          perfectLessonIds: merged.merged.perfectLessonIds,
          earnedAchievementIds: merged.merged.earnedAchievementIds,
          activeSession: useRemoteSession ? {
            lessonId: remote.activeSession!.activityId,
            stepIndex: remote.activeSession!.stepIndex,
            startedAt: remote.activeSession!.startedAt,
            answers: remote.activeSession!.answers
          } : current.activeSession
        });
      }
      setMigrationRequired(
        hasMeaningfulLocalProgress(local)
        && (local.xp > remote.totalXp || merged.localOnlyCount > 0)
      );
      nextMetadata = { ...nextMetadata, status: "synced", lastError: undefined };
      await saveSyncMetadata(nextMetadata);
      setMetadata(nextMetadata);
      setSyncStatus("synced");
    } catch (error) {
      const next: SyncMetadata = {
        ...(await loadSyncMetadata()),
        status: navigator.onLine ? "error" : "offline",
        lastError: error instanceof Error ? error.message : "Falha na sincronização."
      };
      await saveSyncMetadata(next);
      setMetadata(next);
      setSyncStatus(next.status);
    } finally {
      syncingRef.current = false;
    }
  }, [applyRemoteState, config, metadataReady, session]);

  useEffect(() => {
    if (!session || !metadataReady) {
      setSyncStatus("local-only");
      return;
    }
    const timer = window.setTimeout(() => void syncNow(), 350);
    const onOnline = () => void syncNow();
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncNow();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [metadata.pendingEvents.length, metadataReady, session, syncNow]);

  const importLocalProgress = useCallback(async () => {
    const local = projection(stateRef.current);
    if (!hasMeaningfulLocalProgress(local)) {
      setMigrationRequired(false);
      return;
    }
    await queueEvent("legacy.imported", {
      fingerprint: progressFingerprint(local),
      legacy_xp: Math.max(0, local.xp - remoteXpRef.current),
      completed_lesson_ids: local.completedLessonIds,
      completed_checkpoint_ids: local.completedCheckpointIds,
      achievement_ids: local.earnedAchievementIds
    });
    setMigrationRequired(false);
  }, [queueEvent]);

  return { syncStatus, migrationRequired, syncNow, importLocalProgress, recordAction };
}
