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
  { id: "first-step", title: "Primeiros passos", description: "Conclua sua primeira lição.", icon: "✦", condition: { type: "lessons", count: 1 } },
  { id: "perfect-lesson", title: "Coração atento", description: "Conclua uma lição sem errar.", icon: "◆", condition: { type: "perfect-lessons", count: 1 } },
  { id: "one-hundred-xp", title: "Sede de aprender", description: "Alcance 100 XP.", icon: "⚡", condition: { type: "xp", amount: 100 } },
  { id: "unit-one", title: "O princípio", description: "Supere o checkpoint de Gênesis 1–3.", icon: "★", condition: { type: "checkpoint", id: "genesis-u01-checkpoint" } },
  { id: "genesis-complete", title: "No princípio", description: "Conclua todos os checkpoints de Gênesis.", icon: "◈", condition: { type: "checkpoint", id: "genesis-u10-checkpoint" } },
  { id: "exodus-complete", title: "Libertos para servir", description: "Conclua todos os checkpoints de Êxodo.", icon: "◇", condition: { type: "checkpoint", id: "exodus-u08-checkpoint" } },
  { id: "leviticus-complete", title: "Sede santos", description: "Conclua todos os checkpoints de Levítico.", icon: "✧", condition: { type: "checkpoint", id: "leviticus-u05-checkpoint" } },
  { id: "numbers-complete", title: "No deserto", description: "Conclua todos os checkpoints de Números.", icon: "⌁", condition: { type: "checkpoint", id: "numbers-u06-checkpoint" } },
  { id: "deuteronomy-complete", title: "Escolhe a vida", description: "Conclua todos os checkpoints de Deuteronômio.", icon: "◉", condition: { type: "checkpoint", id: "deuteronomy-u06-checkpoint" } },
  { id: "pentateuch-complete", title: "Pentateuco", description: "Conclua a jornada pelos cinco livros de Moisés.", icon: "⬟", condition: { type: "checkpoint", id: "deuteronomy-u06-checkpoint" } },
  { id: "joshua-complete", title: "Forte e corajoso", description: "Conclua todos os checkpoints de Josué.", icon: "◫", condition: { type: "checkpoint", id: "joshua-u05-checkpoint" } },
  { id: "judges-complete", title: "Ciclos rompidos", description: "Conclua todos os checkpoints de Juízes.", icon: "⚖", condition: { type: "checkpoint", id: "judges-u05-checkpoint" } },
  { id: "ruth-complete", title: "Amor leal", description: "Conclua todos os checkpoints de Rute.", icon: "❋", condition: { type: "checkpoint", id: "ruth-u02-checkpoint" } },
  { id: "first-samuel-complete", title: "Coração que ouve", description: "Conclua todos os checkpoints de 1 Samuel.", icon: "◖", condition: { type: "checkpoint", id: "1-samuel-u06-checkpoint" } },
  { id: "second-samuel-complete", title: "Reino e aliança", description: "Conclua todos os checkpoints de 2 Samuel.", icon: "♔", condition: { type: "checkpoint", id: "2-samuel-u06-checkpoint" } },
  { id: "early-history-complete", title: "Da terra ao reino", description: "Conclua Josué, Juízes, Rute e os livros de Samuel.", icon: "✺", condition: { type: "checkpoint", id: "2-samuel-u06-checkpoint" } },
  { id: "deepen-genesis-one", title: "Raízes profundas", description: "Conclua o checkpoint avançado de Gênesis 1.", icon: "⌁", condition: { type: "checkpoint", id: "deepen-genesis-u01-checkpoint" } },
  { id: "formation-first-subject", title: "Chamado em formação", description: "Conclua a primeira matéria da Formação Pastoral.", icon: "N", condition: { type: "checkpoint", id: "manual-exam" } },
  { id: "formation-complete", title: "Preparado para servir", description: "Conclua o simulado final da Formação Pastoral.", icon: "✦", condition: { type: "checkpoint", id: "formation-final-exam" } },
  { id: "faithful-three", title: "Fiel na caminhada", description: "Estude por três dias seguidos.", icon: "🔥", condition: { type: "streak", days: 3 } },
  { id: "preacher", title: "Pregador", description: "Gere dez prompts de esboço.", icon: "♢", condition: { type: "prompts", promptType: "sermon", count: 10 } }
];

function met(state: AppState, condition: AchievementCondition): boolean {
  switch (condition.type) {
    case "lessons": return state.completedLessonIds.length >= condition.count;
    case "xp": return state.xp >= condition.amount;
    case "perfect-lessons": return state.perfectLessonIds.length >= condition.count;
    case "checkpoint": return state.completedCheckpointIds.includes(condition.id);
    case "streak": return state.streak >= condition.days;
    case "prompts": return (state.promptsGenerated[condition.promptType] ?? 0) >= condition.count;
  }
}

export function evaluateAchievements(state: AppState): string[] {
  return ACHIEVEMENTS.filter((achievement) => met(state, achievement.condition)).map(
    (achievement) => achievement.id
  );
}
