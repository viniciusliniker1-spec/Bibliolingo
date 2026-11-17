import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { sounds } from "../services/sounds";
import type { FeedbackSound } from "../services/soundEngine";

export type { FeedbackSound };

/**
 * Sons e vibração de feedback. Os players são compartilhados por todo o app (services/sounds),
 * então chamar este hook em várias telas não cria mais players.
 */
export function useFeedbackEffects(settings: { soundEnabled: boolean; hapticsEnabled: boolean }) {
  return useCallback((kind: FeedbackSound) => {
    if (settings.soundEnabled) void sounds.play(kind);
    if (!settings.hapticsEnabled) return;
    if (kind === "wrong") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    else if (kind === "select" || kind === "match") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    else if (kind === "combo1" || kind === "combo2" || kind === "combo3") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    else if (kind !== "start" && kind !== "noah") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [settings.hapticsEnabled, settings.soundEnabled]);
}
