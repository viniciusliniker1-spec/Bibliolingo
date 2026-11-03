import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { KIDS_AUDIO } from "../content/kids/audio";
import { narrationKey } from "../domain/kidsNarration";
import { speak, stopSpeaking } from "./speech";

let player: AudioPlayer | undefined;
let turn = 0;

function release() {
  try { player?.pause(); player?.remove(); } catch { /* já liberado */ }
  player = undefined;
}

function playClip(source: number, myTurn: number) {
  return new Promise<void>((resolve) => {
    if (myTurn !== turn) return resolve();
    release();
    const current = createAudioPlayer(source);
    player = current;
    const done = () => { sub.remove(); clearTimeout(guard); resolve(); };
    const sub = current.addListener("playbackStatusUpdate", (status) => { if (status.didJustFinish) done(); });
    // Garantia caso o evento de fim não chegue.
    const guard = setTimeout(done, 20000);
    current.play();
  });
}

/**
 * Narra falas do modo criança com a voz gravada (Kokoro). Se faltar algum
 * áudio, lê tudo com a voz do aparelho.
 */
export async function kidsSay(lines: string | string[], rate = 0.9) {
  kidsStop();
  const myTurn = turn;
  const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  const sources = list.map((line) => KIDS_AUDIO[narrationKey(line)]);
  if (sources.some((source) => source === undefined)) {
    await speak(list.join(" "), "pt", undefined, rate);
    return;
  }
  try {
    for (const source of sources) await playClip(source!, myTurn);
  } catch {
    if (myTurn === turn) await speak(list.join(" "), "pt", undefined, rate);
  }
}

export function kidsStop() {
  turn += 1;
  release();
  stopSpeaking();
}
