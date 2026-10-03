import type { AppState } from "../types/progress";

export type AchievementCondition =
  | { type: "lessons"; count: number }
  | { type: "xp"; amount: number }
  | { type: "perfect-lessons"; count: number }
  | { type: "checkpoint"; id: string }
  | { type: "streak"; days: number }
  | { type: "prompts"; promptType: string; count: number };

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-step",
    title: "Primeiros passos",
    description: "Conclua sua primeira lição.",
    icon: "✦",
    condition: { type: "lessons", count: 1 }
  },
  {
    id: "perfect-lesson",
    title: "Coração atento",
    description: "Conclua uma lição sem errar.",
    icon: "◆",
    condition: { type: "perfect-lessons", count: 1 }
  },
  {
    id: "one-hundred-xp",
    title: "Sede de aprender",
    description: "Alcance 100 XP.",
    icon: "⚡",
    condition: { type: "xp", amount: 100 }
  },
  {
    id: "unit-one",
    title: "O princípio",
    description: "Supere o checkpoint de Gênesis 1–3.",
    icon: "★",
    condition: { type: "checkpoint", id: "genesis-u01-checkpoint" }
  },
  {
    id: "faithful-three",
    title: "Fiel na caminhada",
    description: "Estude por três dias seguidos.",
    icon: "🔥",
    condition: { type: "streak", days: 3 }
  },
  {
    id: "preacher",
    title: "Pregador",
    description: "Gere dez prompts de esboço.",
    icon: "♢",
    condition: { type: "prompts", promptType: "sermon", count: 10 }
  }
];

function met(state: AppState, condition: AchievementCondition): boolean {
  switch (condition.type) {
    case "lessons":
      return state.completedLessonIds.length >= condition.count;
    case "xp":
      return state.xp >= condition.amount;
    case "perfect-lessons":
      return state.perfectLessonIds.length >= condition.count;
    case "checkpoint":
      return state.completedCheckpointIds.includes(condition.id);
    case "streak":
      return state.streak >= condition.days;
    case "prompts":
      return (state.promptsGenerated[condition.promptType] ?? 0) >= condition.count;
  }
}

export function evaluateAchievements(state: AppState): string[] {
  return ACHIEVEMENTS.filter((achievement) => met(state, achievement.condition)).map(
    (achievement) => achievement.id
  );
}
