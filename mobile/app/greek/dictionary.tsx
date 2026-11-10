import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { filterGreekLexicon } from "../../../src/content/greek/search";
import { greekLexiconSources, type GreekLexeme } from "../../../src/content/greek/lexiconData";
import { LexiconBrowser, type LexiconEntry } from "../../components/LexiconBrowser";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { loadCachedGreekLexicon } from "../../services/greekLexiconStorage";

function toEntry(item: GreekLexeme): LexiconEntry {
  return {
    id: item.id, lemma: item.lemma, strong: item.strong, transliteration: item.transliteration, pronunciation: item.pronunciation, partOfSpeech: item.partOfSpeech,
    language: "grc", gloss: item.meanings.slice(0, 2).join("; "), route: `/greek/dictionary?query=${encodeURIComponent(item.strong)}`,
    sections: [
      { title: "Sentidos", text: item.meanings.join("; ") },
      { title: "Morfologia", text: item.morphology },
      { title: "Formas", text: item.forms.join(" · ") },
      { title: "Exemplos", text: item.examples.map((example) => `${example.reference} — ${example.form}${example.note ? `: ${example.note}` : ""}`).join("\n") }
    ]
  };
}

export default function GreekDictionaryScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const { progress, markGreekLexeme } = useMobileProgress();
  const [raw, setRaw] = useState<GreekLexeme[]>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void loadCachedGreekLexicon().then((value) => { if (active) setRaw(value); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Léxico indisponível."); });
    return () => { active = false; };
  }, []);
  const entries = useMemo(() => raw?.map(toEntry), [raw]);
  const byId = useMemo(() => new Map(entries?.map((entry) => [entry.id, entry])), [entries]);
  const filter = useCallback((query: string) => (raw ? filterGreekLexicon(raw, query, 80).map((item) => byId.get(item.id)!).filter(Boolean) : []), [raw, byId]);
  const learned = useMemo(() => new Set(progress.learnedGreekLexemeIds ?? []), [progress.learnedGreekLexemeIds]);
  return (
    <LexiconBrowser
      language="greek" title="Léxico grego" placeholder="ἀγάπη, agapē, amor ou G26" entries={entries} error={error} initialQuery={params.query}
      filter={filter} learnedIds={learned} onMarkLearned={markGreekLexeme}
      sources={`Fontes: ${greekLexiconSources.map((source) => `${source.title} (${source.license})`).join(" · ")}`}
      noahContext={(entry) => ({ area: "lexicon", title: `Léxico grego · ${entry.lemma}`, content: `${entry.lemma} (${entry.transliteration}) — ${entry.gloss}`, lexicalData: { lemma: entry.lemma, strong: entry.strong, transliteration: entry.transliteration, meanings: entry.gloss } })}
    />
  );
}
