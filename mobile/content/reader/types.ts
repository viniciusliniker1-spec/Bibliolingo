export type ReaderLanguage = "grc" | "hbo";

/** Uma palavra do texto original: forma, transliteração, sentido literal e uma nota de leitura. */
export interface ReaderWord {
  text: string;
  translit: string;
  gloss: string;
  note?: string;
}

export interface ReaderPassage {
  id: string;
  /** 1 palavras · 2 frases · 3 versículos · 4 passagens */
  level: 1 | 2 | 3 | 4;
  title: string;
  /** Referência bíblica; vazia nos grupos de palavras. */
  ref: string;
  /** "words" = lista de palavras soltas; "text" = texto corrido. */
  kind: "words" | "text";
  words: ReaderWord[];
  translation: string;
  /** O que esta leitura ensina. */
  focus: string;
}

export interface ReaderLevel {
  level: ReaderPassage["level"];
  title: string;
  subtitle: string;
}

export const READER_LEVELS: ReaderLevel[] = [
  { level: 1, title: "Primeiras palavras", subtitle: "Decodifique palavras que você já conhece" },
  { level: 2, title: "Frases curtas", subtitle: "Artigo, verbo “ser” e ordem das palavras" },
  { level: 3, title: "Versículos", subtitle: "Leia versículos inteiros com apoio" },
  { level: 4, title: "Passagens", subtitle: "Textos mais longos, até ler sozinho" }
];

/** Monta uma palavra a partir de [texto, transliteração, sentido, nota?]. */
export const W = (text: string, translit: string, gloss: string, note?: string): ReaderWord => ({ text, translit, gloss, note });
