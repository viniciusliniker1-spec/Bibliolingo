import { READER_AUDIO } from "../content/reader/audio";
import type { ReaderLanguage } from "../content/reader/types";
import { readerAudioKey } from "../domain/readerPronunciation";
import { claimClipTurn, isCurrentClipTurn, playClips } from "./clipPlayer";
import { speak, stopSpeaking } from "./speech";

/**
 * Lê uma palavra ou um texto do Leitor com a voz gravada (pronúncia acadêmica).
 * Sem gravação, usa a voz do aparelho ou, se faltar voz no idioma, a transliteração.
 */
export async function readerSay(language: ReaderLanguage, text: string, translit: string, rate = 0.7) {
  stopSpeaking();
  const myTurn = claimClipTurn();
  const source = READER_AUDIO[readerAudioKey(language, text)];
  if (source !== undefined) {
    try {
      await playClips([source], myTurn);
      return;
    } catch {
      if (!isCurrentClipTurn(myTurn)) return;
    }
  }
  await speak(text, language, translit, rate);
}

export function readerStop() {
  claimClipTurn();
  stopSpeaking();
}
