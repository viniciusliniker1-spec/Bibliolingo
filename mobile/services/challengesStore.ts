import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StreakChallenge } from "../domain/challenges";
import type { ChestReward } from "../domain/chestRewards";

const KEY = "@bibliolingo/challenges/v1";

export interface ChallengesState {
  streak?: StreakChallenge;
  /** Recompensas já recebidas (missões, bônus, mês, desafios de ofensiva). */
  claimed: string[];
  /** Prêmio sorteado em cada baú aberto (id do bônus → prêmio), para mostrar de novo depois. */
  chests?: Record<string, ChestReward>;
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
  const chestIds = Object.keys(state.chests ?? {}).slice(-60);
  const trimmed = { ...state, claimed: state.claimed.slice(-400), chests: Object.fromEntries(chestIds.map((id) => [id, state.chests![id]])) };
  await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
  return trimmed;
}
