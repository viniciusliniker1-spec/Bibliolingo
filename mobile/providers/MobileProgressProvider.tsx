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
import { finishActivity, createLessonSession, recordProgressAnswer } from "../domain/progress";
import { mergeReviewItems, registerReviewResult } from "../../src/domain/review";
import { flushProgressSave, loadProgress, scheduleProgressSave } from "../services/progressStorage";
import { useMobileAuth } from "./MobileAuthProvider";
import { useMobileLumi } from "./MobileLumiProvider";
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
import type { BibleAnnotation, BibleLocation, UserProfile, UserSettings } from "../../src/types/progress";
import {
  fetchMobileAccountState,
  flushPendingMobileAccountState,
  queueMobileAccountState
} from "../services/accountStateRemote";
import { classifySyncFailure, isRewardableSyncEvent, syncFailureMessage } from "../services/syncCore";

import { loadPendingLumiCredits } from "../services/lumiLocalLedger";

interface MobileProgressContextValue {
  progress: MobileProgress;
  hydrated: boolean;
  syncStatus: SyncConnectionState;
  syncError?: string;
  migrationRequired: boolean;
  startActivity: (activityId: string, journeyMode?: "canonical" | "individual", journeyBookId?: string) => ActiveLessonSession;
  setStepIndex: (stepIndex: number) => void;
  answerQuestion: (
    questionId: string,
    correct: boolean,
    details?: { conceptId?: string; lessonId?: string; mode?: "lesson" | "checkpoint" | "review" | "formation" | "deepen" | "greek" | "hebrew"; difficulty?: "easy" | "medium" | "hard" }
  ) => void;
  completeActivity: (
    activityId: string,
    total: number,
    correct: number,
    checkpoint: boolean,
    passAccuracy?: number
  ) => CompletionResult;
  syncNow: () => Promise<boolean>;
  importLocalProgress: () => Promise<void>;
  markGreekLexeme: (lexemeId: string) => void;
  setBibleLocation: (location: BibleLocation) => void;
  saveBibleAnnotation: (annotation: BibleAnnotation) => void;
  updatePreferences: (profile: Partial<UserProfile>, settings?: Partial<UserSettings>) => void;
  replaceProgress: (progress: MobileProgress) => void;
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
  incorrectQuestionIds: [],
  reviewItems: [],
  learnedGreekLexemeIds: [],
  hearts: 5,
  profile: { onboarded: true, goal: "daily-habit", dailyGoal: 100, knowledgeLevel: "intermediate" },
  settings: { heartsEnabled: true, maxHearts: 5, soundEnabled: true, hapticsEnabled: true, reduceMotionEnabled: false, dailyReminderEnabled: false, dailyReminderTime: "19:00" },
  attempts: [],
  earnedAchievementIds: [],
  activity: {},
  promptsGenerated: {},
  bibleAnnotations: {},
  greekSkills: {},
  ignoredRecommendationIds: [],
  recentRecommendationIds: [],
  personalGoals: [],
  planEnrollments: [],
  planCompletionEvents: [],
  planChangeEvents: [],
  missionAssignments: [],
  missionEvents: [],
  storageRevision: 0
};

const BOOK_COMPLETION_ACHIEVEMENTS = new Set([
  "genesis-complete", "exodus-complete", "leviticus-complete", "numbers-complete", "deuteronomy-complete",
  "joshua-complete", "judges-complete", "ruth-complete", "first-samuel-complete", "second-samuel-complete",
  "first-kings-complete", "second-kings-complete", "chronicles-complete", "ezra-nehemiah-complete",
  "esther-complete", "psalms-complete", "isaiah-complete", "jeremiah-complete", "ezekiel-complete", "daniel-complete"
]);

function projection(progress: MobileProgress): CommonProgressProjection {
  return {
    xp: progress.xp,
    streak: progress.streak,
    bestStreak: progress.bestStreak,
    lastStudyDate: progress.lastStudyDate,
    completedLessonIds: progress.completedLessonIds,
    completedCheckpointIds: progress.completedCheckpointIds,
    perfectLessonIds: progress.perfectLessonIds,
    earnedAchievementIds: progress.earnedAchievementIds,
    incorrectQuestionIds: progress.incorrectQuestionIds
  };
}

function mergeBibleAnnotations(
  local: Record<string, BibleAnnotation>,
  remote: Record<string, BibleAnnotation>
) {
  const merged = { ...local };
  for (const [id, annotation] of Object.entries(remote)) {
    const current = merged[id];
    if (!current || current.updatedAt.localeCompare(annotation.updatedAt) <= 0) merged[id] = annotation;
  }
  return merged;
}

function mergeUnique<T>(values: T[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeProgressSnapshots(local: MobileProgress, remote: MobileProgress): MobileProgress {
  return {
    ...remote,
    ...local,
    xp: Math.max(local.xp, remote.xp),
    streak: Math.max(local.streak, remote.streak),
    bestStreak: Math.max(local.bestStreak, remote.bestStreak),
    lastStudyDate: [local.lastStudyDate, remote.lastStudyDate].filter(Boolean).sort().at(-1),
    completedLessonIds: [...new Set([...remote.completedLessonIds, ...local.completedLessonIds])],
    completedCheckpointIds: [...new Set([...remote.completedCheckpointIds, ...local.completedCheckpointIds])],
    perfectLessonIds: [...new Set([...remote.perfectLessonIds, ...local.perfectLessonIds])],
    incorrectQuestionIds: [...new Set([...remote.incorrectQuestionIds, ...local.incorrectQuestionIds])],
    earnedAchievementIds: [...new Set([...remote.earnedAchievementIds, ...local.earnedAchievementIds])],
    learnedGreekLexemeIds: [...new Set([...remote.learnedGreekLexemeIds, ...local.learnedGreekLexemeIds])],
    ignoredRecommendationIds: [...new Set([...remote.ignoredRecommendationIds, ...local.ignoredRecommendationIds])],
    recentRecommendationIds: [...new Set([...remote.recentRecommendationIds, ...local.recentRecommendationIds])],
    reviewItems: mergeReviewItems(local.reviewItems, remote.reviewItems),
    attempts: mergeUnique([...remote.attempts, ...local.attempts]),
    personalGoals: mergeUnique([...remote.personalGoals, ...local.personalGoals]),
    planEnrollments: mergeUnique([...remote.planEnrollments, ...local.planEnrollments]),
    planCompletionEvents: mergeUnique([...remote.planCompletionEvents, ...local.planCompletionEvents]),
    planChangeEvents: mergeUnique([...remote.planChangeEvents, ...local.planChangeEvents]),
    missionAssignments: mergeUnique([...remote.missionAssignments, ...local.missionAssignments]),
    missionEvents: mergeUnique([...remote.missionEvents, ...local.missionEvents]),
    activity: { ...remote.activity, ...local.activity },
    promptsGenerated: { ...remote.promptsGenerated, ...local.promptsGenerated },
    bibleAnnotations: mergeBibleAnnotations(remote.bibleAnnotations, local.bibleAnnotations),
    greekSkills: { ...remote.greekSkills, ...local.greekSkills },
    activeLesson: local.activeLesson ?? remote.activeLesson,
    storageRevision: Math.max(local.storageRevision, remote.storageRevision) + 1
  };
}

function localDate() {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function MobileProgressProvider({ children }: PropsWithChildren) {
  const { session, configured } = useMobileAuth();
  const {
    refresh: refreshLumi,
    creditOffline: creditOfflineLumi,
    settleOfflineCredits: settleOfflineLumi
  } = useMobileLumi();
  const [progress, setProgress] = useState<MobileProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [metadata, setMetadata] = useState<MobileSyncMetadata>({ pendingEvents: [], lastServerSequence: 0 });
  const [metadataReady, setMetadataReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncConnectionState>("local-only");
  const [syncError, setSyncError] = useState<string>();
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [accountStateReady, setAccountStateReady] = useState(false);
  const progressRef = useRef(progress);
  const metadataRef = useRef(metadata);
  const syncing = useRef<Promise<boolean> | undefined>(undefined);
  const remoteXpRef = useRef(0);
  const queueChainRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);

  useEffect(() => {
    let active = true;
    const startedAt = globalThis.performance?.now?.() ?? Date.now();
    Promise.all([loadProgress(), loadMobileSyncMetadata()]).then(([stored, storedMetadata]) => {
      if (!active) return;
      setProgress(stored);
      setMetadata(storedMetadata);
      setMetadataReady(true);
      setHydrated(true);
      console.info("[BibliolingoPerf] progress_total_hydration_ms=" + Math.round((globalThis.performance?.now?.() ?? Date.now()) - startedAt));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    scheduleProgressSave(progress);
  }, [hydrated, progress]);

  useEffect(() => {
    if (!hydrated || !session) {
      setAccountStateReady(false);
      return;
    }
    let active = true;
    setAccountStateReady(false);
    void fetchMobileAccountState(session).then((remote) => {
      if (!active) return;
      if (remote) {
        setProgress((current) => {
          const restored = remote.progressSnapshot
            ? mergeProgressSnapshots(current, remote.progressSnapshot)
            : current;
          return {
            ...restored,
            profile: { ...restored.profile, ...remote.profile },
            settings: { ...restored.settings, ...remote.settings },
            bibleAnnotations: mergeBibleAnnotations(restored.bibleAnnotations, remote.bibleAnnotations),
            bibleLocation: remote.bibleLocation ?? restored.bibleLocation,
            learnedGreekLexemeIds: [...new Set([
              ...restored.learnedGreekLexemeIds,
              ...remote.learnedGreekLexemeIds
            ])],
            storageRevision: restored.storageRevision + 1
          };
        });
      }
    }).catch((error) => {
      // Uma falha de rede não substitui dados locais por um estado vazio e
      // também não bloqueia o outbox: o estado local continuará sendo salvo.
      console.warn("[BibliolingoSync] account_state_hydration_failed", error);
    }).finally(() => {
      if (active) setAccountStateReady(true);
    });
    return () => { active = false; };
  }, [hydrated, session]);

  useEffect(() => {
    if (!session || !accountStateReady) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const snapshot = {
      profile: progress.profile,
      settings: progress.settings,
      bibleAnnotations: progress.bibleAnnotations,
      bibleLocation: progress.bibleLocation,
      learnedGreekLexemeIds: progress.learnedGreekLexemeIds,
      progressSnapshot: progress,
      progressUpdatedAt: new Date().toISOString()
    };
    void queueMobileAccountState(session.user.id, snapshot).then(() => {
      if (!active) return;
      timer = setTimeout(() => {
        void flushPendingMobileAccountState(session).catch((error) => {
          console.warn("[BibliolingoSync] account_state_flush_failed", error);
        });
      }, 1_200);
    });
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [
    accountStateReady,
    progress.bibleAnnotations,
    progress.bibleLocation,
    progress.learnedGreekLexemeIds,
    progress.profile,
    progress.settings,
    session
  ]);

  useEffect(() => {
    if (!session || !accountStateReady) return;
    const retry = setInterval(() => {
      void flushPendingMobileAccountState(session).catch(() => undefined);
    }, 30_000);
    return () => clearInterval(retry);
  }, [accountStateReady, session]);

  useEffect(() => () => {
    void flushProgressSave();
  }, []);

  const queueEvent = useCallback((
    eventType: SyncEvent["eventType"],
    payload: Record<string, unknown>
  ) => {
    const operation = queueChainRef.current.then(async () => {
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
    });
    queueChainRef.current = operation.catch(() => undefined);
    return operation;
  }, []);

  const syncNow = useCallback((): Promise<boolean> => {
    if (!session || !configured || !metadataReady) return Promise.resolve(false);
    if (syncing.current) return syncing.current;
    const task = (async () => {
    setSyncError(undefined);
    setSyncStatus("syncing");
    try {
      await queueChainRef.current;
      const pendingCreditSources = Object.keys((await loadPendingLumiCredits(session.user.id)).credits);
      let nextMetadata = await loadMobileSyncMetadata();
      const hadRewardableEvents = nextMetadata.pendingEvents.some((event) =>
        isRewardableSyncEvent(event.eventType)
      );
      let lumiChanged = false;
      for (const event of nextMetadata.pendingEvents) {
        const result = await submitMobileSyncEvent(session, event);
        lumiChanged ||= Number(result.lumi_credited ?? 0) > 0;
        // Serialize acknowledgement with enqueues and read the latest snapshot:
        // never replace events created while the network request was in flight.
        const acknowledgement = queueChainRef.current.then(async () => {
          const latest = await loadMobileSyncMetadata();
          const acknowledged = {
            ...latest,
            pendingEvents: latest.pendingEvents.filter((item) => item.eventId !== event.eventId),
            lastServerSequence: Math.max(latest.lastServerSequence, Number(result.server_sequence ?? 0)),
            lastSyncedAt: new Date().toISOString()
          };
          await saveMobileSyncMetadata(acknowledged);
          metadataRef.current = acknowledged;
          setMetadata(acknowledged);
          return acknowledged;
        });
        queueChainRef.current = acknowledgement.then(() => undefined, () => undefined);
        nextMetadata = await acknowledgement;
      }
      if (hadRewardableEvents || lumiChanged) {
        const confirmed = await refreshLumi();
        if (confirmed) await settleOfflineLumi(pendingCreditSources);
      }
      const remote = await fetchMobileRemoteProgress(session);
      const local = projection(progressRef.current);
      remoteXpRef.current = remote.totalXp;
      const result = mergeProgressProjection(local, remote);
      const reviewItems = mergeReviewItems(progressRef.current.reviewItems, remote.reviewItems ?? []);
      if (result.changed || Boolean(remote.activeSession) || reviewItems.length !== progressRef.current.reviewItems.length) {
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
          reviewItems,
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
      return true;
    } catch (error) {
      setSyncError(syncFailureMessage(error));
      setSyncStatus(classifySyncFailure(error));
      console.warn("[BibliolingoSync] progress_sync_failed", error);
      return false;
    }
    })();
    const shared = task.finally(() => {
      if (syncing.current === shared) syncing.current = undefined;
    });
    syncing.current = shared;
    return shared;
  }, [configured, metadataReady, refreshLumi, session, settleOfflineLumi]);

  useEffect(() => {
    if (!session || !metadataReady) {
      setSyncStatus("local-only");
      return;
    }
    const timer = setTimeout(() => void syncNow(), 600);
    return () => clearTimeout(timer);
  }, [metadata.pendingEvents.length, metadataReady, session, syncNow]);

  useEffect(() => {
    if (!session || syncStatus !== "offline") return;
    const retry = setInterval(() => void syncNow(), 30_000);
    return () => clearInterval(retry);
  }, [session, syncNow, syncStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncNow();
      else void flushProgressSave();
    });
    return () => subscription.remove();
  }, [syncNow]);

  const startActivity = useCallback((activityId: string, journeyMode?: "canonical" | "individual", journeyBookId?: string) => {
    if (progressRef.current.activeLesson?.activityId === activityId && progressRef.current.activeLesson.journeyMode === journeyMode && progressRef.current.activeLesson.journeyBookId === journeyBookId) return progressRef.current.activeLesson;
    const lessonSession = { ...createLessonSession(activityId), journeyMode, journeyBookId };
    setProgress((current) => ({ ...current, activeLesson: lessonSession }));
    void queueEvent("active_session.updated", {
      activity_id: activityId,
      step_index: 0,
      started_at: lessonSession.startedAt,
      answers: {},
      journey_mode: journeyMode,
      journey_book_id: journeyBookId
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

  const answerQuestion = useCallback((
    questionId: string,
    correct: boolean,
    details?: { conceptId?: string; lessonId?: string; mode?: "lesson" | "checkpoint" | "review" | "formation" | "deepen" | "greek" | "hebrew"; difficulty?: "easy" | "medium" | "hard" }
  ) => {
    const active = progressRef.current.activeLesson;
    const now = new Date();
    setProgress((current) => {
      const currentReview = current.reviewItems.find((item) =>
        item.questionId === questionId || (details?.conceptId && item.conceptId === details.conceptId)
      );
      const conceptId = details?.conceptId ?? currentReview?.conceptId;
      const nextReview = conceptId
        ? registerReviewResult(currentReview, {
            questionId,
            conceptId,
            correct,
            difficulty: details?.difficulty ?? "medium",
            mode: details?.mode ?? "lesson",
            now
          })
        : undefined;
      const answered = recordProgressAnswer(current, {
        questionId,
        correct,
        lessonId: details?.lessonId ?? active?.activityId ?? "review",
        conceptId,
        mode: details?.mode ?? "lesson",
        now
      });
      return {
        ...answered,
        reviewItems: conceptId
          ? [
              ...answered.reviewItems.filter((item) => item.conceptId !== conceptId),
              ...(nextReview ? [nextReview] : [])
            ]
          : answered.reviewItems
      };
    });
    if (active || details?.mode === "review") {
      void queueEvent("answer.recorded", {
        lesson_id: details?.lessonId ?? active?.activityId ?? "review",
        question_id: questionId,
        concept_id: details?.conceptId,
        mode: details?.mode ?? "lesson",
        is_correct: correct,
        answered_at: now.toISOString()
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
    const current = progressRef.current;
    const previousAchievementIds = new Set(current.earnedAchievementIds);
    const completionInstance = current.activeLesson?.startedAt ?? new Date().toISOString();
    const result = finishActivity(current, activityId, total, correct, checkpoint, passAccuracy);
    const newlyUnlocked = result.progress.earnedAchievementIds.filter((id) => !previousAchievementIds.has(id));
    setProgress(result.progress);
    void (async () => {
      const completionReward = checkpoint ? (result.passed ? 25 : 0) : 5;
      if (completionReward > 0) {
        await creditOfflineLumi(`completion:${activityId}:${completionInstance}`, completionReward);
      }
      for (const achievementId of newlyUnlocked) {
        await creditOfflineLumi(`achievement:${achievementId}`, 30);
        if (BOOK_COMPLETION_ACHIEVEMENTS.has(achievementId)) {
          await creditOfflineLumi(`book:${achievementId}`, 100);
        }
      }
      await queueEvent(checkpoint ? "checkpoint.completed" : "lesson.completed", {
        activity_id: activityId,
        total,
        correct
      });
      for (const achievementId of newlyUnlocked) {
        await queueEvent("achievement.unlocked", { achievement_id: achievementId });
      }
      await syncNow();
    })();
    return result;
  }, [creditOfflineLumi, queueEvent, syncNow]);

  const markGreekLexeme = useCallback((lexemeId: string) => {
    setProgress((current) => current.learnedGreekLexemeIds.includes(lexemeId)
      ? current
      : { ...current, learnedGreekLexemeIds: [...current.learnedGreekLexemeIds, lexemeId], storageRevision: current.storageRevision + 1 });
  }, []);

  const setBibleLocation = useCallback((location: BibleLocation) => {
    setProgress((current) => ({ ...current, bibleLocation: location, storageRevision: current.storageRevision + 1 }));
  }, []);

  const saveBibleAnnotation = useCallback((annotation: BibleAnnotation) => {
    setProgress((current) => ({
      ...current,
      bibleAnnotations: { ...current.bibleAnnotations, [annotation.id]: annotation },
      storageRevision: current.storageRevision + 1
    }));
  }, []);

  const updatePreferences = useCallback((profile: Partial<UserProfile>, settings: Partial<UserSettings> = {}) => {
    setProgress((current) => ({ ...current, profile: { ...current.profile, ...profile }, settings: { ...current.settings, ...settings }, storageRevision: current.storageRevision + 1 }));
  }, []);

  const replaceProgress = useCallback((next: MobileProgress) => {
    setProgress(next);
  }, []);

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

  useEffect(() => {
    if (!session || !migrationRequired) return;
    void importLocalProgress();
  }, [importLocalProgress, migrationRequired, session]);

  const value = useMemo(() => ({
    progress,
    hydrated,
    syncStatus,
    syncError,
    migrationRequired,
    startActivity,
    setStepIndex,
    answerQuestion,
    completeActivity,
    syncNow,
    importLocalProgress,
    markGreekLexeme,
    setBibleLocation,
    saveBibleAnnotation,
    updatePreferences,
    replaceProgress
  }), [
    progress, hydrated, syncStatus, syncError, migrationRequired, startActivity, setStepIndex,
    answerQuestion, completeActivity, syncNow, importLocalProgress, markGreekLexeme, setBibleLocation, saveBibleAnnotation, updatePreferences, replaceProgress
  ]);

  return <MobileProgressContext.Provider value={value}>{children}</MobileProgressContext.Provider>;
}

export function useMobileProgress() {
  const context = useContext(MobileProgressContext);
  if (!context) throw new Error("useMobileProgress deve ser usado dentro de MobileProgressProvider");
  return context;
}
