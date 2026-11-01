import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { StudyNotificationPreferences } from "../../src/services/notificationPolicy";
import type { MobileProgress } from "../types/progress";
import { nextMobileStudyReminder } from "../domain/notificationSchedule";

const IDS_KEY = "@bibliolingo/scheduled-notifications/v1";
const CHANNEL_ID = "study-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Lembrete de estudo",
    description: "Um lembrete opcional do Bibliolingo.",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: "#21A675"
  });
}

export async function cancelMobileStudyNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
  await AsyncStorage.removeItem(IDS_KEY);
}

export async function requestMobileNotificationPermission() {
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function reconcileMobileStudyNotifications(
  progress: MobileProgress,
  preferences: StudyNotificationPreferences,
  options: { requestPermission?: boolean; now?: Date } = {}
) {
  await cancelMobileStudyNotifications();
  if (!preferences.enabled) return { status: "disabled" as const, scheduled: 0 };

  const allowed = options.requestPermission
    ? await requestMobileNotificationPermission()
    : (await Notifications.getPermissionsAsync()).granted;
  if (!allowed) return { status: "permission-required" as const, scheduled: 0 };

  await ensureAndroidChannel();
  const reminder = nextMobileStudyReminder(progress, preferences, options.now ?? new Date());
  if (!reminder) {
    await AsyncStorage.setItem(IDS_KEY, "[]");
    return { status: "scheduled" as const, scheduled: 0 };
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.candidate.title,
      body: reminder.candidate.body,
      sound: false,
      data: {
        route: reminder.candidate.route === "/study" ? "/(tabs)/review" : "/(tabs)",
        category: reminder.candidate.category
      }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminder.date,
      channelId: Platform.OS === "android" ? CHANNEL_ID : undefined
    }
  });

  await AsyncStorage.setItem(IDS_KEY, JSON.stringify([identifier]));
  return { status: "scheduled" as const, scheduled: 1 };
}

export function notificationRoute(response: Notifications.NotificationResponse) {
  const route = response.notification.request.content.data?.route;
  return route === "/(tabs)/review" ? "/(tabs)/review" : route === "/(tabs)" ? "/(tabs)" : undefined;
}
