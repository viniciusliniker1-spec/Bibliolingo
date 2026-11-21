/**
 * Onde o aluno mais tem errado: base da sugestão do Professor Noah.
 * Considera as respostas dos últimos dias e agrupa por livro da jornada.
 */
import type { QuestionAttempt } from "../../src/types/progress";

export interface BookWithActivities {
  id: string;
  title: string;
  units: { lessons: { id: string }[]; checkpoint: { id: string } }[];
}

export interface WeakArea {
  bookId: string;
  bookTitle: string;
  wrong: number;
  total: number;
  /** Acertos em % (0–100). */
  accuracy: number;
}

export const WEAK_WINDOW_DAYS = 14;
export const WEAK_MIN_WRONG = 3;

function bookByActivity(books: readonly BookWithActivities[]) {
  const map = new Map<string, BookWithActivities>();
  for (const book of books) {
    for (const unit of book.units) {
      for (const lesson of unit.lessons) map.set(lesson.id, book);
      map.set(unit.checkpoint.id, book);
    }
  }
  return map;
}

/** O livro com mais erros recentes, se houver erros suficientes para valer uma sugestão. */
export function weakestBook(attempts: readonly QuestionAttempt[], books: readonly BookWithActivities[], now = new Date()): WeakArea | undefined {
  const since = now.getTime() - WEAK_WINDOW_DAYS * 86_400_000;
  const owner = bookByActivity(books);
  const stats = new Map<string, WeakArea>();
  for (const attempt of attempts) {
    if (attempt.mode !== "lesson" && attempt.mode !== "checkpoint") continue;
    if (new Date(attempt.answeredAt).getTime() < since) continue;
    const book = owner.get(attempt.lessonId);
    if (!book) continue;
    const entry = stats.get(book.id) ?? { bookId: book.id, bookTitle: book.title, wrong: 0, total: 0, accuracy: 100 };
    entry.total += 1;
    if (!attempt.correct) entry.wrong += 1;
    stats.set(book.id, entry);
  }
  const ranked = [...stats.values()]
    .map((entry) => ({ ...entry, accuracy: Math.round(((entry.total - entry.wrong) / entry.total) * 100) }))
    .filter((entry) => entry.wrong >= WEAK_MIN_WRONG)
    .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy);
  return ranked[0];
}

export function weakAreaMessage(area: WeakArea): string {
  return `Notei ${area.wrong} erros recentes em ${area.bookTitle} (${area.accuracy}% de acertos). Que tal revisar esses pontos antes de seguir?`;
}
