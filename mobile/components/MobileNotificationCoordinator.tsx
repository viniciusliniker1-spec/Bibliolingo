import { useCallback, useEffect, useRef } from "react";
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
  const lastResponseId = useRef<string | undefined>(undefined);

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
    await reconcileMobileStudyNotifications(progress, preferences);
  }, [hydrated, progress]);

  useEffect(() => {
    void Notifications.getLastNotificationResponseAsync().then(openResponse);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(openResponse);
    return () => responseSubscription.remove();
  }, [openResponse]);

  useEffect(() => {
    void reconcile();
  }, [reconcile]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void reconcile();
    });
    return () => subscription.remove();
  }, [reconcile]);

  return null;
}
