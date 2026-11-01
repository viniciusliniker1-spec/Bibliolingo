import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  defaultStudyNotificationPreferences,
  type StudyNotificationPreferences
} from "../../src/services/notificationPolicy";

const KEY = "@bibliolingo/notification-preferences/v1";

export async function loadMobileNotificationPreferences(): Promise<StudyNotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultStudyNotificationPreferences;
    const value = JSON.parse(raw) as Partial<StudyNotificationPreferences>;
    return { ...defaultStudyNotificationPreferences, ...value, lastSent: value.lastSent ?? {} };
  } catch {
    return defaultStudyNotificationPreferences;
  }
}

export async function saveMobileNotificationPreferences(value: StudyNotificationPreferences) {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}
