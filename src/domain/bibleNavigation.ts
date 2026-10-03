import { bibleBooks } from "../content/bible/catalog";
import type { BibleReference } from "../types/content";

export function buildBibleReaderPath(reference: BibleReference, returnTo?: string) {
  const book = bibleBooks.find((item) => item.id === reference.bookId);
  if (!book) return undefined;
  const params = new URLSearchParams({
    book: book.osis,
    chapter: String(reference.startChapter),
    verse: String(reference.startVerse ?? 1)
  });
  if (returnTo && isSafeTaskReturnPath(returnTo)) params.set("return", returnTo);
  return "/bible?" + params.toString();
}

export function isSafeTaskReturnPath(value: string | null | undefined): value is string {
  return Boolean(value && /^\/lesson\/[a-z0-9-]+$/i.test(value));
}
