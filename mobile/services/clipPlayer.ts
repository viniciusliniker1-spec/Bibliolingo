import { createAudioPlayer, type AudioPlayer } from "expo-audio";

let player: AudioPlayer | undefined;
let turn = 0;

function release() {
  try { player?.pause(); player?.remove(); } catch { /* já liberado */ }
  player = undefined;
}

function playOne(source: number, myTurn: number) {
  return new Promise<void>((resolve) => {
    if (myTurn !== turn) return resolve();
    release();
    const current = createAudioPlayer(source);
    player = current;
    const done = () => { sub.remove(); clearTimeout(guard); resolve(); };
    const sub = current.addListener("playbackStatusUpdate", (status) => { if (status.didJustFinish) done(); });
    // Garantia caso o evento de fim não chegue.
    const guard = setTimeout(done, 30000);
    current.play();
  });
}

/** Interrompe o que estiver tocando e devolve o número da nova vez. */
export function claimClipTurn() {
  turn += 1;
  release();
  return turn;
}

export function isCurrentClipTurn(myTurn: number) {
  return myTurn === turn;
}

/** Toca áudios gravados em sequência. Lança erro se o aparelho não conseguir tocar. */
export async function playClips(sources: number[], myTurn: number) {
  for (const source of sources) await playOne(source, myTurn);
}
