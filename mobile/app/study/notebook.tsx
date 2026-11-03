import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useFocusEffect, useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BibleHighlightColor } from "../../../src/types/progress";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon, type IconName } from "../../components/navigation/Icons";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { loadNotebook, removeNotebookItem, type NotebookItem } from "../../services/studyLibrary";
import type { Palette } from "../../theme/tokens";

const HIGHLIGHT_DOT: Record<BibleHighlightColor, string> = { yellow: "#f4c430", green: "#4caf6a", blue: "#4a8fe0", pink: "#e5739a", purple: "#9b7be0", orange: "#f0973c" };

type Filter = "all" | "notes" | "highlights" | "bookmarks" | "words" | "lessons";
const FILTERS: { id: Filter; label: string; icon: IconName }[] = [
  { id: "all", label: "Tudo", icon: "notebook" },
  { id: "notes", label: "Notas", icon: "edit" },
  { id: "highlights", label: "Destaques", icon: "star" },
  { id: "bookmarks", label: "Marcados", icon: "bookmark" },
  { id: "words", label: "Palavras", icon: "globe" },
  { id: "lessons", label: "Lições", icon: "study" }
];

interface Entry {
  id: string;
  kind: "verse" | "original-word" | "lesson";
  title: string;
  body: string;
  meta?: string;
  updatedAt: string;
  highlight?: BibleHighlightColor;
  bookmarked?: boolean;
  hasNote?: boolean;
  route?: Href;
  removable?: boolean;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function NotebookScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const reload = useCallback(() => { void loadNotebook().then(setItems); }, []);
  useFocusEffect(reload);

  const entries = useMemo<Entry[]>(() => {
    const annotations: Entry[] = Object.values(progress.bibleAnnotations)
      .filter((item) => item.bookmarked || item.note.trim() || item.highlightColor)
      .map((item) => ({
        id: item.id, kind: "verse", title: `${item.bookName} ${item.chapter}:${item.verse}`, body: item.note.trim() || (item.highlightColor ? "Versículo destacado" : "Versículo marcado"),
        updatedAt: item.updatedAt, highlight: item.highlightColor, bookmarked: item.bookmarked, hasNote: Boolean(item.note.trim()),
        route: { pathname: "/(tabs)/bible", params: { osis: item.bookOsis, chapter: String(item.chapter), verse: String(item.verse) } }
      }));
    const saved: Entry[] = items.map((item) => ({
      id: item.id, kind: item.kind, title: item.title, body: item.body, meta: item.reference, updatedAt: item.updatedAt, route: item.route as Href | undefined, removable: true, hasNote: item.kind === "verse"
    }));
    return [...annotations, ...saved].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [progress.bibleAnnotations, items]);

  const counts = useMemo(() => ({
    all: entries.length,
    notes: entries.filter((e) => e.hasNote).length,
    highlights: entries.filter((e) => e.highlight).length,
    bookmarks: entries.filter((e) => e.bookmarked).length,
    words: entries.filter((e) => e.kind === "original-word").length,
    lessons: entries.filter((e) => e.kind === "lesson").length
  }), [entries]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return entries.filter((e) => {
      const byFilter = filter === "all" || (filter === "notes" && e.hasNote) || (filter === "highlights" && e.highlight) || (filter === "bookmarks" && e.bookmarked)
        || (filter === "words" && e.kind === "original-word") || (filter === "lessons" && e.kind === "lesson");
      return byFilter && (!q || normalize(`${e.title} ${e.body} ${e.meta ?? ""}`).includes(q));
    });
  }, [entries, filter, query]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Meu caderno" }} />
      <View style={styles.top}>
        <View style={styles.search}>
          <Icon name="search" size={18} color={palette.textMuted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar nas suas notas" placeholderTextColor={palette.textMuted} style={styles.searchInput} accessibilityLabel="Buscar no caderno" />
          {query ? <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Limpar busca"><Icon name="close" size={16} color={palette.textMuted} /></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.filter((item) => item.id === "all" || counts[item.id] > 0).map((item) => (
            <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: filter === item.id }} onPress={() => setFilter(item.id)} style={[styles.filter, filter === item.id && styles.filterActive]}>
              <Icon name={item.icon} size={14} color={filter === item.id ? palette.accent : palette.textMuted} />
              <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label} · {counts[item.id]}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {!entries.length ? (
          <View style={styles.empty}>
            <LumiCharacter mood="listening" motion="calm" style={styles.emptyLumi} accessibilityLabel="Lumi" />
            <Text style={styles.emptyTitle}>Seu caderno está esperando</Text>
            <Text style={styles.muted}>Na aba Bíblia, toque num versículo para destacar, marcar ou anotar. Nos léxicos, salve palavras do grego e do hebraico. Tudo aparece aqui.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/bible")} style={styles.primary}><Icon name="book" size={16} color={palette.ctaText} /><Text style={styles.primaryText}>Abrir a Bíblia</Text></Pressable>
          </View>
        ) : !visible.length ? (
          <Text style={styles.noResults}>Nada encontrado com esse filtro.</Text>
        ) : visible.map((entry) => (
          <Pressable key={entry.id} accessibilityRole="button" disabled={!entry.route} onPress={() => entry.route && router.push(entry.route)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={[styles.stripe, { backgroundColor: entry.highlight ? HIGHLIGHT_DOT[entry.highlight] : entry.kind === "original-word" ? "#8fb8ff" : entry.kind === "lesson" ? "#c9a7ff" : palette.accent }]} />
            <View style={styles.flex}>
              <View style={styles.cardTop}>
                <Text style={styles.kind}>{entry.kind === "original-word" ? "PALAVRA ORIGINAL" : entry.kind === "lesson" ? "LIÇÃO" : "BÍBLIA"}</Text>
                {entry.bookmarked ? <Icon name="bookmark" size={14} color={palette.xp} /> : null}
                <Text style={styles.date}>{relativeDate(entry.updatedAt)}</Text>
              </View>
              <Text style={styles.cardTitle}>{entry.title}</Text>
              {entry.meta ? <Text style={styles.meta}>{entry.meta}</Text> : null}
              <Text style={styles.body} numberOfLines={4}>{entry.body}</Text>
            </View>
            {entry.removable ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${entry.title}`} onPress={() => void removeNotebookItem(entry.id).then(reload)} hitSlop={8} style={styles.remove}>
                <Icon name="close" size={16} color={palette.textMuted} />
              </Pressable>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  top: { gap: 10, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: p.divider, backgroundColor: p.groundDeep },
  search: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, paddingHorizontal: 14, minHeight: 46, borderRadius: 23, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  searchInput: { flex: 1, color: p.text, fontSize: 15, paddingVertical: 10 },
  filters: { gap: 8, paddingHorizontal: 16 },
  filter: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, minHeight: 34, borderRadius: 17, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  filterActive: { borderColor: p.accent, backgroundColor: p.activeTabBg },
  filterText: { color: p.textMuted, fontSize: 13, fontWeight: "800" },
  filterTextActive: { color: p.accent },
  content: { padding: 16, gap: 10 },
  card: { flexDirection: "row", gap: 12, padding: 14, paddingLeft: 0, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  stripe: { width: 5, alignSelf: "stretch", borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  kind: { color: p.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  date: { marginLeft: "auto", color: p.textMuted, fontSize: 11, fontWeight: "700" },
  cardTitle: { color: p.text, fontSize: 16, fontWeight: "900", marginTop: 2 },
  meta: { color: p.xp, fontSize: 12, fontWeight: "800" },
  body: { color: p.textMuted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  remove: { padding: 4 },
  noResults: { color: p.textMuted, textAlign: "center", padding: 24 },
  empty: { alignItems: "center", gap: 10, padding: 24, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  emptyLumi: { width: 120, height: 112 },
  emptyTitle: { color: p.text, fontSize: 20, fontWeight: "900", textAlign: "center" },
  muted: { color: p.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  primary: { flexDirection: "row", gap: 8, minHeight: 50, paddingHorizontal: 20, marginTop: 6, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 15, fontWeight: "900" }
});
