import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bibleBooks } from "../../../src/content/bible/catalog";
import { parseBibleReference } from "../../../src/domain/bibleReference";
import { Icon, type IconName } from "../../components/navigation/Icons";
import { biblicalThemes } from "../../content/biblicalContext";
import { highlightMatches, isLexiconQuery, normalizeSearch, pushRecent, snippet } from "../../domain/bibleSearch";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { loadCachedBibleBook } from "../../services/bibleStorage";
import { loadBundledGreekLexicon, loadBundledHebrewLexicon } from "../../services/originalLanguages";
import type { Palette } from "../../theme/tokens";

interface Result { id: string; title: string; body: string; route: Href }
interface Groups { themes: Result[]; lexicon: Result[]; verses: Result[] }
const EMPTY: Groups = { themes: [], lexicon: [], verses: [] };
const RECENT_KEY = "@bibliolingo/search-recent/v1";
const LIMIT = 80;
const EXAMPLES = ["João 3:16", "graça", "pastor", "aliança", "G26", "H7965"];
const bibleRoute = (osis: string, chapter: number, verse: number): Href => ({ pathname: "/(tabs)/bible", params: { osis, chapter: String(chapter), verse: String(verse) } });

export default function GlobalSearchScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [groups, setGroups] = useState<Groups>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const searchId = useRef(0);

  useEffect(() => { void AsyncStorage.getItem(RECENT_KEY).then((raw) => { try { setRecent(raw ? JSON.parse(raw) : []); } catch { setRecent([]); } }); }, []);

  // Referência reconhecida enquanto digita (abre direto).
  const reference = useMemo(() => (query.trim() ? parseBibleReference(query.trim(), "Gen", 1) : undefined), [query]);
  // Temas aparecem na hora, sem precisar buscar.
  const liveThemes = useMemo(() => {
    const q = normalizeSearch(query.trim());
    if (q.length < 3) return [];
    return biblicalThemes.filter((theme) => normalizeSearch([theme.title, ...theme.terms].join(" ")).includes(q)).slice(0, 4);
  }, [query]);

  const search = async (raw = query) => {
    const clean = raw.trim();
    if (!clean) return;
    setQuery(clean);
    const parsed = parseBibleReference(clean, "Gen", 1);
    const nextRecent = pushRecent(recent, clean);
    setRecent(nextRecent);
    void AsyncStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));
    if (parsed) { router.push(bibleRoute(parsed.book.osis, parsed.chapter, parsed.verse)); return; }
    const id = ++searchId.current;
    setSubmitted(clean); setLoading(true); setGroups(EMPTY); setScanned(0);
    const q = normalizeSearch(clean);
    const found: Groups = { themes: [], lexicon: [], verses: [] };
    try {
      biblicalThemes.filter((theme) => normalizeSearch([theme.title, ...theme.terms].join(" ")).includes(q)).forEach((theme) => theme.references.forEach((ref) =>
        found.themes.push({ id: `theme-${theme.id}-${ref.label}`, title: `${theme.title} · ${ref.label}`, body: theme.note, route: bibleRoute(ref.osis, ref.chapter, ref.verse) })));
      if (isLexiconQuery(clean)) {
        const [hebrew, greek] = await Promise.all([loadBundledHebrewLexicon(), loadBundledGreekLexicon()]);
        hebrew.filter((item) => item.search.includes(q) || normalizeSearch(item.strong.replace(/^H/, "")) === normalizeSearch(clean.replace(/^H/i, ""))).slice(0, 20)
          .forEach((item) => found.lexicon.push({ id: "h-" + item.id, title: `${item.lemma} · ${item.strong}`, body: item.definition || item.usage, route: `/hebrew/dictionary?query=${encodeURIComponent(item.strong)}` as Href }));
        greek.filter((item) => normalizeSearch([item.lemma, item.meanings.join(" "), item.strong].join(" ")).includes(q)).slice(0, 20)
          .forEach((item) => found.lexicon.push({ id: "g-" + item.id, title: `${item.lemma} · ${item.strong}`, body: item.meanings.join("; "), route: `/greek/dictionary?query=${encodeURIComponent(item.strong)}` as Href }));
      }
      if (id !== searchId.current) return;
      setGroups({ ...found });
      // Versículos: percorre os livros aos poucos, mostrando resultados enquanto avança.
      if (!isLexiconQuery(clean)) {
        for (let b = 0; b < bibleBooks.length && found.verses.length < LIMIT; b += 1) {
          const book = bibleBooks[b];
          const data = await loadCachedBibleBook(book);
          if (id !== searchId.current) return;
          for (const chapter of data.chapters) {
            for (const verse of chapter.verses) {
              if (normalizeSearch(verse.text).includes(q)) found.verses.push({ id: `${book.osis}-${chapter.chapter}-${verse.number}`, title: `${book.name} ${chapter.chapter}:${verse.number}`, body: verse.text, route: bibleRoute(book.osis, chapter.chapter, verse.number) });
              if (found.verses.length >= LIMIT) break;
            }
            if (found.verses.length >= LIMIT) break;
          }
          setScanned(b + 1);
          if (b % 6 === 5) setGroups({ ...found, verses: [...found.verses] });
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      if (id === searchId.current) setGroups({ ...found, verses: [...found.verses] });
    } finally {
      if (id === searchId.current) setLoading(false);
    }
  };

  const total = groups.themes.length + groups.lexicon.length + groups.verses.length;
  const showStart = !submitted && !reference && !liveThemes.length;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Busca bíblica" }} />
      <View style={styles.top}>
        <View style={styles.search}>
          <Icon name="search" size={18} color={palette.textMuted} />
          <TextInput value={query} onChangeText={(text) => { setQuery(text); if (!text) { setSubmitted(""); setGroups(EMPTY); } }} onSubmitEditing={() => void search()} returnKeyType="search" autoFocus
            placeholder="João 3:16, graça, G26…" placeholderTextColor={palette.textMuted} style={styles.input} accessibilityLabel="Buscar na Bíblia" />
          {query ? <Pressable onPress={() => { setQuery(""); setSubmitted(""); setGroups(EMPTY); searchId.current++; setLoading(false); }} hitSlop={8} accessibilityLabel="Limpar"><Icon name="close" size={16} color={palette.textMuted} /></Pressable> : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        {reference ? (
          <Pressable accessibilityRole="button" onPress={() => void search()} style={styles.referenceCard}>
            <View style={styles.refIcon}><Icon name="book" size={20} color={palette.ctaText} /></View>
            <View style={styles.flex}><Text style={styles.eyebrow}>ABRIR NA BÍBLIA</Text><Text style={styles.cardTitle}>{reference.book.name} {reference.chapter}:{reference.verse}</Text></View>
            <Icon name="chevronRight" size={20} color={palette.accent} />
          </Pressable>
        ) : null}

        {!submitted && liveThemes.length ? (
          <Section title="Temas" icon="star">
            {liveThemes.map((theme) => <Text key={theme.id} style={styles.live}>{theme.title} · {theme.references.length} passagens · Enter para ver</Text>)}
          </Section>
        ) : null}

        {showStart ? (
          <>
            {recent.length ? (
              <Section title="Recentes" icon="refresh">
                <View style={styles.chips}>{recent.map((item) => <Pressable key={item} onPress={() => void search(item)} style={styles.chip}><Text style={styles.chipText}>{item}</Text></Pressable>)}</View>
              </Section>
            ) : null}
            <Section title="Experimente" icon="bulb">
              <View style={styles.chips}>{EXAMPLES.map((item) => <Pressable key={item} onPress={() => void search(item)} style={styles.chip}><Text style={styles.chipText}>{item}</Text></Pressable>)}</View>
              <Text style={styles.hint}>Referências abrem direto. Palavras buscam nos 66 livros. “G” e “H” com número procuram no léxico grego e hebraico (Strong).</Text>
            </Section>
          </>
        ) : null}

        {submitted ? (
          <View style={styles.status}>
            {loading ? <ActivityIndicator color={palette.accent} /> : <Icon name="check" size={16} color={palette.success} strokeWidth={3} />}
            <Text style={styles.statusText}>{loading ? `Procurando… ${scanned}/66 livros` : total ? `${total} resultados para “${submitted}”${groups.verses.length >= LIMIT ? " (primeiros 80 versículos)" : ""}` : `Nada encontrado para “${submitted}”.`}</Text>
          </View>
        ) : null}

        {groups.themes.length ? <Section title={`Temas · ${groups.themes.length}`} icon="star">{groups.themes.map((item) => <ResultCard key={item.id} item={item} query="" />)}</Section> : null}
        {groups.lexicon.length ? <Section title={`Léxico · ${groups.lexicon.length}`} icon="globe">{groups.lexicon.map((item) => <ResultCard key={item.id} item={item} query="" />)}</Section> : null}
        {groups.verses.length ? <Section title={`Versículos · ${groups.verses.length}`} icon="book">{groups.verses.map((item) => <ResultCard key={item.id} item={item} query={submitted} />)}</Section> : null}
      </ScrollView>
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon: IconName; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}><Icon name={icon} size={14} color={palette.textMuted} /><Text style={styles.sectionTitle}>{title}</Text></View>
      {children}
    </View>
  );
}

function ResultCard({ item, query }: { item: Result; query: string }) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const body = query ? snippet(item.body, query) : item.body;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(item.route)} style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultBody} numberOfLines={4}>
        {highlightMatches(body, query).map((part, i) => <Text key={i} style={part.match ? styles.mark : undefined}>{part.text}</Text>)}
      </Text>
    </Pressable>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: p.divider, backgroundColor: p.groundDeep },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, minHeight: 50, borderRadius: 25, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.line },
  input: { flex: 1, color: p.text, fontSize: 16, paddingVertical: 12 },
  content: { padding: 16, gap: 14 },
  referenceCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: p.activeTabBg, borderWidth: 1.5, borderColor: p.accent },
  refIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.cta },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  cardTitle: { color: p.text, fontSize: 18, fontWeight: "900" },
  live: { color: p.text, fontSize: 14, fontWeight: "700", paddingVertical: 4 },
  section: { gap: 8 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { color: p.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, minHeight: 38, justifyContent: "center", borderRadius: 19, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  chipText: { color: p.text, fontSize: 14, fontWeight: "800" },
  hint: { color: p.textMuted, fontSize: 13, lineHeight: 19 },
  status: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusText: { color: p.textMuted, fontSize: 13, fontWeight: "700", flex: 1 },
  result: { gap: 4, padding: 14, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  resultTitle: { color: p.accent, fontSize: 14, fontWeight: "900" },
  resultBody: { color: p.text, fontSize: 15, lineHeight: 22 },
  mark: { backgroundColor: p.goldSoft, color: p.xp, fontWeight: "900" }
});
