import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bibleBookByOsis } from "../../src/content/bible/catalog";
import { Icon } from "../components/navigation/Icons";
import {
  DEVOTIONAL_XP, devotionalDateKey, devotionalFor, devotionalStreak, emptyDevotionalState, markDevotionalDone,
  type Devotional, type DevotionalState
} from "../domain/devotional";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { loadCachedBibleBook } from "../services/bibleStorage";
import { loadDevotionalState, loadKnownDevotionals, refreshDevotionals, saveDevotionalState } from "../services/devotional";
import { trackEvent } from "../services/funnel";
import { speak, stopSpeaking } from "../services/speech";
import type { Palette } from "../theme/tokens";

const formatDate = (key: string) => new Date(key + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

/** Devocional do dia: reflexão, aplicação, perguntas e oração, com áudio e arquivo dos anteriores. */
export default function DevotionalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { awardDevotionalXp } = useMobileProgress();
  const params = useLocalSearchParams<{ date?: string }>();
  const today = devotionalDateKey();
  const [known, setKnown] = useState<Devotional[]>([]);
  const [state, setState] = useState<DevotionalState>(emptyDevotionalState());
  const [loaded, setLoaded] = useState(false);
  const [verseText, setVerseText] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [justDone, setJustDone] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [local, saved] = await Promise.all([loadKnownDevotionals(), loadDevotionalState()]);
      if (!active) return;
      setKnown(local); setState(saved); setLoaded(true);
      const fresh = await refreshDevotionals(today);
      if (active) setKnown(fresh);
    })();
    return () => { active = false; stopSpeaking(); };
  }, [today]);

  const requested = typeof params.date === "string" ? params.date : today;
  const { devotional, isToday } = useMemo(() => devotionalFor(requested, known), [requested, known]);
  const done = devotional ? state.done.includes(devotional.date) : false;

  useEffect(() => {
    setAnswers(devotional ? devotional.questions.map((_, index) => state.answers[devotional.date]?.[index] ?? "") : []);
    setVerseText("");
    if (!devotional) return;
    const book = bibleBookByOsis.get(devotional.verse.book);
    if (!book) return;
    let active = true;
    void loadCachedBibleBook(book).then((data) => {
      const verses = data.chapters.find((chapter) => chapter.chapter === devotional.verse.chapter)?.verses ?? [];
      const text = verses.filter((verse) => verse.number >= devotional.verse.from && verse.number <= devotional.verse.to).map((verse) => verse.text).join(" ");
      if (active) setVerseText(text);
    }).catch(() => undefined);
    return () => { active = false; };
    // As respostas só são recarregadas quando muda o devocional exibido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devotional?.date]);

  const reference = devotional
    ? `${bibleBookByOsis.get(devotional.verse.book)?.name ?? devotional.verse.book} ${devotional.verse.chapter}:${devotional.verse.from}${devotional.verse.to > devotional.verse.from ? `-${devotional.verse.to}` : ""}`
    : "";

  const toggleAudio = useCallback(async () => {
    if (!devotional) return;
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    const body = [devotional.title, `${reference}. ${verseText}`, ...devotional.reflection, "Aplicação.", devotional.application, "Oração.", devotional.prayer].join(" ");
    try { await speak(body, "pt", undefined, 0.92); } finally { setSpeaking(false); }
  }, [devotional, reference, speaking, verseText]);

  const finish = useCallback(async () => {
    if (!devotional || done) return;
    stopSpeaking(); setSpeaking(false);
    const next = markDevotionalDone(state, devotional.date, answers);
    setState(next);
    await saveDevotionalState(next);
    // XP e ofensiva só valem para o devocional do dia (recuperar um antigo não rende XP).
    if (devotional.date === today) awardDevotionalXp();
    setJustDone(true);
    trackEvent("devotional_done");
  }, [answers, awardDevotionalXp, devotional, done, state, today]);

  const archive = known.filter((item) => item.date !== devotional?.date);
  const streak = devotionalStreak(state.done, today);

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: "Devocional" }} />
      {!loaded ? <Text style={styles.note}>Carregando…</Text> : null}
      {loaded && !devotional ? (
        <View style={styles.card}>
          <Text style={styles.title}>Ainda não há devocional por aqui</Text>
          <Text style={styles.note}>Conecte-se à internet para buscar o devocional de hoje.</Text>
        </View>
      ) : null}

      {devotional ? (
        <>
          <View style={styles.head}>
            <Text style={styles.eyebrow}>{isToday && devotional.date === today ? "DEVOCIONAL DE HOJE" : "DEVOCIONAL"} · {formatDate(devotional.date).toUpperCase()}</Text>
            <Text style={styles.title} accessibilityRole="header">{devotional.title}</Text>
            {streak > 1 ? <Text style={styles.streak}>🔥 {streak} dias seguidos de devocional</Text> : null}
            {requested === today && devotional.date !== today ? <Text style={styles.note}>O devocional de hoje ainda não chegou. Enquanto isso, veja o mais recente.</Text> : null}
          </View>

          <View style={styles.verse}>
            <Text style={styles.verseText}>{verseText ? `“${verseText}”` : "Carregando o versículo…"}</Text>
            <Text style={styles.verseRef}>{reference}</Text>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel={speaking ? "Parar áudio" : "Ouvir o devocional"} onPress={() => void toggleAudio()} style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
            <Icon name={speaking ? "close" : "volume"} size={16} color={palette.accent} />
            <Text style={styles.ghostText}>{speaking ? "Parar áudio" : "Ouvir o devocional"}</Text>
          </Pressable>

          <Text style={styles.section}>Reflexão</Text>
          {devotional.reflection.map((paragraph, index) => <Text key={index} style={styles.body}>{paragraph}</Text>)}
          <View style={styles.key}><Text style={styles.keyText}>{devotional.keyPhrase}</Text></View>

          <Text style={styles.section}>Para viver hoje</Text>
          <View style={styles.card}><Text style={styles.body}>{devotional.application}</Text></View>

          <Text style={styles.section}>Para pensar</Text>
          {devotional.questions.map((question, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.question}>{index + 1}. {question}</Text>
              <TextInput
                value={answers[index] ?? ""}
                onChangeText={(value) => setAnswers((current) => current.map((item, i) => (i === index ? value : item)))}
                editable={!done}
                multiline
                placeholder="Sua resposta (fica só no seu aparelho)"
                placeholderTextColor={palette.textMuted}
                accessibilityLabel={`Resposta da pergunta ${index + 1}`}
                style={styles.input}
              />
            </View>
          ))}

          <Text style={styles.section}>Oração</Text>
          <View style={styles.card}><Text style={[styles.body, styles.prayer]}>{devotional.prayer}</Text></View>

          {done ? (
            <View style={styles.doneBox}>
              <Text style={styles.doneText}>{justDone && devotional.date === today ? `✅ Devocional concluído! +${DEVOTIONAL_XP} XP` : "✅ Devocional concluído"}</Text>
            </View>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Concluir devocional" onPress={() => void finish()} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>Concluir devocional{devotional.date === today ? ` (+${DEVOTIONAL_XP} XP)` : ""}</Text>
            </Pressable>
          )}
        </>
      ) : null}

      {archive.length ? <Text style={styles.section}>Anteriores</Text> : null}
      {archive.map((item) => (
        <Pressable key={item.date} accessibilityRole="button" accessibilityLabel={`Abrir devocional de ${formatDate(item.date)}`} onPress={() => router.replace({ pathname: "/devotional", params: { date: item.date } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.note}>{formatDate(item.date)}</Text>
          </View>
          {state.done.includes(item.date) ? <Text style={styles.rowDone}>✓</Text> : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 12 },
  head: { gap: 4 },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: p.text, fontSize: 26, fontWeight: "900", lineHeight: 32 },
  streak: { color: p.streakText, fontSize: 13, fontWeight: "800" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  verse: { gap: 6, padding: 16, borderRadius: 18, backgroundColor: p.activeTabBg, borderLeftWidth: 4, borderLeftColor: p.accent },
  verseText: { color: p.text, fontSize: 18, lineHeight: 27, fontStyle: "italic" },
  verseRef: { color: p.accent, fontSize: 14, fontWeight: "900" },
  section: { color: p.text, fontSize: 20, fontWeight: "900", marginTop: 8 },
  body: { color: p.text, fontSize: 16, lineHeight: 25 },
  prayer: { fontStyle: "italic" },
  key: { padding: 14, borderRadius: 14, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.accent },
  keyText: { color: p.text, fontSize: 17, fontWeight: "800", lineHeight: 25, textAlign: "center" },
  card: { gap: 8, padding: 14, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  question: { color: p.text, fontSize: 15, fontWeight: "800", lineHeight: 22 },
  input: { minHeight: 64, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: p.line, color: p.text, fontSize: 15, textAlignVertical: "top" },
  primary: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow, marginTop: 6 },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  ghost: { minHeight: 46, borderRadius: 14, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.accent },
  ghostText: { color: p.accent, fontSize: 15, fontWeight: "900" },
  doneBox: { padding: 14, borderRadius: 14, backgroundColor: p.successSoft, alignItems: "center" },
  doneText: { color: p.success, fontSize: 15, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, padding: 12, borderRadius: 14, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { color: p.text, fontSize: 15, fontWeight: "800" },
  rowDone: { color: p.success, fontSize: 18, fontWeight: "900" },
  pressed: { opacity: 0.85 }
});
