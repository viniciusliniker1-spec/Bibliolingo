import { useEffect, useRef } from "react";
import { InteractionManager } from "react-native";
import { unlockedBibleSkinIds } from "../domain/lumiWallet";
import { useMobileProgress } from "../providers/MobileProgressProvider";

/**
 * Libera as skins da Bíblia dos livros concluídos. Roda quando o progresso muda (lições, checkpoints ou
 * conquistas) e carrega o catálogo só depois que a tela termina de abrir, para não atrasar nada.
 */
export function BibleSkinCoordinator() {
  const { progress, hydrated, unlockBibleSkins } = useMobileProgress();
  const key = `${progress.completedLessonIds.length}:${progress.completedCheckpointIds.length}:${progress.earnedAchievementIds.length}`;
  const lastKey = useRef<string | undefined>(undefined);
  const latest = useRef(progress);
  latest.current = progress;

  useEffect(() => {
    if (!hydrated || lastKey.current === key) return;
    lastKey.current = key;
    let active = true;
    const task = InteractionManager.runAfterInteractions(() => {
      void import("../../src/content/catalog").then(({ journeyBooks }) => {
        if (!active) return;
        const ids = unlockedBibleSkinIds(journeyBooks, latest.current);
        if (ids.length) unlockBibleSkins(ids);
      }).catch(() => undefined);
    });
    return () => { active = false; task.cancel(); };
  }, [hydrated, key, unlockBibleSkins]);

  return null;
}
