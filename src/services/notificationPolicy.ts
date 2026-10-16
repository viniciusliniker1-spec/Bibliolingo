import { toLocalDateKey } from "../domain/streak";

export type StudyNotificationCategory = "daily" | "streak" | "inactivity" | "review";

export interface StudyNotificationPreferences {
  enabled: boolean;
  daily: boolean;
  streak: boolean;
  inactivity: boolean;
  review: boolean;
  time: string;
  quietStart: string;
  quietEnd: string;
  lastSent: Partial<Record<StudyNotificationCategory, string>>;
}

export interface StudyNotificationCandidate {
  category: StudyNotificationCategory;
  title: string;
  body: string;
  route: string;
}

export const defaultStudyNotificationPreferences: StudyNotificationPreferences = {
  enabled: false,
  daily: true,
  streak: true,
  inactivity: true,
  review: true,
  time: "19:00",
  quietStart: "22:00",
  quietEnd: "08:00",
  lastSent: {}
};

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function isQuietTime(now: Date, start: string, end: string) {
  const current = now.getHours() * 60 + now.getMinutes();
  const from = minutes(start);
  const until = minutes(end);
  return from === until ? false : from < until
    ? current >= from && current < until
    : current >= from || current < until;
}

function daysSince(date: string | undefined, now: Date) {
  if (!date) return Number.POSITIVE_INFINITY;
  const then = new Date(date + "T12:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.floor((today.getTime() - then.getTime()) / 86_400_000);
}

export function chooseStudyNotification(input: {
  preferences: StudyNotificationPreferences;
  now?: Date;
  todayXp: number;
  dailyGoal: number;
  studiedToday: boolean;
  streak: number;
  lastStudyDate?: string;
  reviewCount: number;
}): StudyNotificationCandidate | undefined {
  const now = input.now ?? new Date();
  const prefs = input.preferences;
  if (!prefs.enabled || isQuietTime(now, prefs.quietStart, prefs.quietEnd)) return undefined;
  if (now.getHours() * 60 + now.getMinutes() < minutes(prefs.time)) return undefined;
  const today = toLocalDateKey(now);
  const notSent = (category: StudyNotificationCategory) => prefs.lastSent[category] !== today;

  if (prefs.review && input.reviewCount > 0 && notSent("review")) {
    return {
      category: "review",
      title: "Conteúdos para revisar",
      body: `Você tem ${input.reviewCount} ${input.reviewCount === 1 ? "conteúdo esperando" : "conteúdos esperando"} por uma revisão.`,
      route: "/study"
    };
  }
  if (prefs.streak && input.streak > 0 && !input.studiedToday && notSent("streak")) {
    return {
      category: "streak",
      title: "Sua sequência está esperando",
      body: "Que tal reservar alguns minutos para continuar sua caminhada?",
      route: "/"
    };
  }
  if (prefs.daily && input.todayXp < input.dailyGoal && !input.studiedToday && notSent("daily")) {
    return {
      category: "daily",
      title: "Vamos aprender mais sobre a Bíblia?",
      body: "Sua próxima atividade está pronta quando você estiver.",
      route: "/"
    };
  }
  if (prefs.inactivity && daysSince(input.lastStudyDate, now) >= 3 && notSent("inactivity")) {
    return {
      category: "inactivity",
      title: "O Professor Noah está com saudades",
      body: "Volte quando puder. Sua jornada continua exatamente de onde parou.",
      route: "/"
    };
  }
  return undefined;
}

export function markNotificationSent(
  preferences: StudyNotificationPreferences,
  category: StudyNotificationCategory,
  now = new Date()
): StudyNotificationPreferences {
  return {
    ...preferences,
    lastSent: { ...preferences.lastSent, [category]: toLocalDateKey(now) }
  };
}
