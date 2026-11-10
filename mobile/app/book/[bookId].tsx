import { useLocalSearchParams } from "expo-router";
import { BookTrail } from "../../components/BookTrail";

/** Trilha de um livro escolhido na lista de livros. */
export default function BookScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  return <BookTrail bookId={bookId} />;
}
