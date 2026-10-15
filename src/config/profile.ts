import type { KnowledgeLevel, StudyGoal, UserProfile } from "../types/progress";

export const STUDY_GOALS: ReadonlyArray<{ id: StudyGoal; icon: string; label: string }> = [
  { id: "know-bible", icon: "◉", label: "Conhecer melhor a Bíblia" },
  { id: "daily-habit", icon: "☀", label: "Criar hábito diário" },
  { id: "deepen", icon: "⌁", label: "Aprofundar conhecimento" },
  { id: "teach", icon: "◇", label: "Preparar-me para ensinar" },
  { id: "theology", icon: "✦", label: "Formação teológica" }
];

export const DAILY_GOALS: ReadonlyArray<{
  xp: UserProfile["dailyGoal"];
  title: string;
  note: string;
}> = [
  { xp: 50, title: "Casual", note: "5–8 minutos" },
  { xp: 100, title: "Regular", note: "10–15 minutos" },
  { xp: 150, title: "Dedicado", note: "15–20 minutos" },
  { xp: 200, title: "Intenso", note: "20+ minutos" }
];

export const KNOWLEDGE_LEVELS: ReadonlyArray<{
  id: KnowledgeLevel;
  title: string;
  note: string;
  icon: string;
}> = [
  { id: "beginner", title: "Iniciante", note: "Mais orientação e fundamentos", icon: "○" },
  { id: "intermediate", title: "Intermediário", note: "Jornada bíblica equilibrada", icon: "◉" },
  { id: "advanced", title: "Avançado", note: "Libera a jornada Aprofundar", icon: "⌁" }
];
