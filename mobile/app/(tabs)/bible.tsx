import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bibleBooks, bibleBookByOsis, type BibleBookMeta } from "../../../src/content/bible/catalog";
import { bibleAnnotationId, parseBibleReference } from "../../../src/domain/bibleReference";
import { crossReferencesForChapter } from "../../../src/content/bible/crossReferences";
import { explainMorphology, originalLanguageLabel, transliterateOriginal } from "../../../src/domain/originalLanguage";
import { BIBLE_TRANSLATION, BIBLE_TRANSLATIONS, bibleTranslationById, type BibleBookData, type BibleVerse } from "../../../src/services/bible";
import type { BibleAnnotation, BibleHighlightColor } from "../../../src/types/progress";
import { OriginalChapterPanel } from "../../components/OriginalChapterPanel";
import { BibleStudyNotebook } from "../../components/BibleStudyNotebook";
import { Icon, type IconName } from "../../components/navigation/Icons";
import { loadCachedBibleBook, loadPreferredBibleTranslation, savePreferredBibleTranslation } from "../../services/bibleStorage";
import { addVerseMemoryCard, saveNotebookItem } from "../../services/studyLibrary";
import { hasBundledOriginalBook, loadBundledOriginalChapter, loadBundledOriginalVerse, loadOriginalWordInsights, type OriginalWord, type OriginalWordInsight } from "../../services/originalLanguages";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette } from "../../providers/ThemeProvider";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";

type ReaderMode = "portuguese" | "original" | "interlinear";

const HIGHLIGHTS: { id: BibleHighlightColor; label: string; color: string; dot: string }[] = [
  { id: "yellow", label: "Amarelo", color: "#fff0a8", dot: "#f4c430" },
  { id: "green", label: "Verde", color: "#d9f2df", dot: "#4caf6a" },
  { id: "blue", label: "Azul", color: "#dcecff", dot: "#4a8fe0" },
  { id: "pink", label: "Rosa", color: "#ffe0ea", dot: "#e5739a" },
  { id: "purple", label: "Roxo", color: "#eadfff", dot: "#9b7be0" },
  { id: "orange", label: "Laranja", color: "#ffe2bd", dot: "#f0973c" }
];
const HIGHLIGHT_BG = Object.fromEntries(HIGHLIGHTS.map((item) => [item.id, item.color])) as Record<BibleHighlightColor, string>;
// No tema escuro, destaques translúcidos mantêm o texto claro legível.
const HIGHLIGHT_BG_DARK = Object.fromEntries(HIGHLIGHTS.map((item) => [item.id, item.dot + "47"])) as Record<BibleHighlightColor, string>;

const BIBLE_LIGHT = {
  paper: "#fbf8f1", ink: "#1d2a38", muted: "#5d6b7a", line: "#e6dfd0", teal: "#0b7f75", tealSoft: "#dcefeb",
  chip: "#f1ece1", navy: "#10243e", gold: "#a8740f", surface: "#ffffff", surfaceAlt: "#f3f6f8", noteBg: "#fffdf8", target: "#fff6d3"
};
type BiblePalette = typeof BIBLE_LIGHT;
const BIBLE_DARK: BiblePalette = {
  paper: "#111c29", ink: "#e7edf3", muted: "#9fb0c2", line: "#263a50", teal: "#7fe3d5", tealSoft: "#173a40",
  chip: "#1b2a3b", navy: "#f4f8fb", gold: "#f2b84b", surface: "#16304d", surfaceAlt: "#1c3653", noteBg: "#13243a", target: "#3a3416"
};
function useBiblePalette() {
  return usePalette().isDark ? BIBLE_DARK : BIBLE_LIGHT;
}
const SERIF = Platform.select({ android: "serif", ios: "Georgia", default: undefined });
// Destaques e notas pertencem ao versículo, não à tradução: valem em todas as versões.
const ANNOTATION_SCOPE = BIBLE_TRANSLATION.id;

export default function BibleScreen() {
  const C = useBiblePalette();
  const styles = useMemo(() => makeStyles(C), [C]);
  useLightStatusBar();
  const params = useLocalSearchParams<{ osis?: string; chapter?: string; verse?: string; returnActivityId?: string; returnKind?: string; returnJourneyMode?: string; returnJourneyBookId?: string; readerMode?: ReaderMode }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, hydrated, setBibleLocation, saveBibleAnnotation, saveBibleStudyNote, removeBibleStudyNote } = useMobileProgress();
  const initialBook = bibleBookByOsis.get(params.osis ?? "") ?? bibleBooks.find((item) => item.id === params.osis) ?? bibleBooks[0];
  const [osis, setOsis] = useState(initialBook.osis);
  const [chapter, setChapter] = useState(Math.max(1, Number(params.chapter ?? 1)));
  const [targetVerse, setTargetVerse] = useState<number | undefined>(params.verse ? Number(params.verse) : undefined);
  const [translationId, setTranslationId] = useState<string>(BIBLE_TRANSLATION.id);
  const [bookData, setBookData] = useState<BibleBookData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<"none" | "books" | "versions" | "display" | "search">("none");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BibleVerse>();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [selectedOriginal, setSelectedOriginal] = useState<OriginalWord[]>([]);
  const [originalInsights, setOriginalInsights] = useState<OriginalWordInsight[]>([]);
  const [originalLoading, setOriginalLoading] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [readerMode, setReaderMode] = useState<ReaderMode>(params.readerMode === "original" || params.readerMode === "interlinear" ? params.readerMode : "portuguese");
  const scrollRef = useRef<ScrollView>(null);
  const annotations = progress.bibleAnnotations;
  const book = bibleBookByOsis.get(osis) ?? bibleBooks[0];
  const translation = bibleTranslationById(translationId);

  useEffect(() => { void loadPreferredBibleTranslation().then((id) => { if (id) setTranslationId(bibleTranslationById(id).id); }); }, []);
  useEffect(() => {
    if (!hydrated) return;
    const location = progress.bibleLocation;
    if (!params.osis && location) { setOsis(location.bookOsis); setChapter(location.chapter); setTargetVerse(location.verse); }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLoading(true); setError(""); setBookData(undefined);
    void loadCachedBibleBook(book, translationId).then(setBookData)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível abrir esta tradução."))
      .finally(() => setLoading(false));
    if (hasBundledOriginalBook(book.osis)) void loadBundledOriginalChapter(book.osis, chapter).catch(() => undefined);
    setBibleLocation({ translationId: BIBLE_TRANSLATION.id, bookOsis: book.osis, chapter, verse: targetVerse });
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [book.osis, chapter, targetVerse, translationId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 2600); return () => clearTimeout(timer); }, [notice]);

  const chapterData = bookData?.chapters.find((item) => item.chapter === chapter);
  const annotationFor = (verse: number) => annotations[bibleAnnotationId(ANNOTATION_SCOPE, book.osis, chapter, verse)];
  const selectedAnnotation = selected ? annotationFor(selected.number) : undefined;
  const reference = selected ? `${book.name} ${chapter}:${selected.number}` : "";
  const verseText = selected ? `“${selected.text}” — ${reference} (${translation.shortName})` : "";
  const crossReferences = crossReferencesForChapter(book.osis, chapter);
  const originalSource = book.testament === "old" ? "Open Scriptures Hebrew Bible · WLC + OSHB" : "Textus Receptus de Robinson";

  const saveAnnotation = (changes: Partial<Pick<BibleAnnotation, "note" | "bookmarked" | "highlightColor">>) => {
    if (!selected) return;
    const current = selectedAnnotation;
    saveBibleAnnotation({
      id: bibleAnnotationId(ANNOTATION_SCOPE, book.osis, chapter, selected.number),
      translationId: ANNOTATION_SCOPE, bookOsis: book.osis, bookName: book.name, chapter, verse: selected.number,
      note: changes.note ?? current?.note ?? "",
      bookmarked: changes.bookmarked ?? current?.bookmarked ?? false,
      highlightColor: "highlightColor" in changes ? changes.highlightColor : current?.highlightColor,
      updatedAt: new Date().toISOString()
    } as BibleAnnotation);
  };
  const openVerse = (verse: BibleVerse, words: OriginalWord[] = []) => {
    setSelected(verse); setNote(annotationFor(verse.number)?.note ?? ""); setNoteOpen(false);
    setSelectedOriginal(words); setOriginalInsights([]);
    if (words.length) void loadOriginalWordInsights(words).then(setOriginalInsights).catch(() => undefined);
  };
  const closeVerse = () => { setSelected(undefined); setNoteOpen(false); setSelectedOriginal([]); };
  const go = (nextOsis: string, nextChapter: number, verse?: number) => { setOsis(nextOsis); setChapter(nextChapter); setTargetVerse(verse); closeVerse(); setPanel("none"); };
  const move = (direction: -1 | 1) => {
    let index = bibleBooks.findIndex((item) => item.osis === book.osis);
    const nextChapter = chapter + direction;
    if (nextChapter < 1) { if (index === 0) return; index -= 1; go(bibleBooks[index].osis, bibleBooks[index].chapters); }
    else if (nextChapter > book.chapters) { if (index === bibleBooks.length - 1) return; index += 1; go(bibleBooks[index].osis, 1); }
    else go(book.osis, nextChapter);
  };
  const runSearch = () => {
    const parsed = parseBibleReference(search, book.osis, chapter);
    if (!parsed) { setNotice("Digite uma referência como João 3:16."); return; }
    go(parsed.book.osis, parsed.chapter, parsed.verse); setSearch("");
  };
  const returnToLesson = () => {
    if (!params.returnActivityId) return;
    const common = { activityId: params.returnActivityId, journeyMode: params.returnJourneyMode, journeyBookId: params.returnJourneyBookId };
    if (params.returnKind && params.returnKind !== "bible") router.replace({ pathname: "/activity/[kind]/[activityId]", params: { ...common, kind: params.returnKind } });
    else router.replace({ pathname: "/lesson/[activityId]", params: common });
  };
  const showOriginal = async () => {
    if (!selected) return;
    setOriginalLoading(true);
    try { const words = await loadBundledOriginalVerse(book.osis, chapter, selected.number); setSelectedOriginal(words); setOriginalInsights(await loadOriginalWordInsights(words)); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Texto original indisponível."); }
    finally { setOriginalLoading(false); }
  };
  const chooseTranslation = (id: string) => { setTranslationId(id); void savePreferredBibleTranslation(id); setReaderMode("portuguese"); setPanel("none"); };

  const actions: { icon: IconName; label: string; active?: boolean; onPress: () => void }[] = selected ? [
    { icon: "edit", label: selectedAnnotation?.note ? "Editar nota" : "Nota", active: noteOpen, onPress: () => setNoteOpen((open) => !open) },
    { icon: "bookmark", label: selectedAnnotation?.bookmarked ? "Marcado" : "Marcar", active: selectedAnnotation?.bookmarked, onPress: () => { const next = !selectedAnnotation?.bookmarked; saveAnnotation({ bookmarked: next }); setNotice(next ? "Versículo marcado." : "Marcação removida."); } },
    { icon: "copy", label: "Copiar", onPress: async () => { await Clipboard.setStringAsync(verseText); setNotice("Versículo copiado."); } },
    { icon: "share", label: "Enviar", onPress: () => { void Share.share({ message: verseText }); } },
    { icon: "memory", label: "Memorizar", onPress: async () => { await addVerseMemoryCard({ id: bibleAnnotationId(ANNOTATION_SCOPE, book.osis, chapter, selected.number), reference, text: selected.text }); setNotice("Adicionado à memorização."); } },
    ...(hasBundledOriginalBook(book.osis) ? [{ icon: "globe" as IconName, label: "Original", active: selectedOriginal.length > 0, onPress: () => { void showOriginal(); } }] : [])
  ] : [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Barra do leitor */}
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${book.name} ${chapter}. Escolher livro e capítulo`} onPress={() => setPanel("books")} style={styles.refChip}>
          <Text style={styles.refChipText} numberOfLines={1}>{book.name} {chapter}</Text>
          <Icon name="chevronDown" size={14} color={C.muted} strokeWidth={2.6} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Versão: ${translation.name}. Trocar versão`} onPress={() => setPanel("versions")} style={styles.versionChip}>
          <Text style={styles.versionChipText}>{readerMode === "portuguese" ? translation.shortName : readerMode === "original" ? "Original" : "Interlinear"}</Text>
        </Pressable>
        <View style={styles.flex} />
        <ToolbarButton icon="search" label="Buscar referência" onPress={() => setPanel(panel === "search" ? "none" : "search")} />
        <Pressable accessibilityRole="button" accessibilityLabel="Tamanho do texto e modo de leitura" onPress={() => setPanel("display")} style={styles.toolButton}><Text style={styles.aa}>Aa</Text></Pressable>
        <ToolbarButton icon="notebook" label="Caderno do capítulo" onPress={() => setShowNotebook(true)} />
      </View>
      {panel === "search" ? (
        <View style={styles.searchRow}>
          <TextInput value={search} onChangeText={setSearch} onSubmitEditing={runSearch} autoFocus returnKeyType="go" placeholder="Ex.: João 3:16 ou Sl 23" placeholderTextColor={C.muted} style={styles.searchInput} accessibilityLabel="Referência bíblica" />
          <Pressable accessibilityRole="button" onPress={runSearch} style={styles.searchGo}><Text style={styles.searchGoText}>Abrir</Text></Pressable>
        </View>
      ) : null}
      {params.returnActivityId ? (
        <Pressable accessibilityRole="button" onPress={returnToLesson} style={styles.returnPill}><Icon name="back" size={16} color={C.teal} /><Text style={styles.returnText}>Voltar à aula</Text></Pressable>
      ) : null}

      <ScrollView ref={scrollRef} contentContainerStyle={styles.page}>
        <Text style={styles.bookTitle}>{book.name}</Text>
        <Text style={styles.chapterLabel}>Capítulo {chapter}</Text>
        {readerMode !== "portuguese" ? (
          <OriginalChapterPanel osis={book.osis} chapter={chapter} portuguese={chapterData?.verses} interlinear={readerMode === "interlinear"} onSelect={openVerse} />
        ) : loading ? (
          <ActivityIndicator color={C.teal} size="large" style={styles.loading} />
        ) : error ? (
          <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text><Text style={styles.muted}>Confira a conexão. Capítulos já abertos continuam disponíveis offline.</Text></View>
        ) : (
          <View style={styles.verses}>
            {chapterData?.verses.map((verse) => {
              const annotation = annotationFor(verse.number);
              const highlight = annotation?.highlightColor;
              const isSelected = selected?.number === verse.number;
              return (
                <Pressable
                  key={verse.number}
                  accessibilityRole="button"
                  accessibilityLabel={`Versículo ${verse.number}${highlight ? ", destacado" : ""}${annotation?.note ? ", com nota" : ""}${annotation?.bookmarked ? ", marcado" : ""}`}
                  accessibilityHint="Abre as opções do versículo"
                  onPress={() => openVerse(verse)}
                  style={[styles.verse, highlight && { backgroundColor: (C === BIBLE_DARK ? HIGHLIGHT_BG_DARK : HIGHLIGHT_BG)[highlight] }, targetVerse === verse.number && !highlight && styles.target, isSelected && styles.verseSelected]}
                >
                  <Text style={[styles.verseText, { fontSize, lineHeight: Math.round(fontSize * 1.62) }, isSelected && styles.verseTextSelected]}>
                    <Text style={styles.verseNumber}>{verse.number} </Text>{verse.text}
                  </Text>
                  {annotation?.note || annotation?.bookmarked ? (
                    <View style={styles.verseMarks}>
                      {annotation.bookmarked ? <Icon name="bookmark" size={14} color={C.gold} strokeWidth={2.4} /> : null}
                      {annotation.note ? <Icon name="edit" size={14} color={C.teal} strokeWidth={2.4} /> : null}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
        {readerMode === "portuguese" && !loading && !error ? <Text style={styles.attribution}>{translation.attribution}</Text> : null}
        {crossReferences.length ? (
          <View style={styles.crossCard}>
            <Text style={styles.crossTitle}>Passagens relacionadas</Text>
            {crossReferences.map((item) => (
              <Pressable key={item.id} accessibilityRole="button" onPress={() => go(item.to.bookOsis, item.to.chapter, item.to.verse)} style={styles.crossItem}>
                <Text style={styles.crossLabel}>{item.to.label}</Text>
                <Text style={styles.crossNote}>{item.note}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Navegação de capítulos */}
      <View style={styles.chapterBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Capítulo anterior" onPress={() => move(-1)} style={styles.chapterButton}><Icon name="chevronLeft" size={22} color={C.navy} /></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setPanel("books")} style={styles.chapterCenter}><Text style={styles.chapterCenterText}>{book.name} · {chapter} de {book.chapters}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo capítulo" onPress={() => move(1)} style={styles.chapterButton}><Icon name="chevronRight" size={22} color={C.navy} /></Pressable>
      </View>
      {notice ? <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite"><Text style={styles.toastText}>{notice}</Text></View> : null}

      <BookPicker visible={panel === "books"} current={book} chapter={chapter} onClose={() => setPanel("none")} onPick={(next, nextChapter) => go(next.osis, nextChapter)} />

      <Sheet visible={panel === "versions"} title="Versão da Bíblia" onClose={() => setPanel("none")}>
        {BIBLE_TRANSLATIONS.map((item) => {
          const active = readerMode === "portuguese" && item.id === translationId;
          return (
            <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => chooseTranslation(item.id)} style={[styles.option, active && styles.optionActive]}>
              <View style={styles.flex}><Text style={styles.optionTitle}>{item.name}</Text><Text style={styles.optionText}>{item.style}</Text><Text style={styles.optionMeta}>{item.license}</Text></View>
              {active ? <Icon name="check" size={20} color={C.teal} strokeWidth={3} /> : null}
            </Pressable>
          );
        })}
        <Text style={styles.sheetSection}>Idiomas originais (incluídos no app)</Text>
        {(["original", "interlinear"] as const).map((mode) => (
          <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: readerMode === mode }} onPress={() => { setReaderMode(mode); setPanel("none"); }} style={[styles.option, readerMode === mode && styles.optionActive]}>
            <View style={styles.flex}><Text style={styles.optionTitle}>{mode === "original" ? "Texto original" : "Interlinear"}</Text><Text style={styles.optionText}>{mode === "original" ? "Hebraico e grego, com transliteração." : "Original palavra por palavra com o português."}</Text><Text style={styles.optionMeta}>{originalSource}</Text></View>
            {readerMode === mode ? <Icon name="check" size={20} color={C.teal} strokeWidth={3} /> : null}
          </Pressable>
        ))}
      </Sheet>

      <Sheet visible={panel === "display"} title="Leitura" onClose={() => setPanel("none")}>
        <Text style={styles.sheetSection}>Tamanho do texto</Text>
        <View style={styles.fontRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Diminuir texto" onPress={() => setFontSize((value) => Math.max(15, value - 1))} style={styles.fontButton}><Text style={[styles.fontGlyph, { fontSize: 15 }]}>A</Text></Pressable>
          <Text style={[styles.fontPreview, { fontSize }]}>Texto</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Aumentar texto" onPress={() => setFontSize((value) => Math.min(26, value + 1))} style={styles.fontButton}><Text style={[styles.fontGlyph, { fontSize: 24 }]}>A</Text></Pressable>
        </View>
      </Sheet>

      {/* Ações do versículo */}
      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={closeVerse} statusBarTranslucent>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={styles.backdrop} onPress={closeVerse} />
          <View style={[styles.verseSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.handle} />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.verseSheetContent}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetReference}>{reference}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={closeVerse} hitSlop={10}><Icon name="close" size={22} color={C.muted} /></Pressable>
              </View>
              {selected?.text ? <Text style={styles.sheetVerse} numberOfLines={noteOpen ? 3 : 6}>{selected.text}</Text> : null}

              <View style={styles.colorRow} accessibilityLabel="Cor do destaque">
                {HIGHLIGHTS.map((item) => {
                  const active = selectedAnnotation?.highlightColor === item.id;
                  return (
                    <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: active }} accessibilityLabel={`Destacar em ${item.label}`} onPress={() => saveAnnotation({ highlightColor: active ? undefined : item.id })} style={[styles.colorDot, { backgroundColor: item.dot }, active && styles.colorDotActive]}>
                      {active ? <Icon name="check" size={16} color="#ffffff" strokeWidth={3.2} /> : null}
                    </Pressable>
                  );
                })}
                {selectedAnnotation?.highlightColor ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Remover destaque" onPress={() => saveAnnotation({ highlightColor: undefined })} style={styles.clearDot}><Icon name="close" size={16} color={C.muted} /></Pressable>
                ) : null}
              </View>

              <View style={styles.actionGrid}>
                {actions.map((action) => (
                  <Pressable key={action.label} accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={[styles.action, action.active && styles.actionActive]}>
                    <Icon name={action.icon} size={22} color={action.active ? C.teal : C.navy} />
                    <Text style={[styles.actionLabel, action.active && { color: C.teal }]}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>

              {noteOpen ? (
                <View style={styles.noteBox}>
                  <TextInput value={note} onChangeText={setNote} multiline autoFocus placeholder="O que este versículo diz para você?" placeholderTextColor={C.muted} style={styles.noteInput} accessibilityLabel="Sua nota" />
                  <View style={styles.noteActions}>
                    {selectedAnnotation?.note ? <Pressable accessibilityRole="button" onPress={() => { setNote(""); saveAnnotation({ note: "" }); setNoteOpen(false); setNotice("Nota apagada."); }} style={styles.noteSecondary}><Text style={styles.noteSecondaryText}>Apagar</Text></Pressable> : null}
                    <Pressable accessibilityRole="button" onPress={() => { saveAnnotation({ note: note.trim() }); setNoteOpen(false); setNotice("Nota salva."); }} style={styles.notePrimary}><Text style={styles.notePrimaryText}>Salvar nota</Text></Pressable>
                  </View>
                </View>
              ) : selectedAnnotation?.note ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Editar nota" onPress={() => setNoteOpen(true)} style={styles.savedNote}><Icon name="edit" size={16} color={C.teal} /><Text style={styles.savedNoteText}>{selectedAnnotation.note}</Text></Pressable>
              ) : null}

              {originalLoading ? <ActivityIndicator color={C.teal} /> : null}
              {selectedOriginal.length ? (
                <View style={styles.originalBox}>
                  <Text style={styles.sheetSection}>{originalSource}</Text>
                  <View style={styles.originalWords}>
                    {selectedOriginal.map((word) => {
                      const insight = originalInsights.find((item) => item.position === word.position);
                      const query = word.strong || word.lemma;
                      return (
                        <Pressable key={word.position} accessibilityRole="button" onPress={() => { if (!word.strong) return; closeVerse(); router.push({ pathname: word.language === "grc" ? "/greek/dictionary" : "/hebrew/dictionary", params: { query: word.strong } }); }} style={styles.originalWord}>
                          <Text style={[styles.originalForm, word.language !== "grc" && styles.rtl]}>{word.form}</Text>
                          <Text style={styles.transliteration}>{word.transliteration || transliterateOriginal(word.form, word.language)}</Text>
                          <Text style={styles.wordMeta}>{originalLanguageLabel(word.language)} · {query}</Text>
                          <Text style={styles.wordMorph}>{explainMorphology(word.morphology, word.language)}</Text>
                          {insight?.senses.length ? <Text style={styles.wordSense}>{insight.senses.slice(0, 2).join("; ")}</Text> : null}
                          <Pressable accessibilityRole="button" onPress={async () => { await saveNotebookItem({ id: `word:${word.language}:${query}`, kind: "original-word", title: word.form, body: [word.transliteration || transliterateOriginal(word.form, word.language), explainMorphology(word.morphology, word.language)].filter(Boolean).join(" · "), reference, route: word.language === "grc" ? `/greek/dictionary?query=${encodeURIComponent(query)}` : `/hebrew/dictionary?query=${encodeURIComponent(query)}` }); setNotice("Palavra salva no caderno."); }}><Text style={styles.saveWord}>＋ Caderno</Text></Pressable>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BibleStudyNotebook visible={showNotebook} onClose={() => setShowNotebook(false)} bookOsis={book.osis} bookName={book.name} chapter={chapter} verse={selected?.number ?? targetVerse} notes={progress.bibleStudyNotes ?? []} onSave={saveBibleStudyNote} onRemove={removeBibleStudyNote} />
    </View>
  );
}

function ToolbarButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const C = useBiblePalette();
  const styles = useMemo(() => makeStyles(C), [C]);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.toolButton} hitSlop={4}><Icon name={icon} size={21} color={C.navy} /></Pressable>;
}

function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const C = useBiblePalette();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={styles.backdrop} onPress={onClose} />
      <View style={[styles.verseSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={styles.verseSheetContent}>
          <View style={styles.sheetHeader}><Text style={styles.sheetReference}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} hitSlop={10}><Icon name="close" size={22} color={C.muted} /></Pressable></View>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

function BookPicker({ visible, current, chapter, onClose, onPick }: { visible: boolean; current: BibleBookMeta; chapter: number; onClose: () => void; onPick: (book: BibleBookMeta, chapter: number) => void }) {
  const C = useBiblePalette();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [testament, setTestament] = useState(current.testament);
  const [filter, setFilter] = useState("");
  const [picked, setPicked] = useState<BibleBookMeta>();
  useEffect(() => { if (visible) { setTestament(current.testament); setPicked(undefined); setFilter(""); } }, [visible, current.testament]);
  const normalized = filter.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const books = useMemo(() => bibleBooks.filter((item) => normalized
    ? item.name.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(normalized)
    : item.testament === testament), [normalized, testament]);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => (picked ? setPicked(undefined) : onClose())}>
      <View style={[styles.picker, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.sheetHeader}>
          {picked ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar aos livros" onPress={() => setPicked(undefined)} hitSlop={10}><Icon name="back" size={24} color={C.navy} /></Pressable> : null}
          <Text style={[styles.pickerTitle, styles.flex]}>{picked ? picked.name : "Livros"}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} hitSlop={10}><Icon name="close" size={24} color={C.navy} /></Pressable>
        </View>
        {picked ? (
          <ScrollView contentContainerStyle={styles.chapterGrid}>
            {Array.from({ length: picked.chapters }, (_, index) => index + 1).map((number) => {
              const active = picked.osis === current.osis && number === chapter;
              return <Pressable key={number} accessibilityRole="button" accessibilityLabel={`Capítulo ${number}`} onPress={() => onPick(picked, number)} style={[styles.chapterCell, active && styles.chapterCellActive]}><Text style={[styles.chapterCellText, active && styles.chapterCellTextActive]}>{number}</Text></Pressable>;
            })}
          </ScrollView>
        ) : (
          <>
            <View style={styles.pickerSearch}><Icon name="search" size={18} color={C.muted} /><TextInput value={filter} onChangeText={setFilter} placeholder="Buscar livro" placeholderTextColor={C.muted} style={styles.pickerSearchInput} accessibilityLabel="Buscar livro" /></View>
            {!normalized ? (
              <View style={styles.segment}>
                {(["old", "new"] as const).map((value) => (
                  <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: testament === value }} onPress={() => setTestament(value)} style={[styles.segmentButton, testament === value && styles.segmentActive]}>
                    <Text style={[styles.segmentText, testament === value && styles.segmentTextActive]}>{value === "old" ? "Antigo Testamento" : "Novo Testamento"}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <ScrollView contentContainerStyle={styles.bookList}>
              {books.map((item) => (
                <Pressable key={item.osis} accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.chapters} capítulos`} onPress={() => (item.chapters === 1 ? onPick(item, 1) : setPicked(item))} style={[styles.bookRow, item.osis === current.osis && styles.bookRowActive]}>
                  <View style={styles.bookAbbr}><Text style={styles.bookAbbrText}>{item.abbreviation}</Text></View>
                  <Text style={styles.bookName}>{item.name}</Text>
                  <Text style={styles.bookChapters}>{item.chapters}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

const makeStyles = (C: BiblePalette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper },
  flex: { flex: 1 },
  muted: { color: C.muted, fontSize: 13, lineHeight: 19 },
  toolbar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line },
  refChip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 20, backgroundColor: C.chip, maxWidth: 170 },
  refChipText: { color: C.navy, fontSize: 15, fontWeight: "900", flexShrink: 1 },
  versionChip: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: C.line },
  versionChipText: { color: C.teal, fontSize: 13, fontWeight: "900" },
  toolButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  aa: { color: C.navy, fontSize: 17, fontWeight: "900" },
  searchRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, paddingHorizontal: 12, fontSize: 16, color: C.ink },
  searchGo: { minWidth: 72, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: C.teal },
  searchGoText: { color: C === BIBLE_DARK ? "#06231f" : "#ffffff", fontWeight: "900" },
  returnPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginLeft: 12, marginTop: 8, minHeight: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: C.tealSoft },
  returnText: { color: C.teal, fontWeight: "900" },
  page: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 },
  bookTitle: { color: C.navy, fontSize: 30, fontWeight: "900", fontFamily: SERIF },
  chapterLabel: { color: C.gold, fontSize: 13, fontWeight: "900", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 14 },
  loading: { marginTop: 40 },
  verses: { gap: 2 },
  verse: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 6, marginHorizontal: -6 },
  verseSelected: { borderWidth: 1, borderColor: C.teal, borderStyle: "dashed" },
  target: { backgroundColor: C.target },
  verseText: { color: C.ink, fontFamily: SERIF },
  verseTextSelected: { color: C.navy },
  verseNumber: { color: C.teal, fontSize: 12, fontWeight: "900", fontFamily: undefined },
  verseMarks: { flexDirection: "row", gap: 6, marginTop: 2 },
  attribution: { marginTop: 18, color: C.muted, fontSize: 11, lineHeight: 16 },
  errorCard: { gap: 6, padding: 16, borderRadius: 14, backgroundColor: C.surfaceAlt },
  errorText: { color: "#b4233c", fontWeight: "800" },
  crossCard: { marginTop: 22, gap: 8, padding: 14, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  crossTitle: { color: C.navy, fontWeight: "900", fontSize: 15 },
  crossItem: { gap: 2, paddingVertical: 4 },
  crossLabel: { color: C.teal, fontWeight: "900" },
  crossNote: { color: C.ink, fontSize: 13, lineHeight: 19 },
  chapterBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.paper },
  chapterButton: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: C.chip },
  chapterCenter: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 46 },
  chapterCenterText: { color: C.navy, fontSize: 14, fontWeight: "800" },
  toast: { position: "absolute", bottom: 76, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: C.navy },
  toastText: { color: C.paper, fontWeight: "800" },
  backdrop: { flex: 1, backgroundColor: "rgba(16,36,62,0.4)" },
  verseSheet: { maxHeight: "86%", backgroundColor: C.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, marginTop: 10 },
  verseSheetContent: { padding: 20, gap: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sheetReference: { color: C.navy, fontSize: 20, fontWeight: "900", flexShrink: 1 },
  sheetVerse: { color: C.ink, fontSize: 16, lineHeight: 24, fontFamily: SERIF },
  colorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  colorDot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  colorDotActive: { borderWidth: 3, borderColor: C.navy },
  clearDot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: { width: "31.5%", minHeight: 64, alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 14, backgroundColor: C.surfaceAlt },
  actionActive: { backgroundColor: C.tealSoft },
  actionLabel: { color: C.navy, fontSize: 12, fontWeight: "800" },
  noteBox: { gap: 10 },
  noteInput: { minHeight: 110, textAlignVertical: "top", borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 12, fontSize: 16, color: C.ink, backgroundColor: C.noteBg },
  noteActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  notePrimary: { minHeight: 46, paddingHorizontal: 18, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: C.teal },
  notePrimaryText: { color: C === BIBLE_DARK ? "#06231f" : "#ffffff", fontWeight: "900" },
  noteSecondary: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  noteSecondaryText: { color: "#b4233c", fontWeight: "800" },
  savedNote: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 14, backgroundColor: C.tealSoft },
  savedNoteText: { flex: 1, color: C.ink, fontSize: 14, lineHeight: 20 },
  sheetSection: { color: C.muted, fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: C.line },
  optionActive: { borderColor: C.teal, backgroundColor: C.tealSoft },
  optionTitle: { color: C.navy, fontSize: 16, fontWeight: "900" },
  optionText: { color: C.ink, fontSize: 13, lineHeight: 19, marginTop: 2 },
  optionMeta: { color: C.muted, fontSize: 11, marginTop: 4 },
  fontRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fontButton: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceAlt },
  fontGlyph: { color: C.navy, fontWeight: "900", fontFamily: SERIF },
  fontPreview: { color: C.ink, fontFamily: SERIF },
  originalBox: { gap: 8 },
  originalWords: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  originalWord: { maxWidth: 170, padding: 10, borderRadius: 12, backgroundColor: C.surfaceAlt, gap: 2 },
  originalForm: { fontSize: 21, color: C.navy },
  rtl: { writingDirection: "rtl", textAlign: "right" },
  transliteration: { fontSize: 12, color: C.teal, fontWeight: "800" },
  wordMeta: { fontSize: 10, color: C.gold, fontWeight: "800" },
  wordMorph: { fontSize: 10, lineHeight: 14, color: C.muted },
  wordSense: { fontSize: 11, lineHeight: 15, color: C.ink },
  saveWord: { marginTop: 4, color: C.teal, fontSize: 11, fontWeight: "900" },
  picker: { flex: 1, backgroundColor: C.paper, paddingHorizontal: 16, gap: 12 },
  pickerTitle: { color: C.navy, fontSize: 24, fontWeight: "900" },
  pickerSearch: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 46, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  pickerSearchInput: { flex: 1, fontSize: 16, color: C.ink },
  segment: { flexDirection: "row", padding: 4, borderRadius: 14, backgroundColor: C.chip },
  segmentButton: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  segmentActive: { backgroundColor: C.surface },
  segmentText: { color: C.muted, fontWeight: "800", fontSize: 13 },
  segmentTextActive: { color: C.navy },
  bookList: { gap: 6, paddingBottom: 24 },
  bookRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingHorizontal: 10, borderRadius: 14 },
  bookRowActive: { backgroundColor: C.tealSoft },
  bookAbbr: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.chip },
  bookAbbrText: { color: C.gold, fontWeight: "900", fontSize: 12 },
  bookName: { flex: 1, color: C.navy, fontSize: 16, fontWeight: "800" },
  bookChapters: { color: C.muted, fontSize: 13, fontWeight: "700" },
  chapterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 24 },
  chapterCell: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  chapterCellActive: { backgroundColor: C.teal, borderColor: C.teal },
  chapterCellText: { color: C.navy, fontSize: 17, fontWeight: "800" },
  chapterCellTextActive: { color: C === BIBLE_DARK ? "#06231f" : "#ffffff" }
});
