import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { toLocalDateKey } from "../../src/domain/streak";
import { ALL_QUESTS_BONUS, dailyQuests, monthlyChallenge, streakChallengeStatus } from "../domain/challenges";
import { useMobileLumi } from "../providers/MobileLumiProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { loadChallenges, saveChallenges, type ChallengesState } from "../services/challengesStore";
import { rewardCoins, rollChestReward, type ChestReward } from "../domain/chestRewards";

/** Estado dos desafios + ações (começar, desistir, receber recompensas em moedas Lumi). */
export function useChallenges() {
  const { progress, grantChestReward } = useMobileProgress();
  const lumi = useMobileLumi();
  const [state, setState] = useState<ChallengesState>({ claimed: [], history: [] });
  const [ready, setReady] = useState(false);
  const reload = useCallback(() => { void loadChallenges().then((value) => { setState(value); setReady(true); }); }, []);
  useEffect(reload, [reload]);
  useFocusEffect(reload);

  const input = useMemo(() => ({ activity: progress.activity, attempts: progress.attempts, dailyGoal: progress.profile.dailyGoal }), [progress.activity, progress.attempts, progress.profile.dailyGoal]);
  const quests = useMemo(() => dailyQuests(input), [input]);
  const month = useMemo(() => monthlyChallenge(input), [input]);
  const streak = useMemo(() => (state.streak ? streakChallengeStatus(state.streak, progress.activity) : undefined), [state.streak, progress.activity]);
  const today = toLocalDateKey(new Date());
  const bonusId = `bonus:${today}`;

  const update = useCallback(async (change: (current: ChallengesState) => ChallengesState) => {
    const next = await saveChallenges(change(await loadChallenges()));
    setState(next);
    return next;
  }, []);

  const claim = useCallback(async (id: string, amount: number) => {
    const current = await loadChallenges();
    if (current.claimed.includes(id)) return false;
    await lumi.creditOffline(`challenge:${id}`, amount);
    await update((value) => ({ ...value, claimed: [...value.claimed, id] }));
    return true;
  }, [lumi, update]);

  /** Abre o baú do dia: sorteia o prêmio, marca como aberto (uma vez só) e entrega na carteira. */
  const openChest = useCallback(async (): Promise<ChestReward | undefined> => {
    const current = await loadChallenges();
    if (current.claimed.includes(bonusId)) return current.chests?.[bonusId];
    const reward = rollChestReward(Math.random, progress.lumiWallet?.stickers ?? {});
    // Marca antes de entregar: se algo falhar no meio, o baú não pode ser aberto de novo para sortear outro prêmio.
    await update((value) => ({ ...value, claimed: [...value.claimed, bonusId], chests: { ...(value.chests ?? {}), [bonusId]: reward } }));
    const coins = rewardCoins(reward);
    if (coins > 0) await lumi.creditOffline(`challenge:${bonusId}`, coins);
    grantChestReward(reward);
    return reward;
  }, [bonusId, grantChestReward, lumi, progress.lumiWallet?.stickers, update]);

  const startStreak = useCallback((days: number) => update((value) => ({ ...value, streak: { days, startedOn: today } })), [today, update]);
  const quitStreak = useCallback(() => update((value) => ({ ...value, streak: undefined })), [update]);
  const finishStreak = useCallback(async () => {
    if (!state.streak || !streak || streak.state !== "completed") return false;
    const id = `streak:${state.streak.startedOn}:${state.streak.days}`;
    const ok = await claim(id, streak.tier.reward);
    await update((value) => ({ ...value, streak: undefined, history: [...value.history, { ...state.streak!, completedOn: today }] }));
    return ok;
  }, [claim, state.streak, streak, today, update]);

  const allQuestsDone = quests.every((quest) => quest.current >= quest.target);
  return {
    ready, state, quests, month, streak, bonusId, allQuestsDone,
    isClaimed: (id: string) => state.claimed.includes(id),
    claim, openChest, startStreak, quitStreak, finishStreak,
    bonusReward: ALL_QUESTS_BONUS,
    /** Missões prontas para receber + desafio do mês/ofensiva concluídos (badge). */
    pending: quests.filter((quest) => quest.current >= quest.target && !state.claimed.includes(quest.id)).length
      + (allQuestsDone && !state.claimed.includes(bonusId) ? 1 : 0)
      + (month.current >= month.target && !state.claimed.includes(`month:${month.id}`) ? 1 : 0)
      + (streak?.state === "completed" ? 1 : 0)
  };
}
