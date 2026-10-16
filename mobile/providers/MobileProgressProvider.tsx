import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { AppState } from "react-native";
import { finishActivity, createLessonSession, recordAnswer } from "../domain/progress";
import { loadProgress, saveProgress } from "../services/progressStorage";
import { useMobileAuth } from "./MobileAuthProvider";
import {
  createSyncEvent,
  enqueueSyncEvent,
  hasMeaningfulLocalProgress,
  mergeProgressProjection,
  progressFingerprint
} from "../../src/sync/engine";
import type { CommonProgressProjection, SyncConnectionState, SyncEvent } from "../../src/sync/types";
import { fetchMobileRemoteProgress, submitMobileSyncEvent } from "../services/syncRemote";
import {
  getMobileDeviceId,
  loadMobileSyncMetadata,
  saveMobileSyncMetadata,
  type MobileSyncMetadata
} from "../services/syncStorage";
import type { ActiveLessonSession, CompletionResult, MobileProgress } from "../types/progress";

interface MobileProgressContextValue {
  progress: MobileProgress;
  hydrated: boolean;
  syncStatus: SyncConnectionState;
  migrationRequired: boolean;
  startActivity: (activityId: string) => ActiveLessonSession;
  setStepIndex: (stepIndex: number) => void;
  answerQuestion: (questionId: string, correct: boolean) => void;
  completeActivity: (
    activityId: string,
    total: number,
    correct: number,
    checkpoint: boolean,
    passAccuracy?: number
  ) => CompletionResult;
  syncNow: () => Promise<void>;
  importLocalProgress: () => Promise<void>;
}

const MobileProgressContext = createContext<MobileProgressContextValue | null>(null);

const EMPTY_PROGRESS: MobileProgress = {
  schemaVersion: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  completedLessonIds: [],
  completedCheckpointIds: [],
  perfectLessonIds: [],
  incorrectQuestionIds: []
};

function projection(progress: MobileProgress): CommonProgressProjection {
  return {
    xp: progress.xp,
    streak: progress.streak,
    bestStreak: progress.bestStreak,
    lastStudyDate: progress.lastStudyDate,
    completedLessonIds: progress.completedLessonIds,
    completedCheckpointIds: progress.completedCheckpointIds,
    perfectLessonIds: progress.perfectLessonIds,
    earnedAchievementIds: [],
    incorrectQuestionIds: progress.incorrectQuestionIds
  };
}

function localDate() {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function MobileProgressProvider({ children }: PropsWithChildren) {
  const { session, configured } = useMobileAuth();
  const [progress, setProgress] = useState<MobileProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [metadata, setMetadata] = useState<MobileSyncMetadata>({ pendingEvents: [], lastServerSequence: 0 });
  const [metadataReady, setMetadataReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncConnectionState>("local-only");
  const [migrationRequired, setMigrationRequired] = useState(false);
  const progressRef = useRef(progress);
  const metadataRef = useRef(metadata);
  const syncing = useRef(false);
  const remoteXpRef = useRef(0);

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  useEffect(() => {
    let active = true;
    Promise.all([loadProgress(), loadMobileSyncMetadata()]).then(([stored, storedMetadata]) => {
      if (!active) return;
      setProgress(stored);
      setMetadata(storedMetadata);
      setMetadataReady(true);
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress).catch(() => undefined);
  }, [hydrated, progress]);

  const queueEvent = useCallback(async (
    eventType: SyncEvent["eventType"],
    payload: Record<string, unknown>
  ) => {
    const deviceId = await getMobileDeviceId();
    const event = createSyncEvent({
      deviceId,
      platform: "android",
      eventType,
      payload,
      localDate: localDate(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const latest = await loadMobileSyncMetadata();
    const next = { ...latest, pendingEvents: enqueueSyncEvent(latest.pendingEvents, event) };
    metadataRef.current = next;
    setMetadata(next);
    await saveMobileSyncMetadata(next);
  }, []);

  const syncNow = useCallback(async () => {
    if (!session || !configured || !metadataReady || syncing.current) return;
    syncing.current = true;
    setSyncStatus("syncing");
    try {
      let nextMetadata = await loadMobileSyncMetadata();
      for (const event of nextMetadata.pendingEvents) {
        const result = await submitMobileSyncEvent(session, event);
        nextMetadata = {
          ...nextMetadata,
          pendingEvents: nextMetadata.pendingEvents.filter((item) => item.eventId !== event.eventId),
          lastServerSequence: Math.max(nextMetadata.lastServerSequence, Number(result.server_sequence ?? 0)),
          lastSyncedAt: new Date().toISOString()
        };
        await saveMobileSyncMetadata(nextMetadata);
      }
      const remote = await fetchMobileRemoteProgress(session);
      const local = projection(progressRef.current);
      remoteXpRef.current = remote.totalXp;
      const result = mergeProgressProjection(local, remote);
      if (result.changed || Boolean(remote.activeSession)) {
        setProgress((current) => ({
          ...current,
          xp: result.merged.xp,
          streak: result.merged.streak,
          bestStreak: result.merged.bestStreak,
          lastStudyDate: result.merged.lastStudyDate,
          completedLessonIds: result.merged.completedLessonIds,
          completedCheckpointIds: result.merged.completedCheckpointIds,
          perfectLessonIds: result.merged.perfectLessonIds,
          incorrectQuestionIds: result.merged.incorrectQuestionIds,
          activeLesson: remote.activeSession && (
            !current.activeLesson
            || (current.activeLesson.activityId === remote.activeSession.activityId
              && remote.activeSession.stepIndex > current.activeLesson.stepIndex)
          ) ? {
            activityId: remote.activeSession.activityId,
            stepIndex: remote.activeSession.stepIndex,
            startedAt: remote.activeSession.startedAt,
            answers: remote.activeSession.answers,
            answeredQuestionIds: Object.keys(remote.activeSession.answers),
            correct: Object.values(remote.activeSession.answers).filter(Boolean).length,
            incorrect: Object.values(remote.activeSession.answers).filter((answer) => !answer).length
          } : current.activeLesson
        }));
      }
      setMigrationRequired(
        hasMeaningfulLocalProgress(local)
        && (local.xp > remote.totalXp || result.localOnlyCount > 0)
      );
      metadataRef.current = nextMetadata;
      setMetadata(nextMetadata);
      setSyncStatus("synced");
    } catch {
      setSyncStatus("offline");
    } finally {
      syncing.current = false;
    }
  }, [configured, metadataReady, session]);

  useEffect(() => {
    if (!session || !metadataReady) {
      setSyncStatus(session ? "local-only" : "local-only");
      return;
    }
    const timer = setTimeout(() => void syncNow(), 350);
    return () => clearTimeout(timer);
  }, [metadata.pendingEvents.length, metadataReady, session, syncNow]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncNow();
    });
    return () => subscription.remove();
  }, [syncNow]);

  const startActivity = useCallback((activityId: string) => {
    if (progressRef.current.activeLesson?.activityId === activityId) return progressRef.current.activeLesson;
    const lessonSession = createLessonSession(activityId);
    setProgress((current) => ({ ...current, activeLesson: lessonSession }));
    void queueEvent("active_session.updated", {
      activity_id: activityId,
      step_index: 0,
      started_at: lessonSession.startedAt,
      answers: {}
    });
    return lessonSession;
  }, [queueEvent]);

  const setStepIndex = useCallback((stepIndex: number) => {
    const active = progressRef.current.activeLesson;
    setProgress((current) => current.activeLesson
      ? { ...current, activeLesson: { ...current.activeLesson, stepIndex } }
      : current);
    if (active) {
      void queueEvent("active_session.updated", {
        activity_id: active.activityId,
        step_index: stepIndex,
        started_at: active.startedAt,
        answers: active.answers
      });
    }
  }, [queueEvent]);

  const answerQuestion = useCallback((questionId: string, correct: boolean) => {
    const active = progressRef.current.activeLesson;
    setProgress((current) => {
      if (!current.activeLesson) return current;
      const activeLesson = recordAnswer(current.activeLesson, questionId, correct);
      return {
        ...current,
        activeLesson,
        incorrectQuestionIds: correct
          ? current.incorrectQuestionIds
          : current.incorrectQuestionIds.includes(questionId)
            ? current.incorrectQuestionIds
            : [...current.incorrectQuestionIds, questionId]
      };
    });
    if (active) {
      void queueEvent("answer.recorded", {
        lesson_id: active.activityId,
        question_id: questionId,
        is_correct: correct,
        answered_at: new Date().toISOString()
      });
    }
  }, [queueEvent]);

  const completeActivity = useCallback((
    activityId: string,
    total: number,
    correct: number,
    checkpoint: boolean,
    passAccuracy?: number
  ) => {
    const result = finishActivity(progressRef.current, activityId, total, correct, checkpoint, passAccuracy);
    setProgress(result.progress);
    void queueEvent(checkpoint ? "checkpoint.completed" : "lesson.completed", {
      activity_id: activityId,
      total,
      correct
    });
    return result;
  }, [queueEvent]);

  const importLocalProgress = useCallback(async () => {
    const local = projection(progressRef.current);
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

  const value = useMemo(() => ({
    progress,
    hydrated,
    syncStatus,
    migrationRequired,
    startActivity,
    setStepIndex,
    answerQuestion,
    completeActivity,
    syncNow,
    importLocalProgress
  }), [
    progress, hydrated, syncStatus, migrationRequired, startActivity, setStepIndex,
    answerQuestion, completeActivity, syncNow, importLocalProgress
  ]);

  return <MobileProgressContext.Provider value={value}>{children}</MobileProgressContext.Provider>;
}

export function useMobileProgress() {
  const context = useContext(MobileProgressContext);
  if (!context) throw new Error("useMobileProgress deve ser usado dentro de MobileProgressProvider");
  return context;
}
