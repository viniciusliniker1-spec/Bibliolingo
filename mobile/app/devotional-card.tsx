import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { bibleBookByOsis } from "../../src/content/bible/catalog";
import { routeBackgrounds } from "../assets/sceneAssets";
import { DevotionalCard } from "../components/DevotionalCard";
import { ShareScreen } from "../components/ShareScreen";
import { devotionalFor, devotionalDateKey, devotionalShareCaption, devotionalReference } from "../domain/devotional";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { loadCachedBibleBook } from "../services/bibleStorage";
import { loadKnownDevotionals } from "../services/devotional";
import type { Devotional } from "../domain/devotional";

/** Cartão do devocional para compartilhar (versículo + frase-chave). */
export default function DevotionalCardScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const [devotional, setDevotional] = useState<Devotional>();
  const [verse, setVerse] = useState("");
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").trim() || undefined;

  useEffect(() => {
    let active = true;
    void loadKnownDevotionals().then((known) => { if (active) setDevotional(devotionalFor(typeof date === "string" ? date : devotionalDateKey(), known).devotional); });
    return () => { active = false; };
  }, [date]);

  useEffect(() => {
    if (!devotional) return;
    const book = bibleBookByOsis.get(devotional.verse.book);
    if (!book) return;
    let active = true;
    void loadCachedBibleBook(book).then((data) => {
      const verses = data.chapters.find((chapter) => chapter.chapter === devotional.verse.chapter)?.verses ?? [];
      const text = verses.filter((item) => item.number >= devotional.verse.from && item.number <= devotional.verse.to).map((item) => item.text).join(" ");
      if (active) setVerse(text);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [devotional]);

  if (!devotional) return null;
  const reference = devotionalReference(devotional.verse, (osis) => bibleBookByOsis.get(osis)?.name);
  const bookId = bibleBookByOsis.get(devotional.verse.book)?.id;
  const background = bookId && routeBackgrounds[bookId] ? bookId : "genesis";
  const dateLabel = new Date(devotional.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  return (
    <ShareScreen
      title="Compartilhe a Palavra"
      subtitle="Leve o versículo e a mensagem de hoje para quem você ama."
      caption={devotionalShareCaption(devotional, reference, name)}
      filename={`bibliolingo-devocional-${devotional.date}`}
      cardLabel={`Cartão do devocional: ${devotional.title}, ${reference}`}
      renderCard={(width, ref) => <DevotionalCard ref={ref} width={width} title={devotional.title} verse={verse} reference={reference} keyPhrase={devotional.keyPhrase} dateLabel={dateLabel} backgroundBookId={background} />}
      onClose={() => router.back()}
      closeLabel="Voltar"
    />
  );
}
