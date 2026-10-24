import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

export type FeedbackSound = "correct" | "wrong" | "complete" | "checkpoint" | "start" | "noah" | "select" | "achievement";

export function useFeedbackEffects(settings: { soundEnabled: boolean; hapticsEnabled: boolean }) {
  const correct = useAudioPlayer(require("../assets/sounds/correct.wav"));
  const wrong = useAudioPlayer(require("../assets/sounds/wrong.wav"));
  const complete = useAudioPlayer(require("../assets/sounds/complete.wav"));
  const checkpoint = useAudioPlayer(require("../assets/sounds/checkpoint.wav"));
  const start = useAudioPlayer(require("../assets/sounds/start.wav"));
  const noah = useAudioPlayer(require("../assets/sounds/noah.wav"));
  const select = useAudioPlayer(require("../assets/sounds/select.wav"));
  const achievement = useAudioPlayer(require("../assets/sounds/achievement.wav"));

  return useCallback((kind: FeedbackSound) => {
    if (settings.soundEnabled) {
      const players = { correct, wrong, complete, checkpoint, start, noah, select, achievement };
      const player = players[kind];
      void player.seekTo(0).then(() => player.play()).catch(() => undefined);
    }
    if (settings.hapticsEnabled && kind !== "select" && kind !== "start" && kind !== "noah") {
      const type = kind === "wrong" ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success;
      void Haptics.notificationAsync(type).catch(() => undefined);
    }
  }, [achievement, checkpoint, complete, correct, noah, select, settings.hapticsEnabled, settings.soundEnabled, start, wrong]);
}
