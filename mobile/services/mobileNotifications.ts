import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
  chooseStudyNotification,
  type StudyNotificationPreferences
} from "../../src/services/notificationPolicy";
import { getReviewQueue } from "../../src/domain/review";
import { toLocalDateKey } from "../../src/domain/streak";
import type { MobileProgress } from "../types/progress";

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
    name: "Lembretes de estudo",
    description: "Lembretes opcionais de jornada, sequência e revisão.",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: "#21A675"
  });
}

async function storedIdentifiers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(IDS_KEY);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function cancelMobileStudyNotifications() {
  const identifiers = await storedIdentifiers();
  await Promise.all(identifiers.map((id) =>
    Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)
  ));
  await AsyncStorage.removeItem(IDS_KEY);
}

export async function requestMobileNotificationPermission() {
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function scheduledDate(dayOffset: number, time: string, now: Date) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(Number.isFinite(hour) ? hour : 19, Number.isFinite(minute) ? minute : 0, 0, 0);
  return date;
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
  const now = options.now ?? new Date();
  const identifiers: string[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = scheduledDate(offset, preferences.time, now);
    if (date.getTime() <= now.getTime() + 60_000) continue;
    const dateKey = toLocalDateKey(date);
    const studied = progress.lastStudyDate === dateKey;
    const candidate = chooseStudyNotification({
      preferences,
      now: date,
      // O mobile ainda não guarda XP por dia. Considerar um dia estudado como
      // meta atendida é a opção conservadora: evita lembretes indevidos.
      todayXp: studied ? 100 : 0,
      dailyGoal: 100,
      studiedToday: studied,
      streak: progress.streak,
      lastStudyDate: progress.lastStudyDate,
      reviewCount: getReviewQueue(progress.reviewItems, date).length
    });
    if (!candidate) continue;
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: candidate.title,
        body: candidate.body,
        sound: false,
        data: {
          route: candidate.route === "/study" ? "/(tabs)/review" : "/(tabs)",
          category: candidate.category
        }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined
      }
    });
    identifiers.push(identifier);
  }

  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(identifiers));
  return { status: "scheduled" as const, scheduled: identifiers.length };
}

export function notificationRoute(response: Notifications.NotificationResponse) {
  const route = response.notification.request.content.data?.route;
  return route === "/(tabs)/review" ? "/(tabs)/review" : route === "/(tabs)" ? "/(tabs)" : undefined;
}
