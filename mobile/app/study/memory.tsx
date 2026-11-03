import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bibleBookByOsis } from "../../../src/content/bible/catalog";
import { bibleAnnotationId } from "../../../src/domain/bibleReference";
import { toLocalDateKey } from "../../../src/domain/streak";
import { BIBLE_TRANSLATION } from "../../../src/services/bible";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon } from "../../components/navigation/Icons";
import {
  dueLabel, firstLetters, gapIndexes, joinTokens, MEMORY_STAGES, shuffledChunks, stageForBox, SUGGESTED_VERSES, tokenize, verseChunks, wordBank
} from "../../domain/verseMemory";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { loadCachedBibleBook } from "../../services/bibleStorage";
import { addVerseMemoryCard, loadMemoryCards, removeMemoryCard, reviewMemoryCard, type VerseMemoryCard } from "../../services/studyLibrary";
import type { Palette } from "../../theme/tokens";

const MAX_SESSION = 10;

export default function MemoryScreen() {
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [cards, setCards] = useState<VerseMemoryCard[]>([]);
  const [session, setSession] = useState<VerseMemoryCard[]>();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<boolean>();
  const [score, setScore] = useState(0);
  const [adding, setAdding] = useState<string>();
  const today = toLocalDateKey(new Date());

  const reload = useCallback(() => { void loadMemoryCards().then(setCards); }, []);
  useFocusEffect(reload);
  const due = useMemo(() => cards.filter((card) => card.dueDate <= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [cards, today]);
  const savedRefs = useMemo(() => new Set(cards.map((card) => card.id)), [cards]);

  const start = () => { setSession(due.slice(0, MAX_SESSION)); setIndex(0); setResult(undefined); setScore(0); playFeedback("start"); };
  const finishCard = (ok: boolean) => { setResult(ok); if (ok) setScore((value) => value + 1); playFeedback(ok ? "correct" : "wrong"); };
  const next = async () => {
    if (!session) return;
    const card = session[index];
    await reviewMemoryCard(card.id, Boolean(result));
    setResult(undefined);
    if (index + 1 >= session.length) { setIndex(session.length); playFeedback("complete"); reload(); }
    else setIndex(index + 1);
  };

  const addSuggested = async (item: (typeof SUGGESTED_VERSES)[number]) => {
    const book = bibleBookByOsis.get(item.osis);
    if (!book) return;
    setAdding(item.label);
    try {
      const data = await loadCachedBibleBook(book);
      const text = data.chapters.find((chapter) => chapter.chapter === item.chapter)?.verses.find((verse) => verse.number === item.verse)?.text;
      if (text) { await addVerseMemoryCard({ id: bibleAnnotationId(BIBLE_TRANSLATION.id, item.osis, item.chapter, item.verse), reference: item.label, text }); reload(); }
    } finally {
      setAdding(undefined);
    }
  };

  // ---------- Sessão ----------
  if (session) {
    const done = index >= session.length;
    const card = session[index];
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.sessionTop, { paddingTop: insets.top + 8 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Sair da sessão" onPress={() => { setSession(undefined); reload(); }} hitSlop={10}><Icon name="close" size={24} color={palette.textMuted} /></Pressable>
          <View style={styles.track}><View style={[styles.trackFill, { width: `${(Math.min(index + (result !== undefined ? 1 : 0), session.length) / session.length) * 100}%` }]} /></View>
          <Text style={styles.counter}>{Math.min(index + 1, session.length)}/{session.length}</Text>
        </View>
        {done ? (
          <View style={styles.doneWrap}>
            <LumiCharacter mood="proud" motion="celebrating" style={styles.doneLumi} accessibilityLabel="Lumi comemorando" />
            <Text style={styles.title}>Sessão concluída!</Text>
            <Text style={styles.muted}>{score} de {session.length} lembrados. “Escondi a tua palavra no meu coração” (Sl 119:11).</Text>
            <Pressable accessibilityRole="button" onPress={() => setSession(undefined)} style={styles.primary}><Text style={styles.primaryText}>Voltar</Text></Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={[styles.sessionBody, { paddingBottom: insets.bottom + 140 }]}>
            <View style={styles.stagePill}><Text style={styles.stagePillText}>{MEMORY_STAGES[Math.min(4, card.box)].label.toLocaleUpperCase("pt-BR")} · NÍVEL {Math.min(5, card.box + 1)}</Text></View>
            <Text style={styles.reference}>{card.reference}</Text>
            <Text style={styles.muted}>{MEMORY_STAGES[Math.min(4, card.box)].hint}</Text>
            <MemoryExercise key={card.id + index} card={card} onDone={finishCard} locked={result !== undefined} />
          </ScrollView>
        )}
        {!done && result !== undefined ? (
          <View style={[styles.feedback, { paddingBottom: Math.max(insets.bottom, 12) + 4, backgroundColor: result ? palette.successSoft : palette.errorSoft, borderTopColor: result ? palette.success : palette.error }]}>
            <Text style={[styles.feedbackTitle, { color: result ? palette.success : palette.error }]}>{result ? "Muito bem! Sobe de nível." : "Quase! Ele volta amanhã."}</Text>
            <Text style={styles.feedbackVerse} numberOfLines={5}>{card.text}</Text>
            <Pressable accessibilityRole="button" onPress={() => void next()} style={[styles.primary, !result && { backgroundColor: palette.error, borderBottomColor: "#8f2238" }]}><Text style={[styles.primaryText, !result && { color: "#ffffff" }]}>Continuar</Text></Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  // ---------- Início ----------
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Memorizar" }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.hero}>
          <LumiCharacter mood={due.length ? "encouragement" : "proud"} motion="encouraging" style={styles.heroLumi} accessibilityLabel="Lumi" />
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>GUARDE A PALAVRA</Text>
            <Text style={styles.title}>{due.length ? `${due.length} para hoje` : cards.length ? "Tudo revisado!" : "Comece um versículo"}</Text>
            <Text style={styles.muted}>Cada acerto sobe o nível: completar, montar, iniciais e, por fim, de cor.</Text>
          </View>
        </View>
        {due.length ? (
          <Pressable accessibilityRole="button" onPress={start} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Icon name="play" size={16} color={palette.ctaText} /><Text style={styles.primaryText}>Começar sessão · {Math.min(MAX_SESSION, due.length)}</Text>
          </Pressable>
        ) : null}

        <Text style={styles.section}>Sugestões para começar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SUGGESTED_VERSES.filter((item) => !savedRefs.has(bibleAnnotationId(BIBLE_TRANSLATION.id, item.osis, item.chapter, item.verse))).map((item) => (
            <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Adicionar ${item.label}`} disabled={Boolean(adding)} onPress={() => void addSuggested(item)} style={styles.chip}>
              <Icon name={adding === item.label ? "refresh" : "star"} size={14} color={palette.xp} />
              <Text style={styles.chipText}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.hint}>Você também pode tocar em qualquer versículo na aba Bíblia › Memorizar.</Text>

        <Text style={styles.section}>Meus versículos · {cards.length}</Text>
        {cards.length ? (
          <View style={styles.list}>
            {cards.map((card, i) => (
              <View key={card.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle}>{card.reference}</Text>
                  <Text style={styles.rowText} numberOfLines={1}>{card.text}</Text>
                  <View style={styles.levelRow}>
                    {[0, 1, 2, 3, 4].map((level) => <View key={level} style={[styles.levelDot, level < Math.min(5, card.box) && styles.levelDotOn, level === Math.min(4, card.box) && styles.levelDotNow]} />)}
                    <Text style={styles.rowMeta}>{card.box >= 5 ? "Dominado" : MEMORY_STAGES[Math.min(4, card.box)].label} · {dueLabel(card.dueDate, today)}</Text>
                  </View>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${card.reference}`} onPress={() => void removeMemoryCard(card.id).then(reload)} hitSlop={8}><Icon name="close" size={18} color={palette.textMuted} /></Pressable>
              </View>
            ))}
          </View>
        ) : <Text style={styles.empty}>Escolha uma sugestão acima para começar. Um versículo por semana já transforma!</Text>}
      </ScrollView>
    </View>
  );
}

/** Exercício do nível atual do versículo. */
function MemoryExercise({ card, onDone, locked }: { card: VerseMemoryCard; onDone: (ok: boolean) => void; locked: boolean }) {
  const stage = stageForBox(card.box);
  if (stage === "gaps-light" || stage === "gaps") return <GapsExercise card={card} ratio={stage === "gaps" ? 0.5 : 0.25} onDone={onDone} locked={locked} />;
  if (stage === "order") return <OrderChunks card={card} onDone={onDone} locked={locked} />;
  return <SelfCheck card={card} lettersOnly={stage === "letters"} onDone={onDone} locked={locked} />;
}

function useShake() {
  const shake = useRef(new Animated.Value(0)).current;
  const run = () => Animated.sequence([-8, 8, -6, 6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 45, useNativeDriver: true }))).start();
  return [shake, run] as const;
}

function GapsExercise({ card, ratio, onDone, locked }: { card: VerseMemoryCard; ratio: number; onDone: (ok: boolean) => void; locked: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const tokens = useMemo(() => tokenize(card.text), [card.text]);
  const gaps = useMemo(() => gapIndexes(card.id, tokens, ratio), [card.id, tokens, ratio]);
  const bank = useMemo(() => wordBank(card.id, tokens, gaps), [card.id, tokens, gaps]);
  const [filled, setFilled] = useState<string[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongKey, setWrongKey] = useState<string>();
  const [shake, runShake] = useShake();
  const pick = (item: (typeof bank)[number]) => {
    if (locked) return;
    const expected = tokens[gaps[filled.length]].text;
    if (item.text.toLocaleLowerCase("pt-BR") === expected.toLocaleLowerCase("pt-BR")) {
      const nextFilled = [...filled, expected];
      setFilled(nextFilled); setUsed([...used, item.key]);
      if (nextFilled.length === gaps.length) onDone(mistakes === 0);
    } else {
      setMistakes((value) => value + 1); setWrongKey(item.key); runShake();
      setTimeout(() => setWrongKey(undefined), 400);
    }
  };
  let gapCursor = 0;
  return (
    <View style={styles.exercise}>
      <Animated.View style={[styles.verseBox, { transform: [{ translateX: shake }] }]}>
        <Text style={styles.verseText}>
          {tokens.map((token, i) => {
            const gapNumber = gaps.indexOf(i);
            const space = i > 0 && token.word ? " " : "";
            if (gapNumber < 0) return <Text key={i}>{space}{token.text}</Text>;
            const value = filled[gapNumber];
            const active = gapNumber === filled.length;
            gapCursor += 1;
            return <Text key={i}>{space}<Text style={[styles.gap, value ? styles.gapFilled : null, active && !locked ? { borderColor: palette.accent, color: palette.accent } : null]}>{value ?? " ____ "}</Text></Text>;
          })}
        </Text>
      </Animated.View>
      <View style={styles.bank}>
        {bank.map((item) => (
          <Pressable key={item.key} disabled={used.includes(item.key) || locked} onPress={() => pick(item)} accessibilityRole="button"
            style={[styles.tile, used.includes(item.key) && styles.tileUsed, wrongKey === item.key && { borderColor: palette.error, backgroundColor: palette.errorSoft }]}>
            <Text style={[styles.tileText, used.includes(item.key) && { opacity: 0 }]}>{item.text}</Text>
          </Pressable>
        ))}
      </View>
      {gapCursor === 0 ? null : <Text style={styles.hint}>{mistakes ? `${mistakes} ${mistakes === 1 ? "tentativa errada" : "tentativas erradas"}` : "Sem erros até aqui!"}</Text>}
    </View>
  );
}

function OrderChunks({ card, onDone, locked }: { card: VerseMemoryCard; onDone: (ok: boolean) => void; locked: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const chunks = useMemo(() => verseChunks(card.text), [card.text]);
  const shuffled = useMemo(() => shuffledChunks(card.id, chunks), [card.id, chunks]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongKey, setWrongKey] = useState<string>();
  const [shake, runShake] = useShake();
  const pick = (item: (typeof shuffled)[number]) => {
    if (locked) return;
    if (item.index === placed.length) {
      const next = [...placed, item.index];
      setPlaced(next);
      if (next.length === chunks.length) onDone(mistakes === 0);
    } else { setMistakes((value) => value + 1); setWrongKey(item.key); runShake(); setTimeout(() => setWrongKey(undefined), 400); }
  };
  return (
    <View style={styles.exercise}>
      <Animated.View style={[styles.verseBox, styles.orderBox, { transform: [{ translateX: shake }] }]}>
        {placed.length ? <Text style={styles.verseText}>{placed.map((i) => chunks[i]).join(" ")}</Text> : <Text style={styles.placeholder}>Toque na primeira parte do versículo…</Text>}
      </Animated.View>
      <View style={styles.chunkList}>
        {shuffled.map((item) => (
          <Pressable key={item.key} disabled={placed.includes(item.index) || locked} onPress={() => pick(item)} accessibilityRole="button"
            style={[styles.chunk, placed.includes(item.index) && styles.tileUsed, wrongKey === item.key && { borderColor: palette.error, backgroundColor: palette.errorSoft }]}>
            <Text style={[styles.chunkText, placed.includes(item.index) && { opacity: 0.25 }]}>{item.text}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SelfCheck({ card, lettersOnly, onDone, locked }: { card: VerseMemoryCard; lettersOnly: boolean; onDone: (ok: boolean) => void; locked: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.exercise}>
      <View style={styles.verseBox}>
        {revealed ? <Text style={styles.verseText}>{card.text}</Text>
          : lettersOnly ? <Text style={[styles.verseText, styles.letters]}>{joinTokens(firstLetters(card.text))}</Text>
            : <Text style={styles.placeholder}>Recite o versículo em voz alta, sem olhar. Depois confira.</Text>}
      </View>
      {!revealed ? (
        <Pressable accessibilityRole="button" onPress={() => setRevealed(true)} style={styles.secondary}><Icon name="search" size={16} color={palette.accent} /><Text style={styles.secondaryText}>Conferir o texto</Text></Pressable>
      ) : !locked ? (
        <View style={styles.gradeRow}>
          <Pressable accessibilityRole="button" onPress={() => onDone(false)} style={[styles.grade, { borderColor: palette.error }]}><Text style={[styles.gradeText, { color: palette.error }]}>Errei algo</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => onDone(true)} style={[styles.grade, { borderColor: palette.success, backgroundColor: palette.successSoft }]}><Text style={[styles.gradeText, { color: palette.success }]}>Lembrei tudo</Text></Pressable>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  content: { padding: 16, gap: 12 },
  pressed: { opacity: 0.85 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  heroLumi: { width: 92, height: 88 },
  eyebrow: { color: p.xp, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 24, fontWeight: "900" },
  muted: { color: p.textMuted, fontSize: 14, lineHeight: 20 },
  section: { color: p.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 10 },
  hint: { color: p.textMuted, fontSize: 12, lineHeight: 17 },
  chips: { gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  chipText: { color: p.text, fontSize: 13, fontWeight: "800" },
  list: { borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowDivider: { borderTopWidth: 1, borderTopColor: p.divider },
  rowTitle: { color: p.text, fontSize: 15, fontWeight: "900" },
  rowText: { color: p.textMuted, fontSize: 13, marginTop: 2 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  levelDot: { width: 14, height: 6, borderRadius: 3, backgroundColor: p.line },
  levelDotOn: { backgroundColor: p.xp },
  levelDotNow: { backgroundColor: p.accent },
  rowMeta: { color: p.textMuted, fontSize: 12, fontWeight: "700", marginLeft: 6 },
  empty: { color: p.textMuted, fontSize: 14, lineHeight: 20, padding: 16, textAlign: "center", borderRadius: 16, backgroundColor: p.card },
  primary: { flexDirection: "row", gap: 8, minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", alignSelf: "stretch", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  sessionTop: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 10 },
  track: { flex: 1, height: 14, borderRadius: 7, backgroundColor: p.line, overflow: "hidden" },
  trackFill: { height: 14, borderRadius: 7, backgroundColor: p.xp },
  counter: { color: p.textMuted, fontSize: 13, fontWeight: "900" },
  sessionBody: { padding: 18, gap: 10 },
  stagePill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: p.goldSoft },
  stagePillText: { color: p.xp, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  reference: { color: p.text, fontSize: 26, fontWeight: "900" },
  exercise: { gap: 16, marginTop: 8 },
  verseBox: { padding: 18, borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, minHeight: 120, justifyContent: "center" },
  orderBox: { minHeight: 140 },
  verseText: { color: p.text, fontSize: 20, lineHeight: 34, fontWeight: "600" },
  letters: { letterSpacing: 1, fontWeight: "800" },
  placeholder: { color: p.textMuted, fontSize: 16, lineHeight: 23, textAlign: "center" },
  gap: { color: p.textMuted, fontWeight: "900", borderBottomWidth: 2, borderColor: p.line, textDecorationLine: "underline" },
  gapFilled: { color: p.success, textDecorationLine: "none" },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  tile: { minHeight: 46, justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  tileUsed: { backgroundColor: p.divider, borderColor: p.divider },
  tileText: { color: p.text, fontSize: 16, fontWeight: "800" },
  chunkList: { gap: 8 },
  chunk: { padding: 14, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  chunkText: { color: p.text, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  secondary: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 50, borderRadius: 16, borderWidth: 2, borderColor: p.line },
  secondaryText: { color: p.accent, fontSize: 15, fontWeight: "900" },
  gradeRow: { flexDirection: "row", gap: 10 },
  grade: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 2, borderBottomWidth: 5 },
  gradeText: { fontSize: 16, fontWeight: "900" },
  feedback: { position: "absolute", left: 0, right: 0, bottom: 0, gap: 8, padding: 18, borderTopWidth: 3 },
  feedbackTitle: { fontSize: 20, fontWeight: "900" },
  feedbackVerse: { color: p.text, fontSize: 15, lineHeight: 22 },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  doneLumi: { width: 160, height: 150 }
});
