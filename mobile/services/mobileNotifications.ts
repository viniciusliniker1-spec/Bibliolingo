import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { StudyNotificationPreferences } from "../../src/services/notificationPolicy";
import type { MobileProgress } from "../types/progress";
import { planMobileReminders, type ReminderContext } from "../domain/notificationSchedule";
import { lumiReminder } from "../domain/lumiNotifications";

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
  options: { requestPermission?: boolean; now?: Date; context?: ReminderContext } = {}
) {
  await cancelMobileStudyNotifications();
  if (!preferences.enabled) return { status: "disabled" as const, scheduled: 0 };

  const allowed = options.requestPermission
    ? await requestMobileNotificationPermission()
    : (await Notifications.getPermissionsAsync()).granted;
  if (!allowed) return { status: "permission-required" as const, scheduled: 0 };

  await ensureAndroidChannel();
  const plan = planMobileReminders(progress, preferences, options.now ?? new Date(), options.context);
  const identifiers: string[] = [];
  for (const reminder of plan) {
    identifiers.push(await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: false,
        color: "#21A675",
        data: { route: reminder.route, category: reminder.category, kind: reminder.kind }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined
      }
    }));
  }
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(identifiers));
  return { status: "scheduled" as const, scheduled: identifiers.length, next: plan[0] };
}

/** Mostra agora um exemplo de lembrete, para a pessoa ver como chega. */
export async function sendLumiTestNotification(context: ReminderContext & { streak?: number }) {
  const allowed = await requestMobileNotificationPermission();
  if (!allowed) return false;
  const copy = lumiReminder("daily", new Date().toISOString(), { nome: context.name?.split(" ")[0], licao: context.nextLessonTitle, dias: context.streak });
  await Notifications.scheduleNotificationAsync({
    content: { title: copy.title, body: copy.body, sound: false, color: "#21A675", data: { route: "/(tabs)" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, channelId: Platform.OS === "android" ? CHANNEL_ID : undefined }
  });
  return true;
}

export function notificationRoute(response: Notifications.NotificationResponse) {
  const route = response.notification.request.content.data?.route;
  return route === "/(tabs)/review" ? "/(tabs)/review" : route === "/(tabs)" ? "/(tabs)" : undefined;
}
