export type HapticFeedbackKind = "correct" | "incorrect";

export const HAPTIC_PATTERNS: Record<HapticFeedbackKind, readonly number[]> = {
  correct: [24],
  incorrect: [45, 35, 45]
};

export function playHapticFeedback(kind: HapticFeedbackKind): boolean {
  try {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.vibrate !== "function" ||
      (typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    ) {
      return false;
    }
    return navigator.vibrate([...HAPTIC_PATTERNS[kind]]);
  } catch {
    return false;
  }
}
