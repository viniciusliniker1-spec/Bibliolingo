import type { BibleBookMeta } from "../content/bible/catalog";

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBookData {
  version: string;
  book: string;
  bookId: number;
  englishName: string;
  testament: "OT" | "NT";
  chapters: BibleChapter[];
}

export interface BibleTranslation {
  id: string;
  shortName: string;
  name: string;
  /** Uma linha sobre o estilo, para ajudar a escolher. */
  style: string;
  language: "pt";
  license: string;
  attribution: string;
  sourceName: string;
  sourceUrl: string;
  booksBaseUrl: string;
}

export const BIBLE_TRANSLATION = {
  id: "almeida-1819",
  shortName: "Almeida 1819",
  name: "Almeida 1819 (Bíblia Livre)",
  language: "pt",
  license: "Domínio público",
  sourceName: "Midvash Bible Data",
  sourceUrl: "https://github.com/midvash/bible-data",
  sourceRevision: "d9fe1779447717bbfcb578e505b893125cad581c"
} as const;

/** Commit do repositório Bibliolingo que contém bible-data/pt/nbv-2007. */
const NBV_DATA_REVISION = "4618210c308bf1afef4a10f997f48fde76780550";

export const BIBLE_TRANSLATIONS: readonly BibleTranslation[] = [
  {
    id: BIBLE_TRANSLATION.id,
    shortName: BIBLE_TRANSLATION.shortName,
    name: BIBLE_TRANSLATION.name,
    style: "Clássica e literal, linguagem tradicional da Almeida.",
    language: "pt",
    license: BIBLE_TRANSLATION.license,
    attribution: "Almeida 1819 (Bíblia Livre), domínio público.",
    sourceName: BIBLE_TRANSLATION.sourceName,
    sourceUrl: BIBLE_TRANSLATION.sourceUrl,
    booksBaseUrl: "https://raw.githubusercontent.com/midvash/bible-data/" + BIBLE_TRANSLATION.sourceRevision + "/versions/pt/almeida-livre/books/"
  },
  {
    id: "nbv-2007",
    shortName: "NBV",
    name: "Nova Bíblia Viva (2007)",
    style: "Português atual e fácil de entender.",
    language: "pt",
    license: "CC BY-SA 4.0",
    attribution: "Biblica® Open Nova Bíblia Viva 2007, © Biblica, Inc., CC BY-SA 4.0, via eBible.org.",
    sourceName: "eBible.org (Biblica)",
    sourceUrl: "https://ebible.org/details.php?id=poronbv",
    booksBaseUrl: "https://raw.githubusercontent.com/viniciusliniker1-spec/Bibliolingo/" + NBV_DATA_REVISION + "/bible-data/pt/nbv-2007/"
  }
];

export function bibleTranslationById(id: string | undefined): BibleTranslation {
  return BIBLE_TRANSLATIONS.find((translation) => translation.id === id) ?? BIBLE_TRANSLATIONS[0];
}

const memoryCache = new Map<string, BibleBookData>();

function isBibleBookData(value: unknown): value is BibleBookData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BibleBookData>;
  return (
    typeof candidate.book === "string" &&
    Array.isArray(candidate.chapters) &&
    candidate.chapters.every(
      (chapter) =>
        typeof chapter?.chapter === "number" &&
        Array.isArray(chapter.verses) &&
        chapter.verses.every(
          (verse) => typeof verse?.number === "number" && typeof verse.text === "string"
        )
    )
  );
}

export async function loadBibleBook(
  book: BibleBookMeta,
  signal?: AbortSignal,
  translationId: string = BIBLE_TRANSLATION.id
): Promise<BibleBookData> {
  const translation = bibleTranslationById(translationId);
  const cacheKey = translation.id + ":" + book.osis;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(translation.booksBaseUrl + encodeURIComponent(book.osis) + ".json", {
    signal,
    cache: "force-cache"
  });
  if (!response.ok) throw new Error("Não foi possível carregar " + book.name + ".");
  const data: unknown = await response.json();
  if (!isBibleBookData(data) || data.book !== book.osis) {
    throw new Error("O arquivo bíblico recebido é inválido.");
  }
  memoryCache.set(cacheKey, data);
  return data;
}
