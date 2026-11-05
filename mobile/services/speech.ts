import * as Speech from "expo-speech";

export type SpeechLanguage = "pt" | "grc" | "hbo" | "arc";

const LOCALE: Record<SpeechLanguage, string> = { pt: "pt-BR", grc: "el-GR", hbo: "he-IL", arc: "he-IL" };
let voices: Promise<Speech.Voice[]> | undefined;

async function hasVoice(locale: string) {
  voices ??= Speech.getAvailableVoicesAsync().catch(() => []);
  const list = await voices;
  const prefix = locale.slice(0, 2).toLowerCase();
  // O Android ainda identifica o hebraico pelo código antigo "iw".
  const prefixes = prefix === "he" ? ["he", "iw"] : [prefix];
  // Alguns aparelhos não informam as vozes: nesse caso tentamos mesmo assim.
  return !list.length || list.some((voice) => prefixes.some((code) => voice.language?.toLowerCase().startsWith(code)));
}

/**
 * Fala um texto. Para grego e hebraico usa a voz do aparelho no idioma (pronúncia
 * moderna, aproximada); se não houver voz instalada, lê a transliteração em português.
 * Retorna o que foi falado e se foi a transliteração.
 */
export async function speak(text: string, language: SpeechLanguage, fallback?: string, rate = 0.85) {
  Speech.stop();
  const locale = LOCALE[language];
  if (language === "pt" || await hasVoice(locale)) {
    Speech.speak(text, { language: locale, rate });
    return { spoken: text, usedFallback: false };
  }
  const value = fallback ?? text;
  Speech.speak(value, { language: "pt-BR", rate });
  return { spoken: value, usedFallback: true };
}

export function stopSpeaking() {
  Speech.stop();
}
