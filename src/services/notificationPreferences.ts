import {
  defaultStudyNotificationPreferences,
  type StudyNotificationPreferences
} from "./notificationPolicy";

const KEY = "bibliolingo.notifications.v1";

export function loadWebNotificationPreferences(): StudyNotificationPreferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStudyNotificationPreferences;
    const value = JSON.parse(raw) as Partial<StudyNotificationPreferences>;
    return {
      ...defaultStudyNotificationPreferences,
      ...value,
      lastSent: value.lastSent ?? {}
    };
  } catch {
    return defaultStudyNotificationPreferences;
  }
}

export function saveWebNotificationPreferences(value: StudyNotificationPreferences) {
  localStorage.setItem(KEY, JSON.stringify(value));
}
