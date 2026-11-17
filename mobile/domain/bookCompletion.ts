/**
 * Conclusão de livro: descobre quando o aluno terminou um livro da jornada e qual é o próximo.
 * Lógica pura (recebe os livros por parâmetro), usada pela tela de resultado e pela de felicitações.
 */
export interface BookLike {
  id: string;
  title: string;
  units: { lessons: { id: string }[]; checkpoint: { id: string } }[];
}

/** Todas as etapas do livro: lições e checkpoints de cada unidade. */
export function bookActivityIds(book: BookLike): string[] {
  return book.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
}

export function isBookComplete(book: BookLike, completedLessonIds: string[], completedCheckpointIds: string[]): boolean {
  const done = new Set([...completedLessonIds, ...completedCheckpointIds]);
  const ids = bookActivityIds(book);
  return ids.length > 0 && ids.every((id) => done.has(id));
}

export function nextBookOf<T extends BookLike>(books: T[], bookId: string): T | undefined {
  const index = books.findIndex((book) => book.id === bookId);
  return index >= 0 ? books[index + 1] : undefined;
}

export interface BookCelebration<T extends BookLike> {
  book: T;
  next?: T;
  /** Etapas (lições e checkpoints) do livro. */
  activities: number;
  /** Era o último livro da Bíblia. */
  lastOfBible: boolean;
}

/**
 * A atividade que acabou de ser concluída fechou um livro que ainda não foi comemorado?
 * `celebrated` guarda os livros já comemorados, para a tela não reaparecer ao refazer a última lição.
 */
export function bookCelebration<T extends BookLike>(args: {
  books: T[];
  activityId: string;
  completedLessonIds: string[];
  completedCheckpointIds: string[];
  celebrated: string[];
}): BookCelebration<T> | undefined {
  const { books, activityId, completedLessonIds, completedCheckpointIds, celebrated } = args;
  const book = books.find((item) => bookActivityIds(item).includes(activityId));
  if (!book || celebrated.includes(book.id)) return undefined;
  if (!isBookComplete(book, completedLessonIds, completedCheckpointIds)) return undefined;
  const next = nextBookOf(books, book.id);
  return { book, next, activities: bookActivityIds(book).length, lastOfBible: !next };
}
