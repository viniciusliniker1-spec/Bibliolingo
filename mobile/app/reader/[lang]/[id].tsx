import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCharacter } from "../../../components/LumiCharacter";
import { Icon } from "../../../components/navigation/Icons";
import type { ReaderLanguage, ReaderPassage, ReaderWord } from "../../../content/reader/types";
import { buildReaderSession, nextPassage, passageText, READER, type ReaderStep } from "../../../domain/reader";
import { LANGUAGE_TRAILS, type LanguageTrailColors } from "../../../domain/languageTrailThemes";
import { stableHash } from "../../../domain/lessonPlan";
import { useFeedbackEffects } from "../../../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../../providers/MobileProgressProvider";
import { usePalette } from "../../../providers/ThemeProvider";
import { loadReaderProgress, saveReaderResult } from "../../../services/readerProgress";
import { speak, stopSpeaking } from "../../../services/speech";
import { addWordCard } from "../../../services/studyLibrary";

/** Sessão de leitura de um texto original. */
export default function ReaderSession() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lang: string; id: string }>();
  const lang: ReaderLanguage = params.lang === "hbo" ? "hbo" : "grc";
  const passages = READER[lang];
  const passage = passages.find((item) => item.id === params.id) ?? passages[0];
  const theme = LANGUAGE_TRAILS[lang === "grc" ? "greek" : "hebrew"];
  const palette = usePalette();
  const c = palette.isDark ? theme.dark : theme.light;
  const styles = useMemo(() => makeStyles(c), [c]);
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const steps = useMemo(() => buildReaderSession(lang, passage, `${passage.id}:${Date.now()}`), [lang, passage]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState<"ok" | "review">();
  const [nextId, setNextId] = useState<string>();
  useEffect(() => () => stopSpeaking(), []);

  const step = steps[index];
  const advance = () => { playFeedback("select"); setIndex((value) => Math.min(value + 1, steps.length - 1)); };
  const finish = async (solo: "ok" | "review") => {
    playFeedback("complete");
    setFinished(solo);
    const done = await saveReaderResult(lang, passage.id, { doneAt: new Date().toISOString(), solo, mistakes });
    setNextId(nextPassage(passages, done)?.id);
  };
  const listen = () => void speak(passageText(passage).replace(/ · /g, ", "), lang, passage.words.map((word) => word.translit).join(" "), 0.7);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar leitura" onPress={() => router.back()} hitSlop={10} style={styles.round}>
          <Icon name="close" size={20} color={c.muted} />
        </Pressable>
        <View style={styles.bar}><View style={[styles.fill, { width: `${((finished ? steps.length : index) / steps.length) * 100}%` }]} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Ouvir o texto" onPress={listen} hitSlop={10} style={styles.round}>
          <Icon name="volume" size={20} color={c.accent} />
        </Pressable>
      </View>

      {finished ? (
        <ScrollView contentContainerStyle={[styles.content, styles.center, { paddingBottom: insets.bottom + 30 }]}>
          <LumiCharacter mood="achievement" motion="celebrating" style={styles.doneLumi} accessibilityLabel="Lumi comemorando" />
          <Text style={styles.doneTitle}>{finished === "ok" ? "Você leu o original!" : "Leitura concluída"}</Text>
          <Text style={styles.mutedCenter}>{finished === "ok" ? "Releia em voz alta amanhã para fixar." : "Ela fica marcada para rever. Repetir é o caminho da fluência."}</Text>
          <View style={styles.solo}><Text style={[styles.soloText, lang === "hbo" && styles.rtl]}>{passageText(passage)}</Text></View>
          <Text style={styles.translation}>{passage.translation}</Text>
          {nextId ? (
            <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: "/reader/[lang]/[id]", params: { lang, id: nextId } })} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
              <Text style={styles.ctaText}>Próxima leitura</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondary}><Text style={styles.secondaryText}>Voltar ao leitor</Text></Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
          <StepView key={index} step={step} passage={passage} lang={lang} c={c} styles={styles} onListen={listen}
            onMistake={() => { setMistakes((value) => value + 1); playFeedback("wrong"); }}
            onCorrect={() => playFeedback("correct")}
            onNext={advance} onFinish={(solo) => void finish(solo)} />
        </ScrollView>
      )}
    </View>
  );
}

type Styles = ReturnType<typeof makeStyles>;

/** Explicação em português com trechos em hebraico: força o parágrafo da esquerda para a direita (Android). */
const ltr = (text: string) => `\u200E${text}`;

function StepView({ step, passage, lang, c, styles, onListen, onMistake, onCorrect, onNext, onFinish }: {
  step: ReaderStep; passage: ReaderPassage; lang: ReaderLanguage; c: LanguageTrailColors; styles: Styles;
  onListen: () => void; onMistake: () => void; onCorrect: () => void; onNext: () => void; onFinish: (solo: "ok" | "review") => void;
}) {
  const rtl = lang === "hbo";
  if (step.kind === "read") {
    return (
      <>
        <Text style={styles.eyebrow}>{passage.ref ? `LEIA COM APOIO · ${passage.ref.toUpperCase()}` : "LEIA COM APOIO"}</Text>
        <Text style={styles.title}>{passage.title}</Text>
        <View style={styles.focus}><Icon name="bulb" size={18} color={c.accent} /><Text style={styles.focusText}>{ltr(passage.focus)}</Text></View>
        <Interlinear passage={passage} lang={lang} styles={styles} c={c} />
        <Text style={styles.hint}>Toque numa palavra para ver a explicação e salvá-la para memorizar.</Text>
        <Pressable accessibilityRole="button" onPress={onListen} style={styles.listen}><Icon name="volume" size={18} color={c.accent} /><Text style={styles.listenText}>Ouvir devagar</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onNext} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}><Text style={styles.ctaText}>Já li, vamos praticar</Text></Pressable>
      </>
    );
  }
  if (step.kind === "sound" || step.kind === "meaning") {
    return <ChoiceStep step={step} rtl={rtl} lang={lang} styles={styles} onMistake={onMistake} onCorrect={onCorrect} onNext={onNext} />;
  }
  if (step.kind === "order") return <OrderStep step={step} rtl={rtl} styles={styles} onMistake={onMistake} onCorrect={onCorrect} onNext={onNext} />;
  return <SoloStep passage={passage} lang={lang} styles={styles} c={c} onFinish={onFinish} />;
}

function Interlinear({ passage, lang, styles, c }: { passage: ReaderPassage; lang: ReaderLanguage; styles: Styles; c: LanguageTrailColors }) {
  const [selected, setSelected] = useState<number>();
  const [saved, setSaved] = useState<string[]>([]);
  const word = selected === undefined ? undefined : passage.words[selected];
  const save = async (item: ReaderWord) => {
    await addWordCard({ id: `reader-${lang}-${item.text}`, language: lang, lemma: item.text.replace(/־$/, ""), transliteration: item.translit, meaning: item.gloss, strong: "" });
    setSaved((list) => [...list, item.text]);
  };
  return (
    <>
      <View style={[styles.lines, lang === "hbo" && styles.linesRtl]}>
        {passage.words.map((item, i) => (
          <Pressable key={`${item.text}-${i}`} accessibilityRole="button" accessibilityLabel={`${item.translit}: ${item.gloss}`}
            onPress={() => { setSelected(i === selected ? undefined : i); void speak(item.text.replace(/־$/, ""), lang, item.translit, 0.7); }}
            style={[styles.cell, i === selected && styles.cellOn]}>
            <Text style={styles.cellWord} allowFontScaling={false}>{item.text}</Text>
            <Text style={styles.cellTranslit}>{item.translit}</Text>
            <Text style={styles.cellGloss}>{item.gloss}</Text>
          </Pressable>
        ))}
      </View>
      {word ? (
        <View style={styles.detail}>
          <View style={styles.detailHead}>
            <Text style={styles.detailWord}>{word.text}</Text>
            <View style={styles.flex}>
              <Text style={styles.detailTranslit}>{word.translit}</Text>
              <Text style={styles.detailGloss}>{word.gloss}</Text>
            </View>
          </View>
          {word.note ? <Text style={styles.detailNote}>{ltr(word.note)}</Text> : null}
          <Pressable accessibilityRole="button" disabled={saved.includes(word.text)} onPress={() => void save(word)} style={styles.save}>
            <Icon name={saved.includes(word.text) ? "check" : "memory"} size={16} color={c.accent} />
            <Text style={styles.saveText}>{saved.includes(word.text) ? "Salva em Memorizar" : "Salvar em Memorizar"}</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

function ChoiceStep({ step, rtl, lang, styles, onMistake, onCorrect, onNext }: {
  step: Extract<ReaderStep, { kind: "sound" | "meaning" }>; rtl: boolean; lang: ReaderLanguage; styles: Styles; onMistake: () => void; onCorrect: () => void; onNext: () => void;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const pick = (option: string) => {
    if (right) return;
    if (option === step.answer) {
      setRight(true); onCorrect();
      void speak(step.word.text.replace(/־$/, ""), lang, step.word.translit, 0.7);
    } else if (!wrong.includes(option)) { setWrong((list) => [...list, option]); onMistake(); }
  };
  return (
    <>
      <Text style={styles.eyebrow}>{step.kind === "sound" ? "COMO SE LÊ?" : "O QUE SIGNIFICA?"}</Text>
      <View style={styles.bigWordBox}>
        <Text style={[styles.bigWord, rtl && styles.rtl]} allowFontScaling={false}>{step.word.text}</Text>
        {step.kind === "meaning" ? <Text style={styles.bigTranslit}>{step.word.translit}</Text> : null}
      </View>
      <View style={styles.options}>
        {step.options.map((option) => {
          const isWrong = wrong.includes(option);
          const isRight = right && option === step.answer;
          return (
            <Pressable key={option} accessibilityRole="button" onPress={() => pick(option)}
              style={[styles.option, isWrong && styles.optionWrong, isRight && styles.optionRight]}>
              <Text style={[styles.optionText, isWrong && styles.optionTextWrong]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {right ? (
        <>
          {step.word.note ? <Text style={styles.feedback}>{ltr(`💡 ${step.word.note}`)}</Text> : null}
          <Pressable accessibilityRole="button" onPress={onNext} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}><Text style={styles.ctaText}>Continuar</Text></Pressable>
        </>
      ) : null}
    </>
  );
}

function OrderStep({ step, rtl, styles, onMistake, onCorrect, onNext }: {
  step: Extract<ReaderStep, { kind: "order" }>; rtl: boolean; styles: Styles; onMistake: () => void; onCorrect: () => void; onNext: () => void;
}) {
  const order = useMemo(() => step.words.map((_, i) => i).sort((a, b) => stableHash(`o${a}${step.translation}`) - stableHash(`o${b}${step.translation}`)), [step]);
  const [placed, setPlaced] = useState<number[]>([]);
  const shake = useRef(new Animated.Value(0)).current;
  const complete = placed.length === step.words.length;
  const tap = (i: number) => {
    if (complete || placed.includes(i)) return;
    // Aceita palavras repetidas (ex.: “καί”) em qualquer posição equivalente.
    const expected = step.words[placed.length].text;
    if (step.words[i].text === expected) {
      const next = [...placed, i];
      setPlaced(next);
      if (next.length === step.words.length) onCorrect();
    } else {
      onMistake();
      Animated.sequence([-8, 8, -6, 6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 50, useNativeDriver: true }))).start();
    }
  };
  return (
    <>
      <Text style={styles.eyebrow}>MONTE O TEXTO ORIGINAL</Text>
      <Text style={styles.prompt}>“{step.translation}”</Text>
      <Animated.View style={[styles.answerLine, rtl && styles.linesRtl, { transform: [{ translateX: shake }] }]}>
        {placed.length ? placed.map((i, n) => <Text key={n} style={styles.placedWord}>{step.words[i].text}</Text>) : <Text style={styles.hint}>Toque nas palavras na ordem de leitura{rtl ? " (da direita para a esquerda)" : ""}.</Text>}
      </Animated.View>
      <View style={[styles.lines, rtl && styles.linesRtl]}>
        {order.map((i) => (
          <Pressable key={i} accessibilityRole="button" disabled={placed.includes(i)} onPress={() => tap(i)} style={[styles.chip, placed.includes(i) && styles.chipUsed]}>
            <Text style={styles.chipText}>{step.words[i].text}</Text>
          </Pressable>
        ))}
      </View>
      {complete ? <Pressable accessibilityRole="button" onPress={onNext} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}><Text style={styles.ctaText}>Continuar</Text></Pressable> : null}
    </>
  );
}

function SoloStep({ passage, lang, styles, c, onFinish }: { passage: ReaderPassage; lang: ReaderLanguage; styles: Styles; c: LanguageTrailColors; onFinish: (solo: "ok" | "review") => void }) {
  const [help, setHelp] = useState(false);
  const [revealed, setRevealed] = useState(false);
  return (
    <>
      <Text style={styles.eyebrow}>AGORA, LEIA SOZINHO</Text>
      <Text style={styles.title}>Leia em voz alta, sem ajuda</Text>
      <View style={styles.solo}><Text style={[styles.soloText, lang === "hbo" && styles.rtl]}>{passageText(passage)}</Text></View>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: help }} onPress={() => setHelp(!help)} style={styles.listen}>
        <Icon name={help ? "check" : "bulb"} size={18} color={c.accent} /><Text style={styles.listenText}>{help ? "Esconder ajuda" : "Preciso de ajuda"}</Text>
      </Pressable>
      {help ? <Interlinear passage={passage} lang={lang} styles={styles} c={c} /> : null}
      {revealed ? (
        <>
          <Text style={styles.translation}>{passage.translation}</Text>
          <Text style={styles.mutedCenter}>Você entendeu o texto sozinho?</Text>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" onPress={() => onFinish("review")} style={[styles.secondary, styles.flex]}><Text style={styles.secondaryText}>Preciso rever</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => onFinish(help ? "review" : "ok")} style={({ pressed }) => [styles.cta, styles.flex, pressed && styles.pressed]}><Text style={styles.ctaText}>Entendi!</Text></Pressable>
          </View>
        </>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => setRevealed(true)} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}><Text style={styles.ctaText}>Ver a tradução</Text></Pressable>
      )}
    </>
  );
}

const makeStyles = (c: LanguageTrailColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.ground },
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  bar: { flex: 1, height: 12, borderRadius: 6, backgroundColor: c.line, overflow: "hidden" },
  fill: { height: 12, borderRadius: 6, backgroundColor: c.done },
  content: { padding: 16, gap: 14 },
  center: { alignItems: "center" },
  pressed: { opacity: 0.88, transform: [{ translateY: 2 }] },
  eyebrow: { color: c.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: c.text, fontSize: 22, fontWeight: "900", marginTop: -6 },
  focus: { flexDirection: "row", gap: 8, alignItems: "flex-start", padding: 12, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.ornament + "66" },
  focusText: { flex: 1, color: c.text, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  lines: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  linesRtl: { flexDirection: "row-reverse" },
  cell: { alignItems: "center", minWidth: 64, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.line },
  cellOn: { borderColor: c.accent, backgroundColor: c.accent + "18" },
  cellWord: { color: c.text, fontSize: 26, fontWeight: "600" },
  cellTranslit: { color: c.accent, fontSize: 12, fontWeight: "800", marginTop: 2 },
  cellGloss: { color: c.muted, fontSize: 12, fontWeight: "600", maxWidth: 120, textAlign: "center" },
  hint: { color: c.muted, fontSize: 13, lineHeight: 19 },
  detail: { gap: 8, padding: 14, borderRadius: 18, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.accent },
  detailHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailWord: { color: c.text, fontSize: 34, fontWeight: "600" },
  detailTranslit: { color: c.accent, fontSize: 15, fontWeight: "900" },
  detailGloss: { color: c.text, fontSize: 16, fontWeight: "800" },
  detailNote: { color: c.muted, fontSize: 14, lineHeight: 20 },
  save: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 6 },
  saveText: { color: c.accent, fontSize: 14, fontWeight: "900" },
  listen: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 46, borderRadius: 14, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.card },
  listenText: { color: c.accent, fontSize: 15, fontWeight: "900" },
  cta: { alignItems: "center", justifyContent: "center", minHeight: 54, paddingHorizontal: 16, borderRadius: 16, backgroundColor: c.cta, borderBottomWidth: 4, borderBottomColor: c.ctaShadow, alignSelf: "stretch" },
  ctaText: { color: c.ctaText, fontSize: 17, fontWeight: "900" },
  secondary: { alignItems: "center", justifyContent: "center", minHeight: 54, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.card, alignSelf: "stretch" },
  secondaryText: { color: c.text, fontSize: 16, fontWeight: "900" },
  bigWordBox: { alignItems: "center", gap: 4, paddingVertical: 26, borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  bigWord: { color: c.text, fontSize: 52, fontWeight: "600" },
  bigTranslit: { color: c.accent, fontSize: 16, fontWeight: "800" },
  rtl: { writingDirection: "rtl" },
  options: { gap: 10 },
  option: { minHeight: 54, justifyContent: "center", paddingHorizontal: 16, borderRadius: 16, backgroundColor: c.card, borderWidth: 2, borderColor: c.line, borderBottomWidth: 4 },
  optionWrong: { borderColor: "#e5484d", opacity: 0.6 },
  optionRight: { borderColor: c.done, backgroundColor: c.done + "22" },
  optionText: { color: c.text, fontSize: 17, fontWeight: "800" },
  optionTextWrong: { textDecorationLine: "line-through" },
  feedback: { color: c.text, fontSize: 14, lineHeight: 20, padding: 12, borderRadius: 14, backgroundColor: c.card },
  prompt: { color: c.text, fontSize: 18, lineHeight: 26, fontWeight: "700", fontStyle: "italic" },
  answerLine: { flexDirection: "row", flexWrap: "wrap", gap: 8, minHeight: 66, padding: 12, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: c.line, alignItems: "center" },
  placedWord: { color: c.text, fontSize: 24, fontWeight: "600" },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.line, borderBottomWidth: 4 },
  chipUsed: { opacity: 0.25 },
  chipText: { color: c.text, fontSize: 24, fontWeight: "600" },
  solo: { alignSelf: "stretch", padding: 18, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.ornament + "66" },
  soloText: { color: c.text, fontSize: 28, lineHeight: 44, fontWeight: "500", textAlign: "center" },
  translation: { color: c.text, fontSize: 16, lineHeight: 24, fontStyle: "italic", textAlign: "center" },
  mutedCenter: { color: c.muted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  doneLumi: { width: 140, height: 132 },
  doneTitle: { color: c.text, fontSize: 26, fontWeight: "900", textAlign: "center" }
});
