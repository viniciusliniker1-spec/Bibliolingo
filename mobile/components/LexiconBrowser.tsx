import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANGUAGE_TRAILS, type LanguageTrailColors, type LanguageTrailId } from "../domain/languageTrailThemes";
import type { NoahContext } from "../domain/noah";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { usePalette } from "../providers/ThemeProvider";
import { speak } from "../services/speech";
import { addWordCard, loadWordCards, saveNotebookItem, type WordLanguage } from "../services/studyLibrary";
import { Icon, type IconName } from "./navigation/Icons";
import { ProfessorNoahModal } from "./ProfessorNoahModal";

export interface LexiconEntry {
  id: string;
  lemma: string;
  strong: string;
  transliteration: string;
  pronunciation?: string;
  partOfSpeech?: string;
  language: WordLanguage;
  /** Sentido curto (usado no flashcard). */
  gloss: string;
  sections: { title: string; text: string }[];
  route: string;
}

interface Props {
  language: LanguageTrailId;
  title: string;
  placeholder: string;
  entries?: LexiconEntry[];
  error?: string;
  initialQuery?: string;
  filter: (query: string) => LexiconEntry[];
  sources?: string;
  learnedIds?: Set<string>;
  onMarkLearned?: (id: string) => void;
  noahContext: (entry: LexiconEntry) => NoahContext;
}

/** Léxico temático (grego ou hebraico): buscar, ouvir, salvar no caderno e praticar em Memorizar. */
export function LexiconBrowser({ language, title, placeholder, entries, error, initialQuery, filter, sources, learnedIds, onMarkLearned, noahContext }: Props) {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const theme = LANGUAGE_TRAILS[language];
  const c = palette.isDark ? theme.dark : theme.light;
  const styles = useMemo(() => makeStyles(c), [c]);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [selected, setSelected] = useState<LexiconEntry>();
  const [noah, setNoah] = useState(false);
  const [practicing, setPracticing] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const hebrew = language === "hebrew";

  useEffect(() => { void loadWordCards().then((list) => setPracticing(new Set(list.map((item) => item.id)))); }, []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 2400); return () => clearTimeout(t); }, [notice]);

  const results = useMemo(() => (entries ? filter(query) : []), [entries, filter, query]);
  const wordId = (entry: LexiconEntry) => `word:${entry.language}:${entry.strong}`;

  const listen = async (entry: LexiconEntry) => {
    const result = await speak(entry.lemma, entry.language, entry.transliteration);
    if (result.usedFallback) setNotice(`Sem voz em ${hebrew ? "hebraico" : "grego"} no aparelho: lendo a transliteração.`);
  };
  const practice = async (entry: LexiconEntry) => {
    await addWordCard({ id: wordId(entry), language: entry.language, lemma: entry.lemma, transliteration: entry.transliteration, meaning: entry.gloss, strong: entry.strong });
    setPracticing(new Set([...practicing, wordId(entry)]));
    setNotice("Adicionada em Memorizar › Palavras originais");
  };
  const save = async (entry: LexiconEntry) => {
    await saveNotebookItem({ id: wordId(entry), kind: "original-word", title: entry.lemma, body: [entry.transliteration, entry.gloss].filter(Boolean).join(" · "), reference: entry.strong, route: entry.route });
    setNotice("Salva no Meu caderno");
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title, headerStyle: { backgroundColor: c.groundDeep }, headerTintColor: c.text, headerTitleStyle: { color: c.text, fontWeight: "900" } }} />
      <View style={styles.top}>
        <Text style={[styles.watermark, hebrew && styles.watermarkLeft]} accessibilityElementsHidden>{theme.watermark}</Text>
        <View style={styles.search}>
          <Icon name="search" size={18} color={c.muted} />
          <TextInput value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} placeholder={placeholder} placeholderTextColor={c.muted} style={styles.input} accessibilityLabel="Buscar no léxico" />
          {query ? <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Limpar"><Icon name="close" size={16} color={c.muted} /></Pressable> : null}
        </View>
        <Text style={styles.count}>{entries ? `${entries.length.toLocaleString("pt-BR")} verbetes · ${results.length} mostrados` : "Carregando…"}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : !entries ? <ActivityIndicator color={c.accent} size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          initialNumToRender={16}
          windowSize={7}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum verbete encontrado.</Text>}
          ListFooterComponent={sources ? <Text style={styles.sources}>{sources}</Text> : null}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => setSelected(item)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
              <View style={[styles.cardTop, hebrew && { flexDirection: "row-reverse" }]}>
                <Text style={[styles.lemma, hebrew && styles.rtl]}>{item.lemma}</Text>
                <View style={styles.flex} />
                <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir ${item.lemma}`} onPress={() => void listen(item)} hitSlop={6} style={styles.listen}><Icon name="volume" size={16} color={c.accent} /></Pressable>
              </View>
              <Text style={styles.meta}>{item.transliteration}{item.partOfSpeech ? ` · ${item.partOfSpeech}` : ""} · {item.strong}</Text>
              <Text style={styles.gloss} numberOfLines={2}>{item.gloss || "Definição não disponível nesta entrada."}</Text>
              <View style={styles.tags}>
                {learnedIds?.has(item.id) ? <Text style={styles.tag}>✓ aprendida</Text> : null}
                {practicing.has(wordId(item)) ? <Text style={styles.tag}>em Memorizar</Text> : null}
              </View>
            </Pressable>
          )}
        />
      )}

      {notice ? <View style={[styles.toast, { bottom: insets.bottom + 24 }]} pointerEvents="none"><Text style={styles.toastText}>{notice}</Text></View> : null}

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(undefined)}>
        <View style={styles.backdrop}>
          <Pressable style={styles.flex} onPress={() => setSelected(undefined)} accessibilityLabel="Fechar" />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
            <View style={styles.handle} />
            {selected ? (
              <ScrollView contentContainerStyle={styles.sheetContent}>
                <View style={[styles.cardTop, hebrew && { flexDirection: "row-reverse" }]}>
                  <Text style={[styles.bigLemma, hebrew && styles.rtl]}>{selected.lemma}</Text>
                  <View style={styles.flex} />
                  <Pressable accessibilityRole="button" accessibilityLabel="Ouvir" onPress={() => void listen(selected)} style={styles.listenBig}><Icon name="volume" size={22} color={c.ctaText} /></Pressable>
                </View>
                <Text style={styles.meta}>{selected.transliteration}{selected.pronunciation ? ` · ${selected.pronunciation}` : ""} · {selected.strong}</Text>
                <Text style={styles.glossBig}>{selected.gloss}</Text>
                <View style={styles.actions}>
                  <Action icon="memory" label={practicing.has(wordId(selected)) ? "Em Memorizar" : "Praticar"} c={c} onPress={() => void practice(selected)} primary />
                  <Action icon="notebook" label="Salvar" c={c} onPress={() => void save(selected)} />
                  <Action icon="send" label="Noah" c={c} onPress={() => setNoah(true)} />
                </View>
                {onMarkLearned ? (
                  <Pressable accessibilityRole="button" onPress={() => { onMarkLearned(selected.id); setNotice("Marcada como aprendida"); }} style={styles.learnBtn}>
                    <Icon name="check" size={16} color={c.accent} strokeWidth={3} /><Text style={styles.learnText}>{learnedIds?.has(selected.id) ? "Já aprendida" : "Marcar como aprendida"}</Text>
                  </Pressable>
                ) : null}
                {selected.sections.filter((section) => section.text).map((section) => (
                  <View key={section.title} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionText}>{section.text}</Text>
                  </View>
                ))}
                <Pressable accessibilityRole="button" onPress={() => router.push("/study/memory")} style={styles.linkRow}><Text style={styles.link}>Abrir Memorizar › Palavras originais</Text></Pressable>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
      {selected ? <ProfessorNoahModal visible={noah} onClose={() => setNoah(false)} contextKey={`lexicon:${selected.id}`} context={noahContext(selected)} /> : null}
    </View>
  );
}

function Action({ icon, label, c, onPress, primary }: { icon: IconName; label: string; c: LanguageTrailColors; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [{ flex: 1, alignItems: "center", gap: 4, paddingVertical: 12, borderRadius: 16, borderWidth: 2, borderColor: primary ? c.cta : c.line, backgroundColor: primary ? c.cta : c.card }, pressed && { opacity: 0.85 }]}>
      <Icon name={icon} size={20} color={primary ? c.ctaText : c.accent} />
      <Text style={{ color: primary ? c.ctaText : c.text, fontSize: 13, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (c: LanguageTrailColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.ground },
  flex: { flex: 1 },
  top: { gap: 6, padding: 16, paddingBottom: 10, backgroundColor: c.groundDeep, borderBottomWidth: 1, borderBottomColor: c.line, overflow: "hidden" },
  watermark: { position: "absolute", right: 12, top: -26, fontSize: 110, fontWeight: "900", color: c.ornament, opacity: 0.1 },
  watermarkLeft: { right: undefined, left: 12 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, minHeight: 50, borderRadius: 25, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.line },
  input: { flex: 1, color: c.text, fontSize: 16, paddingVertical: 12 },
  count: { color: c.muted, fontSize: 12, fontWeight: "700", paddingHorizontal: 6 },
  list: { padding: 16, gap: 10 },
  card: { gap: 4, padding: 14, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  lemma: { color: c.text, fontSize: 26, fontWeight: "800" },
  rtl: { writingDirection: "rtl", textAlign: "right" },
  listen: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: c.line },
  meta: { color: c.muted, fontSize: 13, fontWeight: "700" },
  gloss: { color: c.text, fontSize: 15, lineHeight: 21 },
  tags: { flexDirection: "row", gap: 6 },
  tag: { color: c.accent, fontSize: 11, fontWeight: "900" },
  empty: { color: c.muted, textAlign: "center", padding: 30 },
  error: { color: "#e5739a", fontWeight: "800", padding: 20 },
  sources: { color: c.muted, fontSize: 11, lineHeight: 16, marginTop: 8 },
  toast: { position: "absolute", left: 24, right: 24, padding: 12, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  toastText: { color: c.text, fontSize: 14, fontWeight: "800", textAlign: "center" },
  backdrop: { flex: 1, backgroundColor: "rgba(4,10,20,0.6)" },
  sheet: { maxHeight: "86%", borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: c.ground, borderTopWidth: 1, borderColor: c.line },
  handle: { alignSelf: "center", width: 46, height: 5, borderRadius: 3, backgroundColor: c.line, marginTop: 10 },
  sheetContent: { padding: 20, gap: 10 },
  bigLemma: { color: c.text, fontSize: 44, fontWeight: "800" },
  listenBig: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: c.cta },
  glossBig: { color: c.text, fontSize: 18, lineHeight: 26, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, marginTop: 6 },
  learnBtn: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 44, borderRadius: 14, borderWidth: 1.5, borderColor: c.line },
  learnText: { color: c.text, fontSize: 14, fontWeight: "900" },
  section: { gap: 4, padding: 14, borderRadius: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  sectionTitle: { color: c.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  sectionText: { color: c.text, fontSize: 15, lineHeight: 22 },
  linkRow: { alignItems: "center", paddingVertical: 8 },
  link: { color: c.accent, fontSize: 14, fontWeight: "900" }
});
