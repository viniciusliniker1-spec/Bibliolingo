import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getWebAuthConfiguration } from "../auth/supabaseAuth";
import { toLocalDateKey } from "../domain/streak";
import { buildReviewItemsFromHistory, mergeReviewItems } from "../domain/review";
import { conceptForQuestion } from "../domain/reviewCatalog";
import type { AppState } from "../types/progress";
import type { PersonalGoal, PlanChangeEvent, PlanCompletionEvent, PlanEnrollment } from "../domain/studyPlans";
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
  conceptId?: string;
  difficulty?: "easy" | "medium" | "hard";
  mode?: string;
  checkpoint?: boolean;
  recommendationId?: string;
  goal?: PersonalGoal | import("../types/progress").StudyGoal;
  enrollment?: PlanEnrollment;
  event?: PlanCompletionEvent | PlanChangeEvent;
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
  const knownAchievements = useRef<Set<string> | undefined>(undefined);
  const queueChainRef = useRef<Promise<void>>(Promise.resolve());

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

  const queueEvent = useCallback((
    eventType: SyncEvent["eventType"],
    payload: Record<string, unknown>
  ) => {
    const operation = queueChainRef.current.then(async () => {
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
    });
    queueChainRef.current = operation.catch(() => undefined);
    return operation;
  }, [session]);

  const recordAction = useCallback((action: SyncableAction) => {
    const current = stateRef.current;
    if (action.type === "UPSERT_MISSION_ASSIGNMENT" && action.mission) {
      void queueEvent("mission.event", { kind: "assignment", value: action.mission });
      return;
    }
    if (action.type === "RECORD_MISSION_EVENT" && action.event) {
      void queueEvent("mission.event", { kind: "lifecycle", value: action.event });
      return;
    }
    if (action.type === "UPSERT_PERSONAL_GOAL" && typeof action.goal === "object" && action.goal) {
      void queueEvent("study_plan.event", { kind: "goal", value: action.goal });
      return;
    }
    if (action.type === "UPSERT_PLAN_ENROLLMENT" && action.enrollment) {
      void queueEvent("study_plan.event", { kind: "enrollment", value: action.enrollment });
      return;
    }
    if (action.type === "RECORD_PLAN_COMPLETION" && action.event) {
      void queueEvent("study_plan.event", { kind: "completion", value: action.event });
      return;
    }
    if (action.type === "RECORD_PLAN_CHANGE" && action.event) {
      void queueEvent("study_plan.event", { kind: "change", value: action.event });
      return;
    }
    if ((action.type === "DISMISS_RECOMMENDATION" || action.type === "RECORD_RECOMMENDATION") && action.recommendationId) {
      void queueEvent("adaptive.preferences_updated", {
        operation: action.type === "DISMISS_RECOMMENDATION" ? "dismiss" : "record",
        recommendation_id: action.recommendationId
      });
      return;
    }
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
        concept_id: action.conceptId,
        difficulty: action.difficulty,
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
      const remoteReviews = remote.reviewItems?.length
        ? remote.reviewItems
        : buildReviewItemsFromHistory(
        remote.answerHistory ?? [],
        conceptForQuestion
      );
      const reviewItems = mergeReviewItems(current.reviewItems, remoteReviews);
      const reviewsChanged = reviewItems.some((item, index) =>
        item.questionId !== current.reviewItems[index]?.questionId
        || item.lastReviewedAt !== current.reviewItems[index]?.lastReviewedAt
      ) || reviewItems.length !== current.reviewItems.length;
      const attemptsById = new Map(current.attempts.map((attempt) => [attempt.id, attempt]));
      for (const attempt of remote.adaptiveAttempts ?? []) attemptsById.set(attempt.id, attempt);
      const attempts = [...attemptsById.values()].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
      const ignoredRecommendationIds = [...new Set([
        ...current.ignoredRecommendationIds,
        ...(remote.ignoredRecommendationIds ?? [])
      ])].slice(-100);
      const recentRecommendationIds = [...new Set([
        ...(remote.recentRecommendationIds ?? []),
        ...current.recentRecommendationIds
      ])].slice(-20);
      const adaptiveChanged = attempts.length !== current.attempts.length
        || ignoredRecommendationIds.length !== current.ignoredRecommendationIds.length
        || recentRecommendationIds.join("|") !== current.recentRecommendationIds.join("|");
      const goalsById = new Map(current.personalGoals.map((item) => [item.id, item]));
      for (const goal of remote.personalGoals ?? []) {
        const existing = goalsById.get(goal.id);
        if (!existing || goal.updatedAt > existing.updatedAt) goalsById.set(goal.id, goal);
      }
      const enrollmentsById = new Map(current.planEnrollments.map((item) => [item.id, item]));
      for (const enrollment of remote.planEnrollments ?? []) {
        const existing = enrollmentsById.get(enrollment.id);
        if (!existing || enrollment.updatedAt > existing.updatedAt) enrollmentsById.set(enrollment.id, enrollment);
      }
      const completionById = new Map(current.planCompletionEvents.map((item) => [item.id, item]));
      for (const event of remote.planCompletionEvents ?? []) completionById.set(event.id, event);
      const changeById = new Map(current.planChangeEvents.map((item) => [item.id, item]));
      for (const event of remote.planChangeEvents ?? []) changeById.set(event.id, event);
      const personalGoals = [...goalsById.values()];
      const planEnrollments = [...enrollmentsById.values()];
      const planCompletionEvents = [...completionById.values()];
      const planChangeEvents = [...changeById.values()];
      const planningChanged = personalGoals.length !== current.personalGoals.length
        || planEnrollments.some((item) => current.planEnrollments.find((localItem) => localItem.id === item.id)?.updatedAt !== item.updatedAt)
        || planCompletionEvents.length !== current.planCompletionEvents.length
        || planChangeEvents.length !== current.planChangeEvents.length;
      const missionById = new Map(current.missionAssignments.map((item) => [item.id, item]));
      for (const mission of remote.missionAssignments ?? []) missionById.set(mission.id, mission);
      const missionEventById = new Map(current.missionEvents.map((item) => [item.id, item]));
      for (const event of remote.missionEvents ?? []) missionEventById.set(event.id, event);
      const missionAssignments = [...missionById.values()];
      const missionEvents = [...missionEventById.values()];
      const missionsChanged = missionAssignments.length !== current.missionAssignments.length || missionEvents.length !== current.missionEvents.length;
      const useRemoteSession = Boolean(remote.activeSession && (
        !current.activeSession
        || (
          current.activeSession.lessonId === remote.activeSession.activityId
          && remote.activeSession.stepIndex > current.activeSession.stepIndex
        )
      ));
      if (merged.changed || useRemoteSession || reviewsChanged || adaptiveChanged || planningChanged || missionsChanged) {
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
          reviewItems,
          attempts,
          ignoredRecommendationIds,
          recentRecommendationIds,
          personalGoals,
          planEnrollments,
          planCompletionEvents,
          planChangeEvents,
          missionAssignments,
          missionEvents,
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
