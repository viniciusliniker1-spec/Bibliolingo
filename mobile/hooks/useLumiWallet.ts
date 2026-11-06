import { useMemo } from "react";
import { earnedCoins, equippedSkinId, LUMI_SKINS, skinState, spentCoins, walletBalance } from "../domain/lumiWallet";
import { useMobileProgress } from "../providers/MobileProgressProvider";

/** Carteira da Lumi: saldo, skins e ações, tudo calculado no aparelho. */
export function useLumiWallet() {
  const { progress, purchaseLumiSkin, equipLumiSkin } = useMobileProgress();
  const { completedLessonIds, completedCheckpointIds, earnedAchievementIds, lumiWallet } = progress;
  return useMemo(() => {
    const walletProgress = { completedLessonIds, completedCheckpointIds, earnedAchievementIds, lumiWallet };
    return {
      balance: walletBalance(walletProgress),
      earned: earnedCoins(walletProgress),
      spent: spentCoins(lumiWallet),
      equippedSkinId: equippedSkinId(lumiWallet),
      skins: LUMI_SKINS.map((skin) => ({ ...skin, state: skinState(skin, walletProgress) })),
      purchase: purchaseLumiSkin,
      equip: equipLumiSkin
    };
  }, [completedLessonIds, completedCheckpointIds, earnedAchievementIds, lumiWallet, purchaseLumiSkin, equipLumiSkin]);
}
