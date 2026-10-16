import type { ActivityDay, AppState } from "../types/progress";
import { toLocalDateKey } from "./streak";

export interface WeeklyGoalProgress {
  xp: number;
  goal: number;
  activeDays: number;
  completed: boolean;
  percent: number;
}

function mondayOfWeek(now: Date) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

export function weeklyGoalProgress(
  activity: Record<string, ActivityDay>,
  dailyGoal: number,
  now = new Date()
): WeeklyGoalProgress {
  const monday = mondayOfWeek(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return activity[toLocalDateKey(date)];
  }).filter((day): day is ActivityDay => Boolean(day));
  const xp = days.reduce((total, day) => total + day.xp, 0);
  const goal = dailyGoal * 5;
  return {
    xp,
    goal,
    activeDays: days.filter((day) => day.xp > 0).length,
    completed: xp >= goal,
    percent: Math.min(100, Math.round((xp / goal) * 100))
  };
}

export interface SmartChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  route: string;
}

export function smartChallenges(state: AppState): SmartChallenge[] {
  const week = weeklyGoalProgress(state.activity, state.profile.dailyGoal);
  const reviewCorrect = state.attempts.filter((item) => item.mode === "review" && item.correct).slice(-20).length;
  return [
    {
      id: "weekly-xp",
      title: "Ritmo da semana",
      description: "Alcance cinco metas diárias ao longo da semana.",
      progress: week.xp,
      target: week.goal,
      completed: week.completed,
      route: "/"
    },
    {
      id: "review-five",
      title: "Memória fortalecida",
      description: "Acerte cinco questões de revisão.",
      progress: Math.min(5, reviewCorrect),
      target: 5,
      completed: reviewCorrect >= 5,
      route: "/study"
    },
    {
      id: "three-day-streak",
      title: "Constância gentil",
      description: "Estude por três dias seguidos.",
      progress: Math.min(3, state.streak),
      target: 3,
      completed: state.streak >= 3,
      route: "/"
    }
  ];
}
