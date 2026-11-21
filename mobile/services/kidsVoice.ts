import { KIDS_AUDIO } from "../content/kids/audio";
import { narrationKey } from "../domain/kidsNarration";
import { claimClipTurn, isCurrentClipTurn, playClips } from "./clipPlayer";
import { speak, stopSpeaking } from "./speech";

/**
 * Narra falas do modo criança com a voz gravada (Kokoro). Se faltar algum
 * áudio, lê tudo com a voz do aparelho.
 */
export async function kidsSay(lines: string | string[], rate = 0.9) {
  stopSpeaking();
  const myTurn = claimClipTurn();
  const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  const sources = list.map((line) => KIDS_AUDIO[narrationKey(line)]);
  if (sources.some((source) => source === undefined)) {
    await speak(list.join(" "), "pt", undefined, rate);
    return;
  }
  try {
    await playClips(sources as number[], myTurn);
  } catch {
    if (isCurrentClipTurn(myTurn)) await speak(list.join(" "), "pt", undefined, rate);
  }
}

export function kidsStop() {
  claimClipTurn();
  stopSpeaking();
}
