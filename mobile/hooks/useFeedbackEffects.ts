import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

export function useFeedbackEffects(settings: { soundEnabled: boolean; hapticsEnabled: boolean }) {
  const correct = useAudioPlayer(require("../assets/sounds/correct.wav"));
  const wrong = useAudioPlayer(require("../assets/sounds/wrong.wav"));
  const complete = useAudioPlayer(require("../assets/sounds/complete.wav"));

  return useCallback((kind: "correct" | "wrong" | "complete") => {
    if (settings.soundEnabled) {
      const player = kind === "correct" ? correct : kind === "wrong" ? wrong : complete;
      void player.seekTo(0).then(() => player.play()).catch(() => undefined);
    }
    if (settings.hapticsEnabled) {
      const type = kind === "wrong"
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success;
      void Haptics.notificationAsync(type).catch(() => undefined);
    }
  }, [complete, correct, settings.hapticsEnabled, settings.soundEnabled, wrong]);
}
