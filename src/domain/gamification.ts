import { GAMIFICATION } from "../config/gamification";

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpNeeded: number;
  ratio: number;
}

export function xpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return GAMIFICATION.levelCurveBase * Math.pow(safeLevel - 1, 2);
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = Math.floor(Math.sqrt(xp / GAMIFICATION.levelCurveBase)) + 1;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = nextLevelXp - currentLevelXp;
  const xpIntoLevel = xp - currentLevelXp;
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeeded: span,
    ratio: span === 0 ? 1 : Math.min(1, xpIntoLevel / span)
  };
}

export function calculateLessonXp(
  answeredExercises: number,
  perfect: boolean,
  checkpoint = false
): number {
  const exerciseXp = answeredExercises * GAMIFICATION.xp.exercise;
  if (checkpoint) return exerciseXp + GAMIFICATION.xp.checkpoint;
  return exerciseXp + GAMIFICATION.xp.lesson + (perfect ? GAMIFICATION.xp.perfectLesson : 0);
}
