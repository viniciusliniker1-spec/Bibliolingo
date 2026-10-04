export type FeedbackSoundKind = "correct" | "incorrect" | "achievement";

export interface SoundTone {
  frequency: number;
  startsAt: number;
  duration: number;
  wave: OscillatorType;
}

export const FEEDBACK_SOUND_PATTERNS: Record<FeedbackSoundKind, readonly SoundTone[]> = {
  correct: [
    { frequency: 523.25, startsAt: 0, duration: 0.1, wave: "sine" },
    { frequency: 659.25, startsAt: 0.075, duration: 0.12, wave: "sine" },
    { frequency: 783.99, startsAt: 0.16, duration: 0.16, wave: "triangle" }
  ],
  incorrect: [
    { frequency: 220, startsAt: 0, duration: 0.15, wave: "triangle" },
    { frequency: 174.61, startsAt: 0.11, duration: 0.2, wave: "triangle" }
  ],
  achievement: [
    { frequency: 392, startsAt: 0, duration: 0.16, wave: "triangle" },
    { frequency: 523.25, startsAt: 0.09, duration: 0.18, wave: "sine" },
    { frequency: 659.25, startsAt: 0.2, duration: 0.2, wave: "sine" },
    { frequency: 783.99, startsAt: 0.32, duration: 0.24, wave: "triangle" },
    { frequency: 1046.5, startsAt: 0.48, duration: 0.34, wave: "sine" }
  ]
};

let sharedContext: AudioContext | undefined;

export async function playFeedbackSound(kind: FeedbackSoundKind): Promise<void> {
  try {
    if (typeof window === "undefined" || !window.AudioContext) return;
    const context = sharedContext ?? new window.AudioContext();
    sharedContext = context;
    if (context.state === "suspended") await context.resume();

    const start = context.currentTime + 0.01;
    for (const tone of FEEDBACK_SOUND_PATTERNS[kind]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const toneStart = start + tone.startsAt;
      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
      gain.gain.setValueAtTime(0.0001, toneStart);
      const peakVolume = kind === "incorrect" ? 0.055 : kind === "achievement" ? 0.068 : 0.075;
      gain.gain.exponentialRampToValueAtTime(peakVolume, toneStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + tone.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(toneStart);
      oscillator.stop(toneStart + tone.duration + 0.02);
    }
  } catch {
    // Áudio é um aprimoramento: falhas do navegador nunca interrompem a lição.
  }
}
