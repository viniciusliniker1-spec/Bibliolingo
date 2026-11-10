import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bibleBookByOsis } from "../../../src/content/bible/catalog";
import { bibleAnnotationId } from "../../../src/domain/bibleReference";
import { toLocalDateKey } from "../../../src/domain/streak";
import { BIBLE_TRANSLATION } from "../../../src/services/bible";
import { LumiCharacter } from "../../components/LumiCharacter";
import { LumiAnimated } from "../../components/LumiAnimated";
import { Icon, type IconName } from "../../components/navigation/Icons";
import {
  dueLabel, firstLetters, gapIndexes, initialMatches, LADDER, ladderForBox, meaningOptions, nextBox, shuffledChunks,
  SPARE_MEANINGS, SUGGESTED_VERSES, tokenize, verseChunks, wordBank, 
} from "../../domain/verseMemory";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { loadCachedBibleBook } from "../../services/bibleStorage";
import { speak, stopSpeaking } from "../../services/speech";
import {
  addVerseMemoryCard, loadMemoryCards, loadWordCards, removeMemoryCard, removeWordCard, reviewWordCard, setMemoryCardLevel,
  type VerseMemoryCard, type WordMemoryCard
} from "../../services/studyLibrary";
import type { Palette } from "../../theme/tokens";

const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
type Tab = "verses" | "words";

export default function MemoryScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [tab, setTab] = useState<Tab>("verses");
  const [cards, setCards] = useState<VerseMemoryCard[]>([]);
  const [words, setWords] = useState<WordMemoryCard[]>([]);
  const [training, setTraining] = useState<VerseMemoryCard[]>();
  const [wordSession, setWordSession] = useState<WordMemoryCard[]>();
  const [adding, setAdding] = useState<string>();
  const [howOpen, setHowOpen] = useState(false);
  const today = toLocalDateKey(new Date());

  const reload = useCallback(() => { void loadMemoryCards().then(setCards); void loadWordCards().then(setWords); }, []);
  useFocusEffect(reload);
  useEffect(() => () => stopSpeaking(), []);
  const due = useMemo(() => cards.filter((card) => card.dueDate <= today), [cards, today]);
  const dueWords = useMemo(() => words.filter((card) => card.dueDate <= today), [words, today]);
  const saved = useMemo(() => new Set(cards.map((card) => card.id)), [cards]);

  const addSuggested = async (item: (typeof SUGGESTED_VERSES)[number], trainNow: boolean) => {
    const book = bibleBookByOsis.get(item.osis);
    if (!book) return;
    setAdding(item.label);
    try {
      const data = await loadCachedBibleBook(book);
      const text = data.chapters.find((chapter) => chapter.chapter === item.chapter)?.verses.find((verse) => verse.number === item.verse)?.text;
      if (!text) return;
      const card = await addVerseMemoryCard({ id: bibleAnnotationId(BIBLE_TRANSLATION.id, item.osis, item.chapter, item.verse), reference: item.label, text });
      reload();
      if (trainNow) setTraining([card]);
    } finally {
      setAdding(undefined);
    }
  };

  if (training) return <VerseTrainer queue={training} onExit={() => { setTraining(undefined); reload(); }} />;
  if (wordSession) return <WordTrainer queue={wordSession} pool={words} onExit={() => { setWordSession(undefined); reload(); }} />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Memorizar", headerShown: true }} />
      <View style={styles.tabs}>
        {([["verses", "Versículos", cards.length], ["words", "Palavras originais", words.length]] as const).map(([id, label, count]) => (
          <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: tab === id }} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActive]}>
            <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}{count ? ` · ${count}` : ""}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {tab === "verses" ? (
          <>
            {/* Como funciona */}
            {cards.length < 2 || howOpen ? (
              <View style={styles.how}>
                <View style={styles.howHead}>
                  <LumiCharacter mood="explaining" motion="encouraging" style={styles.howLumi} accessibilityLabel="Lumi" />
                  <View style={styles.flex}>
                    <Text style={styles.eyebrow}>COMO FUNCIONA</Text>
                    <Text style={styles.title}>Guarde um versículo em 2 minutos</Text>
                  </View>
                </View>
                <HowStep n={1} icon="star" text="Escolha um versículo (abaixo ou tocando num versículo na aba Bíblia)." />
                <HowStep n={2} icon="trail" text="Treine em 5 degraus: ouvir, completar, montar, iniciais e digitar de memória." />
                <HowStep n={3} icon="bell" text="A Lumi traz o versículo de volta no dia certo. A cada acerto, o intervalo cresce: 1, 3, 7, 14, 30 dias." />
                {cards.length >= 2 ? <Pressable onPress={() => setHowOpen(false)}><Text style={styles.link}>Entendi</Text></Pressable> : null}
              </View>
            ) : (
              <Pressable onPress={() => setHowOpen(true)} style={styles.howLink}><Icon name="bulb" size={16} color={palette.accent} /><Text style={styles.link}>Como funciona?</Text></Pressable>
            )}

            {due.length ? (
              <Pressable accessibilityRole="button" onPress={() => setTraining(due.slice(0, 5))} style={({ pressed }) => [styles.dueCard, pressed && styles.pressed]}>
                <View style={styles.flex}>
                  <Text style={styles.eyebrow}>REVISÃO DE HOJE</Text>
                  <Text style={styles.title}>{due.length} {due.length === 1 ? "versículo" : "versículos"} para revisar</Text>
                  <Text style={styles.muted}>Os degraus que você já domina são pulados.</Text>
                </View>
                <View style={styles.playBig}><Icon name="play" size={22} color={palette.ctaText} /></View>
              </Pressable>
            ) : null}

            <Text style={styles.section}>Escolha um versículo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
              {SUGGESTED_VERSES.filter((item) => !saved.has(bibleAnnotationId(BIBLE_TRANSLATION.id, item.osis, item.chapter, item.verse))).map((item) => (
                <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Treinar ${item.label}`} disabled={Boolean(adding)} onPress={() => void addSuggested(item, true)} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
                  <Icon name={adding === item.label ? "refresh" : "plus"} size={16} color={palette.accent} />
                  <Text style={styles.suggestionText}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {cards.length ? <Text style={styles.section}>Meus versículos</Text> : null}
            {cards.map((card) => (
              <View key={card.id} style={styles.verseCard}>
                <View style={styles.verseHead}>
                  <Text style={styles.cardTitle}>{card.reference}</Text>
                  <Text style={[styles.badge, card.dueDate <= today && styles.badgeDue]}>{card.box >= 5 ? "Dominado" : dueLabel(card.dueDate, today)}</Text>
                </View>
                <Text style={styles.muted} numberOfLines={2}>{card.text}</Text>
                <View style={styles.ladderRow} accessible accessibilityLabel={`Nível ${Math.min(5, card.box)} de 5`}>
                  {[1, 2, 3, 4, 5].map((level) => <View key={level} style={[styles.rung, level <= card.box && styles.rungOn]} />)}
                  <Text style={styles.levelText}>Nível {Math.min(5, card.box)}/5</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable accessibilityRole="button" onPress={() => setTraining([card])} style={({ pressed }) => [styles.train, pressed && styles.pressed]}>
                    <Icon name="play" size={14} color={palette.ctaText} /><Text style={styles.trainText}>Treinar</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir ${card.reference}`} onPress={() => void speak(card.text, "pt")} style={styles.iconAction}><Icon name="volume" size={18} color={palette.accent} /></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${card.reference}`} onPress={() => void removeMemoryCard(card.id).then(reload)} style={styles.iconAction}><Icon name="close" size={16} color={palette.textMuted} /></Pressable>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.how}>
              <Text style={styles.eyebrow}>VOCABULÁRIO DO GREGO E DO HEBRAICO</Text>
              <Text style={styles.title}>{words.length ? `${dueWords.length} ${dueWords.length === 1 ? "palavra" : "palavras"} para hoje` : "Monte seu vocabulário"}</Text>
              <Text style={styles.muted}>Nos léxicos, toque em “Praticar” numa palavra. Aqui você ouve, lembra o sentido e escolhe a resposta certa.</Text>
              <View style={styles.cardActions}>
                {dueWords.length ? (
                  <Pressable accessibilityRole="button" onPress={() => setWordSession(dueWords.slice(0, 12))} style={styles.train}><Icon name="play" size={14} color={palette.ctaText} /><Text style={styles.trainText}>Praticar {Math.min(12, dueWords.length)}</Text></Pressable>
                ) : null}
                <Pressable accessibilityRole="button" onPress={() => router.push("/greek/dictionary")} style={styles.secondaryBtn}><Text style={styles.secondaryText}>Léxico grego</Text></Pressable>
                <Pressable accessibilityRole="button" onPress={() => router.push("/hebrew/dictionary")} style={styles.secondaryBtn}><Text style={styles.secondaryText}>Léxico hebraico</Text></Pressable>
              </View>
            </View>
            {words.map((word) => (
              <View key={word.id} style={styles.wordRow}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir ${word.lemma}`} onPress={() => void speak(word.lemma, word.language, word.transliteration)} style={styles.iconAction}><Icon name="volume" size={18} color={palette.accent} /></Pressable>
                <View style={styles.flex}>
                  <Text style={styles.wordLemma}>{word.lemma}</Text>
                  <Text style={styles.muted} numberOfLines={1}>{word.transliteration} · {word.meaning}</Text>
                </View>
                <View style={styles.wordLevel}>{[1, 2, 3, 4, 5].map((level) => <View key={level} style={[styles.rungSmall, level <= word.box && styles.rungOn]} />)}</View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${word.lemma}`} onPress={() => void removeWordCard(word.id).then(reload)} hitSlop={8}><Icon name="close" size={16} color={palette.textMuted} /></Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function HowStep({ n, icon, text }: { n: number; icon: IconName; text: string }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  return (
    <View style={styles.howStep}>
      <View style={styles.howNum}><Text style={styles.howNumText}>{n}</Text></View>
      <Icon name={icon} size={16} color={palette.accent} />
      <Text style={styles.howText}>{text}</Text>
    </View>
  );
}

// ======================= Treino de versículos =======================

function VerseTrainer({ queue, onExit }: { queue: VerseMemoryCard[]; onExit: () => void }) {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [cardIndex, setCardIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<{ box: number; mistakes: number }>();
  const card = queue[cardIndex];
  const steps = useMemo(() => (card ? ladderForBox(card.box) : []), [card]);
  const step = steps[stepIndex];
  const meta = LADDER.find((item) => item.step === step);
  const words = useMemo(() => (card ? tokenize(card.text).filter((token) => token.word).length : 0), [card]);

  useEffect(() => { playFeedback("start"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => { playFeedback("correct"); setStepIndex((value) => value + 1); };
  const finishTyping = async (mistakes: number) => {
    const box = nextBox(card.box, mistakes, words);
    await setMemoryCardLevel(card.id, box);
    playFeedback(box > card.box ? "complete" : "wrong");
    setResult({ box, mistakes });
  };
  const nextCard = () => { setResult(undefined); setStepIndex(0); setCardIndex((value) => value + 1); };

  if (!card) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LumiAnimated animation="joinha" style={styles.doneLumi} />
        <Text style={styles.titleCenter}>Treino concluído!</Text>
        <Text style={styles.mutedCenter}>“Escondi a tua palavra no meu coração” (Sl 119:11).</Text>
        <Pressable accessibilityRole="button" onPress={onExit} style={styles.primary}><Text style={styles.primaryText}>Voltar</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.trainerTop, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair do treino" onPress={() => { stopSpeaking(); onExit(); }} hitSlop={10}><Icon name="close" size={24} color={palette.textMuted} /></Pressable>
        <View style={styles.flex}>
          <Text style={styles.trainerRef}>{card.reference}{queue.length > 1 ? ` · ${cardIndex + 1}/${queue.length}` : ""}</Text>
          {/* Escada: cada degrau acende quando é vencido */}
          <View style={styles.steps}>
            {steps.map((item, i) => (
              <View key={item} style={styles.stepItem}>
                <View style={[styles.stepDot, i < stepIndex || result ? styles.stepDone : i === stepIndex ? styles.stepNow : null]}>
                  {i < stepIndex || result ? <Icon name="check" size={11} color="#ffffff" strokeWidth={3.4} /> : <Text style={styles.stepNum}>{i + 1}</Text>}
                </View>
                <Text style={[styles.stepLabel, i === stepIndex && !result && styles.stepLabelNow]}>{LADDER.find((l) => l.step === item)?.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {result ? (
        <ScrollView contentContainerStyle={[styles.trainerBody, styles.centerBody]}>
          <LumiCharacter mood={result.box > card.box ? "proud" : "encouragement"} motion={result.box > card.box ? "celebrating" : "encouraging"} style={styles.doneLumi} accessibilityLabel="Lumi" />
          <Text style={styles.titleCenter}>{result.mistakes === 0 ? "De cor e sem erros!" : result.box > card.box ? "Muito bem!" : "Quase lá!"}</Text>
          <Text style={styles.mutedCenter}>{result.mistakes ? `${result.mistakes} ${result.mistakes === 1 ? "inicial errada" : "iniciais erradas"}. ` : ""}Nível {Math.min(5, result.box)} de 5 · próxima revisão {INTERVAL_DAYS[result.box] === 0 ? "hoje mesmo" : INTERVAL_DAYS[result.box] === 1 ? "amanhã" : `em ${INTERVAL_DAYS[result.box]} dias`}.</Text>
          <View style={styles.fullVerse}><Text style={styles.verseText}>{card.text}</Text></View>
          <Pressable accessibilityRole="button" onPress={nextCard} style={styles.primary}><Text style={styles.primaryText}>{cardIndex + 1 < queue.length ? "Próximo versículo" : "Concluir"}</Text></Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.trainerBody, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepTitle}>{meta?.title}</Text>
          <Text style={styles.muted}>{meta?.hint}</Text>
          {step === "listen" ? <ListenStep card={card} onNext={advance} /> : null}
          {step === "gaps" ? <GapsStep key={card.id} card={card} onNext={advance} /> : null}
          {step === "order" ? <OrderStep key={card.id} card={card} onNext={advance} /> : null}
          {step === "letters" ? <LettersStep card={card} onNext={advance} /> : null}
          {step === "type" ? <TypeStep key={card.id} card={card} onDone={(mistakes) => void finishTyping(mistakes)} /> : null}
        </ScrollView>
      )}
    </View>
  );
}

function ListenStep({ card, onNext }: { card: VerseMemoryCard; onNext: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [listened, setListened] = useState(false);
  const play = (rate: number) => { setListened(true); void speak(card.text, "pt", undefined, rate); };
  return (
    <View style={styles.exercise}>
      <View style={styles.fullVerse}><Text style={styles.verseTextBig}>{card.text}</Text></View>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={() => play(0.9)} style={[styles.secondaryWide, styles.flex]}><Icon name="volume" size={18} color={palette.accent} /><Text style={styles.secondaryText}>Ouvir</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => play(0.6)} style={[styles.secondaryWide, styles.flex]}><Icon name="volume" size={18} color={palette.accent} /><Text style={styles.secondaryText}>Devagar</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => { stopSpeaking(); onNext(); }} style={styles.primary}><Text style={styles.primaryText}>{listened ? "Pronto, próximo degrau" : "Já li em voz alta"}</Text></Pressable>
    </View>
  );
}

function useShake() {
  const shake = useRef(new Animated.Value(0)).current;
  const run = () => Animated.sequence([-8, 8, -6, 6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 45, useNativeDriver: true }))).start();
  return [shake, run] as const;
}

function GapsStep({ card, onNext }: { card: VerseMemoryCard; onNext: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const tokens = useMemo(() => tokenize(card.text), [card.text]);
  const gaps = useMemo(() => gapIndexes(card.id, tokens, 0.35), [card.id, tokens]);
  const bank = useMemo(() => wordBank(card.id, tokens, gaps), [card.id, tokens, gaps]);
  const [filled, setFilled] = useState<string[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string>();
  const [shake, runShake] = useShake();
  const done = filled.length === gaps.length;
  const pick = (item: (typeof bank)[number]) => {
    const expected = tokens[gaps[filled.length]]?.text;
    if (!expected) return;
    if (item.text.toLocaleLowerCase("pt-BR") === expected.toLocaleLowerCase("pt-BR")) { setFilled([...filled, expected]); setUsed([...used, item.key]); }
    else { setWrong(item.key); runShake(); setTimeout(() => setWrong(undefined), 400); }
  };
  return (
    <View style={styles.exercise}>
      <Animated.View style={[styles.fullVerse, { transform: [{ translateX: shake }] }]}>
        <Text style={styles.verseText}>
          {tokens.map((token, i) => {
            const g = gaps.indexOf(i);
            const space = i > 0 && token.word ? " " : "";
            if (g < 0) return <Text key={i}>{space}{token.text}</Text>;
            const value = filled[g];
            return <Text key={i}>{space}<Text style={[styles.gap, value ? styles.gapFilled : g === filled.length ? { color: palette.accent } : null]}>{value ?? " _____ "}</Text></Text>;
          })}
        </Text>
      </Animated.View>
      {done ? (
        <Pressable accessibilityRole="button" onPress={onNext} style={styles.primary}><Text style={styles.primaryText}>Próximo degrau</Text></Pressable>
      ) : (
        <View style={styles.bank}>
          {bank.map((item) => (
            <Pressable key={item.key} disabled={used.includes(item.key)} onPress={() => pick(item)} accessibilityRole="button" style={[styles.tile, used.includes(item.key) && styles.tileUsed, wrong === item.key && { borderColor: palette.error, backgroundColor: palette.errorSoft }]}>
              <Text style={[styles.tileText, used.includes(item.key) && { opacity: 0 }]}>{item.text}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function OrderStep({ card, onNext }: { card: VerseMemoryCard; onNext: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const chunks = useMemo(() => verseChunks(card.text), [card.text]);
  const shuffled = useMemo(() => shuffledChunks(card.id, chunks), [card.id, chunks]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState<string>();
  const [shake, runShake] = useShake();
  const done = placed.length === chunks.length;
  const pick = (item: (typeof shuffled)[number]) => {
    if (item.index === placed.length) setPlaced([...placed, item.index]);
    else { setWrong(item.key); runShake(); setTimeout(() => setWrong(undefined), 400); }
  };
  return (
    <View style={styles.exercise}>
      <Animated.View style={[styles.fullVerse, { minHeight: 120, transform: [{ translateX: shake }] }]}>
        {placed.length ? <Text style={styles.verseText}>{placed.map((i) => chunks[i]).join(" ")}</Text> : <Text style={styles.placeholder}>Toque na primeira parte…</Text>}
      </Animated.View>
      {done ? (
        <Pressable accessibilityRole="button" onPress={onNext} style={styles.primary}><Text style={styles.primaryText}>Próximo degrau</Text></Pressable>
      ) : shuffled.map((item) => (
        <Pressable key={item.key} disabled={placed.includes(item.index)} onPress={() => pick(item)} accessibilityRole="button"
          style={[styles.chunk, placed.includes(item.index) && styles.tileUsed, wrong === item.key && { borderColor: palette.error, backgroundColor: palette.errorSoft }]}>
          <Text style={[styles.chunkText, placed.includes(item.index) && { opacity: 0.25 }]}>{item.text}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function LettersStep({ card, onNext }: { card: VerseMemoryCard; onNext: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const tokens = useMemo(() => tokenize(card.text), [card.text]);
  const letters = useMemo(() => firstLetters(card.text), [card.text]);
  const [peek, setPeek] = useState<number[]>([]);
  return (
    <View style={styles.exercise}>
      <View style={[styles.fullVerse, styles.lettersWrap]}>
        {tokens.map((token, i) => (
          token.word ? (
            <Pressable key={i} onPress={() => setPeek((list) => list.includes(i) ? list : [...list, i])} accessibilityRole="button" accessibilityLabel={peek.includes(i) ? token.text : "Revelar palavra"}>
              <Text style={[styles.letterToken, peek.includes(i) && styles.letterPeek]}>{peek.includes(i) ? token.text : letters[i]}</Text>
            </Pressable>
          ) : <Text key={i} style={styles.letterToken}>{token.text}</Text>
        ))}
      </View>
      <Text style={styles.mutedCenter}>{peek.length ? `Você espiou ${peek.length} ${peek.length === 1 ? "palavra" : "palavras"}. Tudo bem!` : "Recite em voz alta. Travou? Toque na palavra."}</Text>
      <Pressable accessibilityRole="button" onPress={onNext} style={styles.primary}><Text style={styles.primaryText}>Consegui recitar</Text></Pressable>
    </View>
  );
}

function TypeStep({ card, onDone }: { card: VerseMemoryCard; onDone: (mistakes: number) => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const tokens = useMemo(() => tokenize(card.text), [card.text]);
  const wordIndexes = useMemo(() => tokens.map((token, i) => (token.word ? i : -1)).filter((i) => i >= 0), [tokens]);
  const [revealed, setRevealed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [missesHere, setMissesHere] = useState(0);
  const [helped, setHelped] = useState<number[]>([]);
  const [shake, runShake] = useShake();
  const inputRef = useRef<TextInput>(null);
  const finished = revealed >= wordIndexes.length;

  const type = (text: string) => {
    const char = text.slice(-1);
    if (!char || finished) return;
    const word = tokens[wordIndexes[revealed]].text;
    if (initialMatches(word, char)) { setRevealed(revealed + 1); setMissesHere(0); }
    else {
      setMistakes(mistakes + 1); runShake();
      // Depois de 3 tentativas, a Lumi mostra a palavra para não travar.
      if (missesHere + 1 >= 3) { setHelped([...helped, wordIndexes[revealed]]); setRevealed(revealed + 1); setMissesHere(0); }
      else setMissesHere(missesHere + 1);
    }
  };

  useEffect(() => { if (finished) onDone(mistakes); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = new Set(wordIndexes.slice(0, revealed));
  return (
    <View style={styles.exercise}>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View style={[styles.fullVerse, { transform: [{ translateX: shake }] }]}>
          <Text style={styles.verseText}>
            {tokens.map((token, i) => {
              const space = i > 0 && token.word ? " " : "";
              if (!token.word) return <Text key={i} style={shown.has(i - 1) ? undefined : styles.hidden}>{token.text}</Text>;
              if (shown.has(i)) return <Text key={i} style={helped.includes(i) ? { color: palette.error } : { color: palette.success }}>{space}{token.text}</Text>;
              const current = i === wordIndexes[revealed];
              return <Text key={i}>{space}<Text style={[styles.hiddenWord, current && { color: palette.accent, borderColor: palette.accent }]}>{"_".repeat(Math.max(2, Math.min(7, token.text.length)))}</Text></Text>;
            })}
          </Text>
        </Animated.View>
      </Pressable>
      <TextInput ref={inputRef} autoFocus value="" onChangeText={type} autoCapitalize="none" autoCorrect={false} autoComplete="off" spellCheck={false}
        placeholder="Digite a 1ª letra da próxima palavra" placeholderTextColor={palette.textMuted} style={styles.typeInput} accessibilityLabel="Primeira letra da próxima palavra" />
      <View style={styles.row}>
        <Text style={[styles.muted, styles.flex]}>{revealed}/{wordIndexes.length} palavras · {mistakes} {mistakes === 1 ? "erro" : "erros"}</Text>
        <Pressable accessibilityRole="button" onPress={() => { setHelped([...helped, wordIndexes[revealed]]); setMistakes(mistakes + 1); setRevealed(revealed + 1); }} hitSlop={8}><Text style={styles.link}>Mostrar palavra</Text></Pressable>
      </View>
    </View>
  );
}

// ======================= Flashcards de palavras =======================

function WordTrainer({ queue, pool, onExit }: { queue: WordMemoryCard[]; pool: WordMemoryCard[]; onExit: () => void }) {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string>();
  const [score, setScore] = useState(0);
  const card = queue[index];
  const options = useMemo(() => card ? meaningOptions(card.id, card.meaning, pool.filter((w) => w.id !== card.id).map((w) => w.meaning), SPARE_MEANINGS) : [], [card, pool]);

  useEffect(() => { if (card) void speak(card.lemma, card.language, card.transliteration); }, [card]);

  const choose = (option: string) => {
    if (picked || !card) return;
    const ok = option === card.meaning;
    setPicked(option); if (ok) setScore(score + 1);
    playFeedback(ok ? "correct" : "wrong");
    void reviewWordCard(card.id, ok);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.trainerTop, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair" onPress={() => { stopSpeaking(); onExit(); }} hitSlop={10}><Icon name="close" size={24} color={palette.textMuted} /></Pressable>
        <View style={styles.track}><View style={[styles.trackFill, { width: `${(Math.min(index + (picked ? 1 : 0), queue.length) / queue.length) * 100}%` }]} /></View>
      </View>
      {!card ? (
        <View style={[styles.center, styles.flex]}>
          <LumiAnimated animation="joinha" style={styles.doneLumi} />
          <Text style={styles.titleCenter}>{score} de {queue.length} certas!</Text>
          <Pressable accessibilityRole="button" onPress={onExit} style={styles.primary}><Text style={styles.primaryText}>Voltar</Text></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.trainerBody}>
          <Text style={styles.stepTitle}>O que significa?</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir ${card.lemma}`} onPress={() => void speak(card.lemma, card.language, card.transliteration)} style={styles.wordCard}>
            <Text style={styles.wordBig}>{card.lemma}</Text>
            <Text style={styles.muted}>{card.transliteration} · {card.strong}</Text>
            <View style={styles.listenPill}><Icon name="volume" size={16} color={palette.accent} /><Text style={styles.secondaryText}>Ouvir</Text></View>
          </Pressable>
          {options.map((option) => {
            const state = !picked ? "idle" : option === card.meaning ? "right" : option === picked ? "wrong" : "dim";
            return (
              <Pressable key={option} accessibilityRole="button" disabled={Boolean(picked)} onPress={() => choose(option)}
                style={[styles.option, state === "right" && { borderColor: palette.success, backgroundColor: palette.successSoft }, state === "wrong" && { borderColor: palette.error, backgroundColor: palette.errorSoft }, state === "dim" && { opacity: 0.45 }]}>
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
          {picked ? <Pressable accessibilityRole="button" onPress={() => { setPicked(undefined); setIndex(index + 1); }} style={styles.primary}><Text style={styles.primaryText}>Continuar</Text></Pressable> : null}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  pressed: { opacity: 0.85 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  tabs: { flexDirection: "row", gap: 6, padding: 6, margin: 16, marginBottom: 0, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  tab: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  tabActive: { backgroundColor: p.activeTabBg },
  tabText: { color: p.textMuted, fontSize: 14, fontWeight: "800" },
  tabTextActive: { color: p.accent },
  content: { padding: 16, gap: 12 },
  how: { gap: 10, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  howHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  howLumi: { width: 76, height: 72 },
  howStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  howNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  howNumText: { color: p.accent, fontSize: 12, fontWeight: "900" },
  howText: { flex: 1, color: p.text, fontSize: 14, lineHeight: 20 },
  howLink: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  link: { color: p.accent, fontSize: 14, fontWeight: "900" },
  eyebrow: { color: p.xp, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 20, fontWeight: "900" },
  titleCenter: { color: p.text, fontSize: 24, fontWeight: "900", textAlign: "center" },
  muted: { color: p.textMuted, fontSize: 14, lineHeight: 20 },
  mutedCenter: { color: p.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  section: { color: p.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 6 },
  dueCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 22, backgroundColor: p.activeTabBg, borderWidth: 1.5, borderColor: p.accent },
  playBig: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: p.cta },
  suggestions: { gap: 8 },
  suggestion: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 42, paddingHorizontal: 14, borderRadius: 21, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  suggestionText: { color: p.text, fontSize: 14, fontWeight: "800" },
  verseCard: { gap: 8, padding: 14, borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  verseHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, color: p.text, fontSize: 17, fontWeight: "900" },
  badge: { color: p.textMuted, fontSize: 12, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: p.groundDeep, overflow: "hidden" },
  badgeDue: { color: p.ctaText, backgroundColor: p.cta },
  ladderRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rung: { width: 22, height: 7, borderRadius: 4, backgroundColor: p.line },
  rungSmall: { width: 10, height: 6, borderRadius: 3, backgroundColor: p.line },
  rungOn: { backgroundColor: p.xp },
  levelText: { color: p.textMuted, fontSize: 12, fontWeight: "800", marginLeft: 6 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  train: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, paddingHorizontal: 16, borderRadius: 12, backgroundColor: p.cta, borderBottomWidth: 3, borderBottomColor: p.ctaShadow },
  trainText: { color: p.ctaText, fontSize: 14, fontWeight: "900" },
  iconAction: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.line },
  secondaryBtn: { minHeight: 40, paddingHorizontal: 12, justifyContent: "center", borderRadius: 12, borderWidth: 1.5, borderColor: p.line },
  secondaryWide: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 14, borderWidth: 2, borderColor: p.line },
  secondaryText: { color: p.accent, fontSize: 14, fontWeight: "900" },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  wordLemma: { color: p.text, fontSize: 22, fontWeight: "800" },
  wordLevel: { flexDirection: "row", gap: 2 },
  trainerTop: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: p.divider },
  trainerRef: { color: p.text, fontSize: 16, fontWeight: "900", marginBottom: 6 },
  steps: { flexDirection: "row", gap: 4 },
  stepItem: { flex: 1, alignItems: "center", gap: 3 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: p.line },
  stepNow: { backgroundColor: p.accent },
  stepDone: { backgroundColor: p.success },
  stepNum: { color: p.ground, fontSize: 11, fontWeight: "900" },
  stepLabel: { color: p.textMuted, fontSize: 10, fontWeight: "800" },
  stepLabelNow: { color: p.accent },
  track: { flex: 1, height: 14, borderRadius: 7, backgroundColor: p.line, overflow: "hidden" },
  trackFill: { height: 14, borderRadius: 7, backgroundColor: p.xp },
  trainerBody: { padding: 18, gap: 12 },
  centerBody: { alignItems: "center" },
  stepTitle: { color: p.text, fontSize: 22, fontWeight: "900" },
  exercise: { gap: 14, marginTop: 4, alignSelf: "stretch" },
  fullVerse: { alignSelf: "stretch", padding: 18, borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, justifyContent: "center" },
  verseText: { color: p.text, fontSize: 19, lineHeight: 32, fontWeight: "600" },
  verseTextBig: { color: p.text, fontSize: 22, lineHeight: 36, fontWeight: "700" },
  placeholder: { color: p.textMuted, fontSize: 16, textAlign: "center" },
  gap: { color: p.textMuted, fontWeight: "900", textDecorationLine: "underline" },
  gapFilled: { color: p.success, textDecorationLine: "none" },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  tile: { minHeight: 46, justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  tileUsed: { backgroundColor: p.divider, borderColor: p.divider },
  tileText: { color: p.text, fontSize: 16, fontWeight: "800" },
  chunk: { padding: 14, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  chunkText: { color: p.text, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  lettersWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  letterToken: { color: p.text, fontSize: 22, fontWeight: "900", paddingHorizontal: 2 },
  letterPeek: { color: p.xp, fontWeight: "800", fontSize: 18 },
  hidden: { opacity: 0 },
  hiddenWord: { color: p.line, fontWeight: "900", letterSpacing: 1 },
  typeInput: { minHeight: 54, paddingHorizontal: 16, borderRadius: 16, borderWidth: 2, borderColor: p.accent, backgroundColor: p.card, color: p.text, fontSize: 18, fontWeight: "800", textAlign: "center" },
  primary: { flexDirection: "row", gap: 8, minHeight: 54, alignSelf: "stretch", borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow, paddingHorizontal: 18 },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  doneLumi: { width: 150, height: 140 },
  wordCard: { alignItems: "center", gap: 6, padding: 22, borderRadius: 24, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  wordBig: { color: p.text, fontSize: 44, fontWeight: "800" },
  listenPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, minHeight: 32, borderRadius: 16, backgroundColor: p.activeTabBg, marginTop: 4 },
  option: { minHeight: 56, justifyContent: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  optionText: { color: p.text, fontSize: 16, fontWeight: "800" }
});
