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

const memoryCache = new Map<string, BibleBookData>();
const sourceBase =
  "https://raw.githubusercontent.com/midvash/bible-data/" +
  BIBLE_TRANSLATION.sourceRevision +
  "/versions/pt/almeida-livre/books/";

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

export async function loadBibleBook(book: BibleBookMeta, signal?: AbortSignal): Promise<BibleBookData> {
  const cached = memoryCache.get(book.osis);
  if (cached) return cached;

  const response = await fetch(sourceBase + encodeURIComponent(book.osis) + ".json", {
    signal,
    cache: "force-cache"
  });
  if (!response.ok) throw new Error("Não foi possível carregar " + book.name + ".");
  const data: unknown = await response.json();
  if (!isBibleBookData(data) || data.book !== book.osis) {
    throw new Error("O arquivo bíblico recebido é inválido.");
  }
  memoryCache.set(book.osis, data);
  return data;
}
