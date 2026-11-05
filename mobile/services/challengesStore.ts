import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StreakChallenge } from "../domain/challenges";

const KEY = "@bibliolingo/challenges/v1";

export interface ChallengesState {
  streak?: StreakChallenge;
  /** Recompensas já recebidas (missões, bônus, mês, desafios de ofensiva). */
  claimed: string[];
  /** Desafios de ofensiva concluídos. */
  history: { days: number; startedOn: string; completedOn: string }[];
}

const EMPTY: ChallengesState = { claimed: [], history: [] };

export async function loadChallenges(): Promise<ChallengesState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<ChallengesState>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function saveChallenges(state: ChallengesState) {
  // Guarda só as recompensas recentes para não crescer sem limite.
  const trimmed = { ...state, claimed: state.claimed.slice(-400) };
  await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
  return trimmed;
}
