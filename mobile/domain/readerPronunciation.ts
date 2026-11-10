import type { ReaderLanguage, ReaderPassage } from "../content/reader/types";
import { stableHash } from "./lessonPlan";

/**
 * Converte a transliteração do Leitor em fonemas (IPA) para a voz gravada.
 * Grego: pronúncia acadêmica (erasmiana simplificada). Hebraico: pronúncia acadêmica sefardita.
 * A sílaba tônica vem do acento da transliteração; o macron (ē, ō) marca vogal longa.
 */
const ACUTE = /[̀́̂]/;
const MACRON = "̄";

type Token = { ph: string; vowel: boolean; stress?: boolean };

const GREEK_DIGRAPHS: [string, string, boolean][] = [
  ["th", "θ", false], ["ch", "x", false], ["ph", "f", false], ["ps", "ps", false], ["rh", "ɾ", false],
  ["ou", "u", true], ["ai", "aj", true], ["ei", "ej", true], ["oi", "oj", true], ["eu", "ew", true], ["au", "aw", true], ["ui", "uj", true]
];
const GREEK_SINGLE: Record<string, [string, boolean]> = {
  a: ["a", true], e: ["e", true], i: ["i", true], o: ["o", true], y: ["y", true], u: ["u", true],
  b: ["b", false], g: ["ɡ", false], d: ["d", false], z: ["z", false], k: ["k", false], l: ["l", false], m: ["m", false], n: ["n", false],
  x: ["ks", false], p: ["p", false], r: ["ɾ", false], s: ["s", false], t: ["t", false], h: ["h", false]
};
const HEBREW_DIGRAPHS: [string, string, boolean][] = [
  ["sh", "ʃ", false], ["kh", "χ", false], ["ts", "ts", false], ["ai", "aj", true], ["ei", "ej", true]
];
const HEBREW_SINGLE: Record<string, [string, boolean]> = {
  a: ["a", true], e: ["e", true], i: ["i", true], o: ["o", true], u: ["u", true],
  b: ["b", false], g: ["ɡ", false], d: ["d", false], h: ["h", false], v: ["v", false], z: ["z", false], ḥ: ["χ", false], t: ["t", false],
  y: ["j", false], k: ["k", false], q: ["k", false], l: ["l", false], m: ["m", false], n: ["n", false], s: ["s", false], f: ["f", false],
  p: ["p", false], r: ["ɾ", false]
};

/** Separa letras-base de acentos, guardando quais letras são tônicas ou longas. */
function letters(word: string) {
  const out: { ch: string; stress: boolean; long: boolean }[] = [];
  for (const piece of word.normalize("NFC").toLowerCase().replace(/[’'᾽]/g, "")) {
    if (piece === "ḥ") { out.push({ ch: "ḥ", stress: false, long: false }); continue; }
    const parts = piece.normalize("NFD");
    const base = parts[0];
    if (!/[a-z]/.test(base)) continue;
    out.push({ ch: base, stress: ACUTE.test(parts), long: parts.includes(MACRON) || parts.includes("̂") });
  }
  return out;
}

function tokenize(word: string, language: ReaderLanguage): Token[] {
  const chars = letters(word);
  // Grego: iota subscrito transliterado (ēi, ōi, āi no fim) não soa.
  if (language === "grc" && chars.length > 2 && chars.at(-1)!.ch === "i" && chars.at(-2)!.long) chars.pop();
  const digraphs = language === "grc" ? GREEK_DIGRAPHS : HEBREW_DIGRAPHS;
  const single = language === "grc" ? GREEK_SINGLE : HEBREW_SINGLE;
  const tokens: Token[] = [];
  for (let i = 0; i < chars.length;) {
    const pair = chars[i].ch + (chars[i + 1]?.ch ?? "");
    const digraph = digraphs.find(([spelling]) => spelling === pair);
    if (digraph) {
      tokens.push({ ph: digraph[1], vowel: digraph[2], stress: chars[i].stress || chars[i + 1].stress });
      i += 2;
      continue;
    }
    // Grego: γ/ν antes de g, k, x soa “ng” (ἄγγελος, εὐαγγέλιον).
    const nasal = language === "grc" && (chars[i].ch === "n" || (chars[i].ch === "g" && chars[i + 1]?.ch === "g")) && ["g", "k", "x"].includes(chars[i + 1]?.ch ?? "");
    const mapped: [string, boolean] | undefined = nasal ? ["ŋ", false] : single[chars[i].ch];
    if (mapped) {
      // Consoantes dobradas (nn, kk, ss) soam como uma só.
      const previous = tokens.at(-1);
      if (!(previous && !mapped[1] && previous.ph === mapped[0])) {
        tokens.push({ ph: mapped[0] + (mapped[1] && chars[i].long && language === "grc" ? "ː" : ""), vowel: mapped[1], stress: chars[i].stress });
      }
    }
    i += 1;
  }
  // Hebraico sem acento escrito: tônica na última sílaba.
  if (language === "hbo" && !tokens.some((token) => token.stress)) {
    const last = [...tokens].reverse().find((token) => token.vowel);
    if (last && tokens.filter((token) => token.vowel).length > 1) last.stress = true;
  }
  return tokens;
}

/** Fonemas de uma palavra transliterada. */
export function wordPhonemes(translit: string, language: ReaderLanguage) {
  const tokens = tokenize(translit, language);
  const stressAt = tokens.findIndex((token) => token.stress && token.vowel);
  let out = "";
  tokens.forEach((token, i) => {
    const onset = stressAt > 0 && !tokens[stressAt - 1].vowel ? stressAt - 1 : stressAt;
    if (i === onset && tokens.filter((t) => t.vowel).length > 1) out += "ˈ";
    out += token.ph;
  });
  return out;
}

/** Fonemas do texto inteiro (palavras soltas com pausa entre elas). */
export function passagePhonemes(passage: ReaderPassage, language: ReaderLanguage) {
  const words = passage.words.map((word) => wordPhonemes(word.translit, language));
  return passage.kind === "words" ? words.join(", ") + "." : words.join(" ") + ".";
}

/** Chave do áudio gravado de uma palavra ou de um texto do Leitor. */
export function readerAudioKey(language: ReaderLanguage, text: string) {
  return "r" + stableHash(`${language}:${text.normalize("NFC").trim()}`).toString(36);
}
