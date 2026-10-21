import { useCallback, useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import {
  notificationRoute,
  reconcileMobileStudyNotifications
} from "../services/mobileNotifications";
import { loadMobileNotificationPreferences } from "../services/notificationPreferences";

export function MobileNotificationCoordinator() {
  const router = useRouter();
  const { progress, hydrated } = useMobileProgress();
  const progressRef = useRef(progress);
  const lastResponseId = useRef<string | undefined>(undefined);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Re-schedule only when inputs used by notificationSchedule change. Answering
  // a question or moving between lesson steps no longer cancels and recreates
  // Android notifications.
  const notificationFingerprint = useMemo(() => JSON.stringify({
    lastStudyDate: progress.lastStudyDate,
    dailyGoal: progress.profile.dailyGoal,
    streak: progress.streak,
    reviews: progress.reviewItems.map((item) => [
      item.conceptId,
      item.questionId,
      item.dueDate,
      item.lastResult,
      item.lastReviewedAt
    ])
  }), [
    progress.lastStudyDate,
    progress.profile.dailyGoal,
    progress.streak,
    progress.reviewItems
  ]);

  const openResponse = useCallback((response: Notifications.NotificationResponse | null) => {
    if (!response || response.notification.request.identifier === lastResponseId.current) return;
    const route = notificationRoute(response);
    if (!route) return;
    lastResponseId.current = response.notification.request.identifier;
    router.push(route);
  }, [router]);

  const reconcile = useCallback(async () => {
    if (!hydrated) return;
    const preferences = await loadMobileNotificationPreferences();
    await reconcileMobileStudyNotifications(progressRef.current, preferences);
  }, [hydrated]);

  useEffect(() => {
    void Notifications.getLastNotificationResponseAsync().then(openResponse);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(openResponse);
    return () => responseSubscription.remove();
  }, [openResponse]);

  useEffect(() => {
    void reconcile();
  }, [notificationFingerprint, reconcile]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void reconcile();
    });
    return () => subscription.remove();
  }, [reconcile]);

  return null;
}
