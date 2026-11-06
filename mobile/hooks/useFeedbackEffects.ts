import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

/** Sons originais gerados por mobile/scripts/sounds/generate.py. */
export type FeedbackSound =
  | "correct" | "wrong" | "complete" | "checkpoint" | "start" | "noah" | "select" | "achievement"
  | "combo1" | "combo2" | "combo3" | "match";

export function useFeedbackEffects(settings: { soundEnabled: boolean; hapticsEnabled: boolean }) {
  const correct = useAudioPlayer(require("../assets/sounds/correct.wav"));
  const wrong = useAudioPlayer(require("../assets/sounds/wrong.wav"));
  const complete = useAudioPlayer(require("../assets/sounds/complete.wav"));
  const checkpoint = useAudioPlayer(require("../assets/sounds/checkpoint.wav"));
  const start = useAudioPlayer(require("../assets/sounds/start.wav"));
  const noah = useAudioPlayer(require("../assets/sounds/noah.wav"));
  const select = useAudioPlayer(require("../assets/sounds/select.wav"));
  const achievement = useAudioPlayer(require("../assets/sounds/achievement.wav"));
  const combo1 = useAudioPlayer(require("../assets/sounds/combo1.wav"));
  const combo2 = useAudioPlayer(require("../assets/sounds/combo2.wav"));
  const combo3 = useAudioPlayer(require("../assets/sounds/combo3.wav"));
  const match = useAudioPlayer(require("../assets/sounds/match.wav"));

  return useCallback((kind: FeedbackSound) => {
    if (settings.soundEnabled) {
      const players = { correct, wrong, complete, checkpoint, start, noah, select, achievement, combo1, combo2, combo3, match };
      const player = players[kind];
      void player.seekTo(0).then(() => player.play()).catch(() => undefined);
    }
    if (!settings.hapticsEnabled) return;
    if (kind === "wrong") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    else if (kind === "select" || kind === "match") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    else if (kind === "combo1" || kind === "combo2" || kind === "combo3") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    else if (kind !== "start" && kind !== "noah") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [achievement, checkpoint, combo1, combo2, combo3, complete, correct, match, noah, select, settings.hapticsEnabled, settings.soundEnabled, start, wrong]);
}
