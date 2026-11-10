import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { LexiconBrowser, type LexiconEntry } from "../../components/LexiconBrowser";
import { loadBundledHebrewLexicon, type HebrewLexiconEntry } from "../../services/originalLanguages";

function toEntry(item: HebrewLexiconEntry): LexiconEntry & { search: string } {
  return {
    id: item.id, lemma: item.lemma, strong: item.strong, transliteration: item.transliteration || "", pronunciation: item.pronunciation,
    partOfSpeech: item.language === "arc" ? "aramaico" : "hebraico", language: item.language,
    gloss: (item.definition || item.usage || "").split(/[;.]/)[0].trim(), route: `/hebrew/dictionary?query=${encodeURIComponent(item.strong)}`,
    sections: [{ title: "Definição", text: item.definition }, { title: "Uso", text: item.usage }],
    search: item.search
  };
}

export default function HebrewDictionary() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [entries, setEntries] = useState<ReturnType<typeof toEntry>[]>();
  const [error, setError] = useState("");
  useEffect(() => { void loadBundledHebrewLexicon().then((list) => setEntries(list.map(toEntry))).catch((cause) => setError(cause instanceof Error ? cause.message : "Léxico indisponível.")); }, []);
  const filter = useCallback((query: string) => {
    if (!entries) return [];
    const q = query.trim().toLocaleLowerCase("pt-BR");
    if (!q) return entries.slice(0, 80);
    return entries.filter((item) => item.search.includes(q) || item.strong.toLowerCase() === q || item.strong.toLowerCase() === "h" + q.replace(/^h/, "")).slice(0, 150);
  }, [entries]);
  return (
    <LexiconBrowser
      language="hebrew" title="Léxico hebraico" placeholder="שָׁלוֹם, shalom, paz ou H7965" entries={entries} error={error} initialQuery={params.query}
      filter={filter} sources="Fonte: Open Scriptures Hebrew Lexicon (Strong), CC BY 4.0. Funciona sem internet."
      noahContext={(entry) => ({ area: "lexicon", title: `Léxico hebraico · ${entry.lemma}`, content: `${entry.lemma} (${entry.transliteration}) — ${entry.gloss}`, lexicalData: { lemma: entry.lemma, strong: entry.strong, transliteration: entry.transliteration, meaning: entry.gloss } })}
    />
  );
}
