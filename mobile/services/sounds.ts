import { AppState, InteractionManager } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { createSoundEngine, type FeedbackSound } from "./soundEngine";

/** Sons originais gerados por mobile/scripts/sounds/generate.py. */
const SOURCES: Record<FeedbackSound, number> = {
  correct: require("../assets/sounds/correct.wav"),
  wrong: require("../assets/sounds/wrong.wav"),
  complete: require("../assets/sounds/complete.wav"),
  checkpoint: require("../assets/sounds/checkpoint.wav"),
  start: require("../assets/sounds/start.wav"),
  noah: require("../assets/sounds/noah.wav"),
  select: require("../assets/sounds/select.wav"),
  achievement: require("../assets/sounds/achievement.wav"),
  combo1: require("../assets/sounds/combo1.wav"),
  combo2: require("../assets/sounds/combo2.wav"),
  combo3: require("../assets/sounds/combo3.wav"),
  match: require("../assets/sounds/match.wav"),
  chest: require("../assets/sounds/achievement.wav")
};

export const sounds = createSoundEngine({
  sources: SOURCES,
  create: (source) => createAudioPlayer(source),
  configure: () => setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers", shouldPlayInBackground: false })
});

let started = false;
/** Prepara os sons depois da abertura e acompanha o app indo e voltando do segundo plano. */
export function startSounds() {
  if (started) return;
  started = true;
  InteractionManager.runAfterInteractions(() => {
    const kinds: FeedbackSound[] = ["select", "correct", "wrong", "start", "complete", "combo1", "match", "checkpoint", "achievement", "combo2", "combo3", "noah"];
    kinds.forEach((kind, index) => setTimeout(() => sounds.preload([kind]), index * 120));
  });
  AppState.addEventListener("change", (state) => {
    if (state === "active") sounds.onForeground();
    else sounds.onBackground();
  });
}
