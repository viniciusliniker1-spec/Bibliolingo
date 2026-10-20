import type { BibleBookData } from "../services/bible";
import type { BibleReference } from "../types/content";

export interface BiblePreviewVerse {
  chapter: number;
  number: number;
  text: string;
}

export interface BiblePreviewResult {
  verses: BiblePreviewVerse[];
  truncated: boolean;
}

function verseBounds(reference: BibleReference, chapter: number) {
  const lastChapter = reference.endChapter ?? reference.startChapter;
  const first =
    chapter === reference.startChapter
      ? reference.startVerse ?? 1
      : 1;
  let last = Number.POSITIVE_INFINITY;
  if (chapter === lastChapter) {
    if (reference.endVerse !== undefined) {
      last = reference.endVerse;
    } else if (
      reference.startVerse !== undefined &&
      reference.endChapter === undefined
    ) {
      last = reference.startVerse;
    }
  }
  return { first, last };
}

export function getBiblePreview(
  data: BibleBookData,
  reference: BibleReference,
  limit = 8
): BiblePreviewResult {
  const lastChapter = reference.endChapter ?? reference.startChapter;
  const verses: BiblePreviewVerse[] = [];
  let truncated = false;

  for (let chapterNumber = reference.startChapter; chapterNumber <= lastChapter; chapterNumber += 1) {
    const chapter = data.chapters.find((item) => item.chapter === chapterNumber);
    if (!chapter) continue;
    const bounds = verseBounds(reference, chapterNumber);
    for (const verse of chapter.verses) {
      if (verse.number < bounds.first || verse.number > bounds.last) continue;
      if (verses.length >= limit) {
        truncated = true;
        return { verses, truncated };
      }
      verses.push({ chapter: chapterNumber, number: verse.number, text: verse.text });
    }
  }

  return { verses, truncated };
}
