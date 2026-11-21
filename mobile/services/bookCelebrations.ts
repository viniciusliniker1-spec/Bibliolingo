import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@bibliolingo/book-celebrations/v1";

/** Livros cuja tela de felicitações já foi mostrada neste aparelho. */
export async function loadCelebratedBooks(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function markBookCelebrated(bookId: string): Promise<void> {
  try {
    const current = await loadCelebratedBooks();
    if (!current.includes(bookId)) await AsyncStorage.setItem(KEY, JSON.stringify([...current, bookId]));
  } catch {
    // Sem armazenamento, no pior caso a tela aparece de novo.
  }
}
