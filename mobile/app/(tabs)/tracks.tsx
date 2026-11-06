import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { getBookForActivity, journeyBooks, orderedActivityIds } from "../../../src/content/catalog";
import { nextJourneyActivityId } from "../../../src/domain/unlocks";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { Icon } from "../../components/navigation/Icons";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import type { Palette } from "../../theme/tokens";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";

/** Seções do cânon, pela posição do livro na ordem protestante. */
const SECTIONS: { title: string; from: number; to: number }[] = [
  { title: "Pentateuco", from: 0, to: 4 },
  { title: "Livros históricos", from: 5, to: 16 },
  { title: "Livros poéticos", from: 17, to: 21 },
  { title: "Profetas maiores", from: 22, to: 26 },
  { title: "Profetas menores", from: 27, to: 38 },
  { title: "Evangelhos", from: 39, to: 42 },
  { title: "Atos", from: 43, to: 43 },
  { title: "Cartas de Paulo", from: 44, to: 56 },
  { title: "Cartas gerais", from: 57, to: 64 },
  { title: "Apocalipse", from: 65, to: 65 }
];

interface BookRow { id: string; title: string; shortTitle: string; order: number; done: number; total: number; current: boolean }

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function TracksScreen() {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const { progress } = useMobileProgress();
  const [query, setQuery] = useState("");
  const [testament, setTestament] = useState<"old" | "new">("old");

  const rows = useMemo(() => {
    const completed = new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]);
    const currentId = getBookForActivity(nextJourneyActivityId(orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds))?.id;
    return journeyBooks.map<BookRow>((book, index) => {
      const ids = book.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
      return { id: book.id, title: book.title, shortTitle: book.shortTitle, order: index, done: ids.filter((id) => completed.has(id)).length, total: ids.length, current: book.id === currentId };
    });
  }, [progress.completedLessonIds, progress.completedCheckpointIds]);

  const current = rows.find((row) => row.current);
  const needle = normalize(query.trim());
  const sections = SECTIONS
    .filter((section) => needle || (testament === "old" ? section.from < 39 : section.from >= 39))
    .map((section) => ({ title: section.title, data: rows.slice(section.from, section.to + 1).filter((row) => !needle || normalize(row.title).includes(needle)) }))
    .filter((section) => section.data.length > 0);
  const open = (id: string) => router.push({ pathname: "/book/[bookId]", params: { bookId: id } });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Livros</Text>
      <Text style={styles.subtitle}>Estude qualquer livro. Sua posição na jornada continua guardada.</Text>

      {current ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Continuar em ${current.title}`} onPress={() => open(current.id)} style={styles.currentCard}>
          <ProgressRing done={current.done} total={current.total} label={current.shortTitle} size={54} />
          <View style={styles.flex}>
            <Text style={styles.currentEyebrow}>VOCÊ ESTÁ AQUI</Text>
            <Text style={styles.currentTitle}>{current.title}</Text>
            <Text style={styles.currentMeta}>{current.done} de {current.total} etapas</Text>
          </View>
          <Icon name="chevronRight" size={22} color={trail.accent} />
        </Pressable>
      ) : null}

      <View style={styles.search}>
        <Icon name="search" size={18} color={trail.textMuted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar livro" placeholderTextColor={trail.textMuted} style={styles.searchInput} accessibilityLabel="Buscar livro" />
      </View>
      {!needle ? (
        <View style={styles.segment}>
          {(["old", "new"] as const).map((value) => (
            <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: testament === value }} onPress={() => setTestament(value)} style={[styles.segmentButton, testament === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, testament === value && styles.segmentTextActive]}>{value === "old" ? "Antigo Testamento" : "Novo Testamento"}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => {
          const complete = item.done === item.total;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${complete ? "concluído" : `${item.done} de ${item.total} etapas`}${item.current ? ", livro atual" : ""}`}
              onPress={() => open(item.id)}
              style={({ pressed }) => [styles.row, item.current && styles.rowCurrent, pressed && styles.pressed]}
            >
              <ProgressRing done={item.done} total={item.total} label={item.shortTitle} size={44} />
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMeta}>{complete ? "Concluído" : item.done ? `${item.done} de ${item.total} etapas` : `${item.total} etapas`}</Text>
              </View>
              {complete ? <Icon name="check" size={20} color={trail.xp} strokeWidth={3} /> : item.current ? <Text style={styles.hereTag}>ATUAL</Text> : <Icon name="chevronRight" size={20} color={trail.textMuted} />}
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum livro encontrado.</Text>}
      />
    </View>
  );
}

function ProgressRing({ done, total, label, size }: { done: number; total: number; label: string; size: number }) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total ? done / total : 0;
  const complete = ratio >= 1;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trail.line} strokeWidth={stroke} fill={complete ? trail.goldSoft : trail.card} />
        {ratio > 0 ? <Circle cx={size / 2} cy={size / 2} r={radius} stroke={complete ? trail.xp : trail.accent} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference * ratio} ${circumference}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} /> : null}
      </Svg>
      <Text style={[styles.ringLabel, { fontSize: size > 50 ? 14 : 12 }, complete && { color: trail.xp }]}>{label}</Text>
    </View>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: trail.ground, paddingHorizontal: 16 },
  flex: { flex: 1 },
  title: { color: trail.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: trail.textMuted, fontSize: 14, lineHeight: 20, marginTop: 2, marginBottom: 12 },
  currentCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 20, backgroundColor: trail.activeTabBg, borderWidth: 1, borderColor: trail.accent, marginBottom: 12 },
  currentEyebrow: { color: trail.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  currentTitle: { color: trail.text, fontSize: 19, fontWeight: "900" },
  currentMeta: { color: trail.textMuted, fontSize: 13, fontWeight: "700" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 46, paddingHorizontal: 12, borderRadius: 14, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  searchInput: { flex: 1, color: trail.text, fontSize: 16 },
  segment: { flexDirection: "row", padding: 4, marginTop: 10, borderRadius: 14, backgroundColor: trail.card },
  segmentButton: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  segmentActive: { backgroundColor: trail.activeTabBg },
  segmentText: { color: trail.textMuted, fontSize: 13, fontWeight: "800" },
  segmentTextActive: { color: trail.accent },
  list: { paddingBottom: 32, paddingTop: 4 },
  sectionTitle: { color: trail.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 18, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 62, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: trail.card, marginBottom: 8 },
  rowCurrent: { borderWidth: 1, borderColor: trail.accent },
  pressed: { opacity: 0.8 },
  rowTitle: { color: trail.text, fontSize: 16, fontWeight: "800" },
  rowMeta: { color: trail.textMuted, fontSize: 12, fontWeight: "700", marginTop: 2 },
  hereTag: { color: trail.ctaText, backgroundColor: trail.accent, fontSize: 10, fontWeight: "900", letterSpacing: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  ringLabel: { color: trail.text, fontWeight: "900" },
  empty: { color: trail.textMuted, textAlign: "center", marginTop: 32 }
});
