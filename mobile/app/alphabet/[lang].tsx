import { useCallback, useEffect, useMemo, useState } from "react";
import { GrowBar } from "../../components/motion";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon } from "../../components/navigation/Icons";
import { TracingPad } from "../../components/TracingPad";
import { ALPHABETS, type AlphabetId, type Letter } from "../../content/alphabet";
import { applyAnswer, buildAlphabetSession, groupMastery, masteryOf, MASTERY_GOAL, suggestedGroup, type AlphabetProgress, type AlphabetQuestion } from "../../domain/alphabetPractice";
import { LANGUAGE_TRAILS, type LanguageTrailColors } from "../../domain/languageTrailThemes";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette } from "../../providers/ThemeProvider";
import { loadAlphabetProgress, markLetterTraced, saveAlphabetMastery } from "../../services/alphabetProgress";
import { speak, stopSpeaking } from "../../services/speech";

/** Alfabeto interativo: conhecer cada letra, ouvir, traçar e treinar por grupos. */
export default function AlphabetScreen() {
  useLightStatusBar();
  const router = useRouter();
  const params = useLocalSearchParams<{ lang: string }>();
  const id: AlphabetId = params.lang === "hbo" ? "hbo" : "grc";
  const alphabet = ALPHABETS[id];
  const theme = LANGUAGE_TRAILS[id === "grc" ? "greek" : "hebrew"];
  const palette = usePalette();
  const c = palette.isDark ? theme.dark : theme.light;
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [mastery, setMastery] = useState<AlphabetProgress>({});
  const [traced, setTraced] = useState<string[]>([]);
  const [letter, setLetter] = useState<Letter>();
  const [session, setSession] = useState<{ group: number; questions: AlphabetQuestion[] }>();
  const rtl = alphabet.direction === "rtl";
  const lang = id === "grc" ? "grc" : "hbo";

  useEffect(() => { void loadAlphabetProgress(id).then((data) => { setMastery(data.mastery); setTraced(data.traced); }); }, [id]);
  useEffect(() => () => stopSpeaking(), []);

  const learned = alphabet.letters.filter((item) => masteryOf(mastery, item.id) >= MASTERY_GOAL).length;
  const next = suggestedGroup(id, mastery);
  const tile = Math.floor((width - 32 - 5 * 8) / 6);
  const startGroup = (group: number) => setSession({ group, questions: buildAlphabetSession(id, group, mastery, `${Date.now()}`) });

  if (session) {
    return (
      <PracticeSession alphabetId={id} c={c} questions={session.questions} mastery={mastery}
        onExit={(updated) => { setMastery(updated); void saveAlphabetMastery(id, updated); setSession(undefined); }} />
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: alphabet.title, headerStyle: { backgroundColor: c.groundDeep }, headerTintColor: c.text, headerTitleStyle: { color: c.text, fontWeight: "900" } }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.hero}>
          <Text style={[styles.watermark, rtl && styles.watermarkLeft]} accessibilityElementsHidden>{theme.watermark}</Text>
          <LumiCharacter mood="explaining" motion="encouraging" style={styles.heroLumi} accessibilityLabel="Lumi" />
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{id === "grc" ? "GREGO KOINÉ" : "HEBRAICO BÍBLICO"}</Text>
            <Text style={styles.title}>{learned}/{alphabet.letters.length} letras dominadas</Text>
            <Text style={styles.muted}>{rtl ? "Lê-se da direita para a esquerda. " : ""}Toque numa letra para ouvir e traçar. Treine por grupos.</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => startGroup(next)} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Icon name="play" size={18} color={c.ctaText} />
          <Text style={styles.ctaText}>Treinar: {alphabet.groups[next].title}</Text>
        </Pressable>

        {alphabet.groups.map((group, index) => {
          const percent = Math.round(groupMastery(id, index, mastery) * 100);
          return (
            <View key={group.title} style={styles.group}>
              <View style={styles.groupHead}>
                <View style={styles.flex}>
                  <Text style={styles.groupTitle}>{index + 1}. {group.title}</Text>
                  <View style={styles.track}><GrowBar style={[styles.fill, { width: `${percent}%` }]} /></View>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Treinar ${group.title}`} onPress={() => startGroup(index)} style={styles.groupBtn}>
                  <Text style={styles.groupBtnText}>{percent >= 100 ? "Revisar" : "Treinar"}</Text>
                </Pressable>
              </View>
              <View style={[styles.tiles, rtl && { flexDirection: "row-reverse" }]}>
                {group.letters.map((letterId) => {
                  const item = alphabet.letters.find((l) => l.id === letterId)!;
                  const level = masteryOf(mastery, item.id);
                  return (
                    <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.name}, ${level >= MASTERY_GOAL ? "dominada" : `${level} de ${MASTERY_GOAL}`}`}
                      onPress={() => { setLetter(item); void speak(item.nativeName, lang, item.name); }}
                      style={({ pressed }) => [styles.tile, { width: tile, height: tile * 1.2 }, level >= MASTERY_GOAL && styles.tileDone, pressed && { opacity: 0.8 }]}>
                      <Text style={[styles.tileGlyph, { fontSize: tile * 0.5 }]} allowFontScaling={false}>{item.glyph}</Text>
                      <View style={styles.dots}>{Array.from({ length: MASTERY_GOAL }, (_, i) => <View key={i} style={[styles.dot, i < level && styles.dotOn]} />)}</View>
                      {traced.includes(item.id) ? <View style={styles.tracedBadge}><Icon name="edit" size={9} color="#ffffff" /></View> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text style={styles.footnote}>Pronúncia: a acadêmica usada nos seminários. O áudio usa a voz do aparelho (sotaque moderno), como apoio.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push(id === "grc" ? "/greek" : "/hebrew")} style={styles.link}><Text style={styles.linkText}>Ir para a trilha de {id === "grc" ? "grego" : "hebraico"}</Text></Pressable>
      </ScrollView>

      <LetterSheet letter={letter} alphabetId={id} c={c} traced={letter ? traced.includes(letter.id) : false}
        onClose={() => { stopSpeaking(); setLetter(undefined); }}
        onTraced={(letterId) => void markLetterTraced(id, letterId).then(setTraced)}
        onNext={() => {
          if (!letter) return;
          const i = alphabet.letters.findIndex((l) => l.id === letter.id);
          const nextLetter = alphabet.letters[(i + 1) % alphabet.letters.length];
          setLetter(nextLetter); void speak(nextLetter.nativeName, lang, nextLetter.name);
        }} />
    </View>
  );
}

function LetterSheet({ letter, alphabetId, c, traced, onClose, onTraced, onNext }: {
  letter?: Letter; alphabetId: AlphabetId; c: LanguageTrailColors; traced: boolean; onClose: () => void; onTraced: (id: string) => void; onNext: () => void;
}) {
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [celebrate, setCelebrate] = useState(false);
  const lang = alphabetId === "grc" ? "grc" : "hbo";
  useEffect(() => setCelebrate(false), [letter?.id]);
  const complete = useCallback(() => { if (letter) { setCelebrate(true); onTraced(letter.id); } }, [letter, onTraced]);
  if (!letter) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.flex} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <View style={styles.letterHead}>
              <Text style={styles.bigGlyph} allowFontScaling={false}>{letter.glyph}</Text>
              {letter.alt ? <View style={styles.altBox}><Text style={styles.altGlyph} allowFontScaling={false}>{letter.alt}</Text><Text style={styles.altLabel}>{alphabetId === "grc" ? "maiúscula" : "final"}</Text></View> : null}
              <View style={styles.flex}>
                <Text style={styles.letterName}>{letter.name}</Text>
                <Text style={styles.muted}>{letter.translit} · {letter.sound}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir ${letter.name}`} onPress={() => void speak(letter.nativeName, lang, letter.name)} style={styles.listenBig}><Icon name="volume" size={22} color={c.ctaText} /></Pressable>
            </View>
            {letter.note ? <View style={styles.noteBox}><Icon name="bulb" size={16} color={c.ornament} /><Text style={styles.noteText}>{letter.note}</Text></View> : null}

            <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir ${letter.example.word}`} onPress={() => void speak(letter.example.word, lang, letter.example.translit)} style={styles.example}>
              <Text style={styles.exampleWord}>{letter.example.word}</Text>
              <View style={styles.flex}>
                <Text style={styles.exampleMeaning}>{letter.example.translit} · “{letter.example.meaning}”</Text>
                <Text style={styles.exampleRef}>{letter.example.ref}</Text>
              </View>
              <Icon name="volume" size={18} color={c.accent} />
            </Pressable>

            <Text style={styles.sectionTitle}>{traced || celebrate ? "Muito bem! Trace de novo para fixar" : "Trace a letra com o dedo"}</Text>
            <TracingPad glyph={letter.glyph} size={Math.min(width - 80, 280)} ink={c.accent} guide={c.muted + "55"} background={c.card} onComplete={complete} />
            {celebrate ? <Text style={styles.celebrate}>✓ Traçado registrado</Text> : null}

            <Pressable accessibilityRole="button" onPress={onNext} style={styles.cta}><Text style={styles.ctaText}>Próxima letra</Text><Icon name="chevronRight" size={18} color={c.ctaText} /></Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PracticeSession({ alphabetId, c, questions, mastery, onExit }: { alphabetId: AlphabetId; c: LanguageTrailColors; questions: AlphabetQuestion[]; mastery: AlphabetProgress; onExit: (mastery: AlphabetProgress) => void }) {
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string>();
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(mastery);
  const question = questions[index];
  const lang = alphabetId === "grc" ? "grc" : "hbo";
  const say = (q: AlphabetQuestion) => void speak(q.letter.nativeName, lang, q.letter.name);

  useEffect(() => { if (question?.kind === "listen") say(question); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (optionId: string) => {
    if (picked || !question) return;
    const ok = optionId === question.answerId;
    setPicked(optionId);
    if (ok) setScore(score + 1);
    setCurrent(applyAnswer(current, question.letter.id, ok));
    playFeedback(ok ? "correct" : "wrong");
    if (question.kind !== "listen") say(question);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.sessionTop, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair do treino" onPress={() => onExit(current)} hitSlop={10}><Icon name="close" size={24} color={c.muted} /></Pressable>
        <View style={styles.track}><GrowBar style={[styles.fill, { width: `${(Math.min(index + (picked ? 1 : 0), questions.length) / questions.length) * 100}%` }]} /></View>
      </View>
      {!question ? (
        <View style={styles.doneWrap}>
          <LumiCharacter mood="proud" motion="celebrating" style={styles.doneLumi} accessibilityLabel="Lumi comemorando" />
          <Text style={styles.titleCenter}>{score} de {questions.length} certas!</Text>
          <Text style={styles.mutedCenter}>{score === questions.length ? "Perfeito! As letras estão ficando suas." : "Cada treino deixa as letras mais familiares."}</Text>
          <Pressable accessibilityRole="button" onPress={() => onExit(current)} style={styles.cta}><Text style={styles.ctaText}>Voltar ao alfabeto</Text></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.sessionBody}>
          <Text style={styles.prompt}>{question.prompt}</Text>
          {question.kind === "listen" ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Ouvir de novo" onPress={() => say(question)} style={styles.listenHero}><Icon name="volume" size={44} color={c.ctaText} /></Pressable>
          ) : (
            <View style={styles.shownBox}><Text style={[styles.shown, question.kind === "letter" && styles.shownText]} allowFontScaling={false}>{question.shown}</Text></View>
          )}
          <View style={styles.options}>
            {question.options.map((option) => {
              const state = !picked ? "idle" : option.id === question.answerId ? "right" : option.id === picked ? "wrong" : "dim";
              return (
                <Pressable key={option.id} accessibilityRole="button" disabled={Boolean(picked)} onPress={() => choose(option.id)}
                  style={[option.glyph ? styles.optionGlyph : styles.optionText, state === "right" && styles.right, state === "wrong" && styles.wrong, state === "dim" && { opacity: 0.4 }]}>
                  <Text style={option.glyph ? styles.optionGlyphText : styles.optionLabel} allowFontScaling={!option.glyph}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {picked ? (
            <View style={styles.feedback}>
              <View style={styles.feedbackRow}>
                {/* A letra fica separada do texto: misturar hebraico e português na mesma linha embaralha a ordem. */}
                <Text style={styles.feedbackGlyph} allowFontScaling={false}>{question.letter.glyph}</Text>
                <View style={styles.flex}>
                  <Text style={styles.feedbackName}>{question.letter.name} · {question.letter.translit}</Text>
                  <Text style={styles.feedbackText}>{question.letter.sound}</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" onPress={() => { setPicked(undefined); setIndex(index + 1); }} style={styles.cta}><Text style={styles.ctaText}>Continuar</Text></Pressable>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: LanguageTrailColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.ground },
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  hero: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, overflow: "hidden" },
  watermark: { position: "absolute", right: 8, top: -30, fontSize: 120, fontWeight: "900", color: c.ornament, opacity: 0.1 },
  watermarkLeft: { right: undefined, left: 8 },
  heroLumi: { width: 80, height: 76 },
  eyebrow: { color: c.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: c.text, fontSize: 20, fontWeight: "900" },
  titleCenter: { color: c.text, fontSize: 24, fontWeight: "900", textAlign: "center" },
  muted: { color: c.muted, fontSize: 13, lineHeight: 19 },
  mutedCenter: { color: c.muted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  cta: { flexDirection: "row", gap: 8, minHeight: 54, alignSelf: "stretch", borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: c.cta, borderBottomWidth: 5, borderBottomColor: c.ctaShadow, paddingHorizontal: 18 },
  ctaText: { color: c.ctaText, fontSize: 16, fontWeight: "900" },
  group: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  groupHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  groupTitle: { color: c.text, fontSize: 16, fontWeight: "900", marginBottom: 6 },
  groupBtn: { paddingHorizontal: 14, minHeight: 36, justifyContent: "center", borderRadius: 12, borderWidth: 1.5, borderColor: c.line },
  groupBtnText: { color: c.accent, fontSize: 13, fontWeight: "900" },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: c.path, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: c.pathDone },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: c.line, backgroundColor: c.groundDeep },
  tileDone: { borderColor: c.done, backgroundColor: c.done + "22" },
  tileGlyph: { color: c.text, fontWeight: "500" },
  dots: { flexDirection: "row", gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.line },
  dotOn: { backgroundColor: c.done },
  tracedBadge: { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: c.node },
  footnote: { color: c.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  link: { alignItems: "center", padding: 8 },
  linkText: { color: c.accent, fontSize: 14, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(4,10,20,0.6)" },
  sheet: { maxHeight: "92%", borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: c.ground, borderTopWidth: 1, borderColor: c.line },
  handle: { alignSelf: "center", width: 46, height: 5, borderRadius: 3, backgroundColor: c.line, marginTop: 10 },
  sheetContent: { padding: 20, gap: 14 },
  letterHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  bigGlyph: { color: c.text, fontSize: 72, fontWeight: "500", minWidth: 64, textAlign: "center" },
  altBox: { alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  altGlyph: { color: c.text, fontSize: 32, fontWeight: "500" },
  altLabel: { color: c.muted, fontSize: 10, fontWeight: "800" },
  letterName: { color: c.text, fontSize: 24, fontWeight: "900" },
  listenBig: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: c.cta },
  noteBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  noteText: { flex: 1, color: c.text, fontSize: 14, lineHeight: 20 },
  example: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.line },
  exampleWord: { color: c.text, fontSize: 28, fontWeight: "700" },
  exampleMeaning: { color: c.text, fontSize: 14, fontWeight: "800" },
  exampleRef: { color: c.accent, fontSize: 12, fontWeight: "800", marginTop: 2 },
  sectionTitle: { color: c.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  celebrate: { color: c.done, fontSize: 14, fontWeight: "900", textAlign: "center" },
  sessionTop: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  sessionBody: { padding: 18, gap: 16 },
  prompt: { color: c.text, fontSize: 22, fontWeight: "900" },
  listenHero: { alignSelf: "center", width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", backgroundColor: c.cta, borderBottomWidth: 6, borderBottomColor: c.ctaShadow },
  shownBox: { alignItems: "center", justifyContent: "center", minHeight: 150, borderRadius: 24, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  shown: { color: c.text, fontSize: 96, fontWeight: "500" },
  shownText: { fontSize: 40, fontWeight: "900" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionGlyph: { width: "47%", flexGrow: 1, minHeight: 92, alignItems: "center", justifyContent: "center", borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, borderColor: c.line, backgroundColor: c.card },
  optionGlyphText: { color: c.text, fontSize: 48, fontWeight: "500" },
  optionText: { width: "100%", minHeight: 56, justifyContent: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: c.line, backgroundColor: c.card },
  optionLabel: { color: c.text, fontSize: 16, fontWeight: "800" },
  right: { borderColor: "#4caf6a", backgroundColor: "#4caf6a26" },
  wrong: { borderColor: "#e5739a", backgroundColor: "#e5739a26" },
  feedback: { gap: 12, padding: 14, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  feedbackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  feedbackName: { color: c.text, fontSize: 16, fontWeight: "900", writingDirection: "ltr" },
  feedbackText: { color: c.muted, fontSize: 14, fontWeight: "700", lineHeight: 20, writingDirection: "ltr" },
  feedbackGlyph: { color: c.text, fontSize: 40, fontWeight: "600", minWidth: 44, textAlign: "center" },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  doneLumi: { width: 150, height: 140 }
});
