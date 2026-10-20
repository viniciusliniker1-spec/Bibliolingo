import { describe, expect, it } from "vitest";
import { FEEDBACK_SOUND_PATTERNS } from "./feedbackSound";

describe("sons de feedback", () => {
  it("usa uma sequência ascendente e breve no acerto", () => {
    const frequencies = FEEDBACK_SOUND_PATTERNS.correct.map((tone) => tone.frequency);
    expect(frequencies).toHaveLength(3);
    expect(frequencies[0]).toBeLessThan(frequencies[1]);
    expect(frequencies[1]).toBeLessThan(frequencies[2]);
    expect(Math.max(...FEEDBACK_SOUND_PATTERNS.correct.map((tone) => tone.startsAt + tone.duration))).toBeLessThan(0.5);
  });

  it("usa uma fanfarra ascendente e curta na conquista", () => {
    const frequencies = FEEDBACK_SOUND_PATTERNS.achievement.map((tone) => tone.frequency);
    expect(frequencies).toHaveLength(5);
    expect(frequencies.every((frequency, index) => index === 0 || frequency > frequencies[index - 1])).toBe(true);
    expect(Math.max(...FEEDBACK_SOUND_PATTERNS.achievement.map((tone) => tone.startsAt + tone.duration))).toBeLessThan(1);
  });

  it("usa uma sequência descendente e breve no erro", () => {
    const frequencies = FEEDBACK_SOUND_PATTERNS.incorrect.map((tone) => tone.frequency);
    expect(frequencies).toHaveLength(2);
    expect(frequencies[0]).toBeGreaterThan(frequencies[1]);
    expect(Math.max(...FEEDBACK_SOUND_PATTERNS.incorrect.map((tone) => tone.startsAt + tone.duration))).toBeLessThan(0.5);
  });
});
