import {
  bibleBookByOsis,
  bibleBooks,
  type BibleBookMeta
} from "../content/bible/catalog";

export interface ParsedBibleReference {
  book: BibleBookMeta;
  chapter: number;
  verse: number;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[.ªº]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const bookAliases = new Map<string, BibleBookMeta>();
for (const book of bibleBooks) {
  for (const alias of [book.name, book.abbreviation, book.osis, book.id]) {
    const normalized = normalize(alias);
    bookAliases.set(normalized, book);
    bookAliases.set(normalized.replace(/\s/g, ""), book);
  }
}

function findBook(value: string) {
  const normalized = normalize(value);
  return bookAliases.get(normalized) ?? bookAliases.get(normalized.replace(/\s/g, ""));
}

export function parseBibleReference(
  input: string,
  currentBookOsis: string,
  currentChapter: number
): ParsedBibleReference | undefined {
  const value = normalize(input);
  const currentBook = bibleBookByOsis.get(currentBookOsis);
  if (!value || !currentBook) return undefined;

  const verseOnly = value.match(/^(\d+)$/);
  if (verseOnly) {
    return { book: currentBook, chapter: currentChapter, verse: Number(verseOnly[1]) };
  }

  const currentBookReference = value.match(/^(\d+)\s*[:;,]\s*(\d+)$/);
  if (currentBookReference) {
    const chapter = Number(currentBookReference[1]);
    const verse = Number(currentBookReference[2]);
    if (chapter < 1 || chapter > currentBook.chapters || verse < 1) return undefined;
    return { book: currentBook, chapter, verse };
  }

  const fullReference = value.match(/^(.+?)\s+(\d+)\s*[:;,]\s*(\d+)$/);
  if (!fullReference) return undefined;
  const book = findBook(fullReference[1]);
  const chapter = Number(fullReference[2]);
  const verse = Number(fullReference[3]);
  if (!book || chapter < 1 || chapter > book.chapters || verse < 1) return undefined;
  return { book, chapter, verse };
}

export function bibleAnnotationId(
  translationId: string,
  bookOsis: string,
  chapter: number,
  verse: number
) {
  return [translationId, bookOsis, chapter, verse].join(":");
}
