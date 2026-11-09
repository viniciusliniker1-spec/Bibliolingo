import { useEffect, useMemo, useState } from "react";
import { PushButton } from "../../components/PushButton";
import { GrowBar } from "../../components/motion";
import { ActivityIndicator, InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getBookForActivity, orderedLessons } from "../../../src/content/catalog";
import { reviewExerciseForQuestion } from "../../../src/domain/reviewCatalog";
import { getReviewQueue, reviewReason, summarizeReviewQueue } from "../../../src/domain/review";
import type { Exercise } from "../../../src/types/content";
import { lumiAnimationAssets } from "../../assets/lumiAnimationAssets";
import { BlocksExercise, ChoiceExercise, FillExercise, type AnswerState } from "../../components/lesson/Exercises";
import { Icon } from "../../components/navigation/Icons";
import { ProfessorNoahModal } from "../../components/ProfessorNoahModal";
import { isExerciseAnswerCorrect } from "../../domain/exercises";
import { heartsToFull, isOutOfHearts, recoveryQuestionIds } from "../../domain/hearts";
import { buildMobileLearningProfile, exerciseAnswerText, exerciseCorrectAnswerText, exerciseOptions, exercisePrompt, type NoahContext } from "../../domain/noah";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

function lessonForQuestion(questionId: string) {
  return orderedLessons.find((lesson) => lesson.steps.some((step) => step.type !== "learn" && step.id === questionId));
}

export default function ReviewScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress, answerQuestion } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const queue = useMemo(() => getReviewQueue(progress.reviewItems), [progress.reviewItems]);
  const summary = useMemo(() => summarizeReviewQueue(queue), [queue]);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [recovery, setRecovery] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<boolean>();
  const [recovered, setRecovered] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noahOpen, setNoahOpen] = useState(false);
  const outOfHearts = isOutOfHearts(progress);
  // Abre a tela primeiro e só depois monta a lista: localizar as questões pode
  // carregar catálogos inteiros, e isso não pode segurar o toque do botão.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);
  const dueIds = useMemo(() => ready ? queue.map((entry) => entry.questionId).filter((id) => Boolean(reviewExerciseForQuestion(id))) : [], [ready, queue]);
  const practiceIds = useMemo(() => ready && !dueIds.length ? recoveryQuestionIds(progress, [], 8).filter((id) => Boolean(reviewExerciseForQuestion(id))) : [], [ready, dueIds.length, progress.attempts]); // eslint-disable-line react-hooks/exhaustive-deps
  const currentId = sessionIds[index];
  const exercise: Exercise | undefined = currentId ? reviewExerciseForQuestion(currentId) : undefined;
  const item = queue.find((candidate) => candidate.questionId === currentId);
  const lesson = useMemo(() => currentId ? lessonForQuestion(currentId) : undefined, [currentId]);
  const book = lesson ? getBookForActivity(lesson.id) : undefined;

  const start = (ids: string[], isRecovery: boolean) => {
    setSessionIds(ids.slice(0, 10)); setRecovery(isRecovery); setIndex(0); setSelectedIds([]); setFeedback(undefined); setRecovered(0); setFinished(false);
    playFeedback("start");
  };
  const check = () => {
    if (!exercise || feedback !== undefined || !selectedIds.length) return;
    const correct = isExerciseAnswerCorrect(exercise, selectedIds);
    setFeedback(correct);
    if (correct && progress.settings.heartsEnabled && heartsToFull(progress) > 0) setRecovered((value) => value + 1);
    answerQuestion(exercise.id, correct, { conceptId: exercise.conceptId, lessonId: lesson?.id ?? "review", mode: "review" });
    playFeedback(correct ? "correct" : "wrong");
  };
  const next = () => {
    if (index + 1 >= sessionIds.length) { setSessionIds([]); setFinished(true); playFeedback("complete"); }
    else setIndex((value) => value + 1);
    setSelectedIds([]); setFeedback(undefined);
  };

  const heartsRow = progress.settings.heartsEnabled ? (
    <View style={styles.heartsRow} accessible accessibilityLabel={`${progress.hearts} de ${progress.settings.maxHearts} corações`}>
      {Array.from({ length: progress.settings.maxHearts }, (_, i) => <Icon key={i} name="heart" size={22} color={i < progress.hearts ? palette.heart : palette.line} />)}
    </View>
  ) : null;

  if (!exercise) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <Image source={finished ? lumiAnimationAssets.pular : outOfHearts ? lumiAnimationAssets.dormir : lumiAnimationAssets.ler} style={styles.lumi} contentFit="contain" accessibilityLabel="Lumi" />
        <Text style={styles.title}>{finished ? "Revisão concluída!" : outOfHearts ? "Recupere seus corações" : "Revisão"}</Text>
        {heartsRow}
        <Text style={styles.body}>
          {finished
            ? recovered ? `Você recuperou ${recovered} ${recovered === 1 ? "coração" : "corações"}. Pode voltar para a trilha!` : "Muito bem! Seu aprendizado ficou mais firme."
            : outOfHearts ? "Cada acerto na revisão devolve 1 coração. Revise e volte para a trilha." : "Pratique no momento certo para não esquecer o que aprendeu."}
        </Text>
        <View style={styles.stats}>
          <Stat value={summary.availableToday} label="para hoje" />
          <Stat value={summary.overdue} label="atrasadas" />
          <Stat value={summary.weakConcepts} label="reforço" />
        </View>
        {!ready ? (
          <View style={styles.empty}><ActivityIndicator color={palette.accent} /><Text style={styles.body}>Preparando sua revisão…</Text></View>
        ) : dueIds.length ? (
          <PushButton accessibilityRole="button" onPress={() => start(dueIds, false)} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Icon name="play" size={16} color={palette.ctaText} /><Text style={styles.primaryText}>Começar revisão · até 10</Text></PushButton>
        ) : practiceIds.length ? (
          <PushButton accessibilityRole="button" onPress={() => start(practiceIds, true)} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Icon name="heart" size={16} color={palette.ctaText} /><Text style={styles.primaryText}>{outOfHearts ? "Prática de recuperação" : "Praticar o que já estudei"}</Text></PushButton>
        ) : (
          <View style={styles.empty}><Icon name="check" size={28} color={palette.success} strokeWidth={3} /><Text style={styles.cardTitle}>Tudo em dia</Text><Text style={styles.body}>Quando algo precisar de reforço, aparece aqui.</Text></View>
        )}
        {finished || (!outOfHearts && progress.hearts > 0) ? (
          <Pressable accessibilityRole="button" onPress={() => router.navigate("/")} style={styles.secondary}><Text style={styles.secondaryText}>Voltar para a trilha</Text></Pressable>
        ) : null}
      </ScrollView>
    );
  }

  const answer: AnswerState = feedback === undefined ? "idle" : feedback ? "correct" : "wrong";
  const context: NoahContext = {
    area: "bible", title: `Revisão · ${book?.title ?? "Bíblia"}`, reference: exercise.reference.label, currentQuestion: exercisePrompt(exercise),
    selectedAnswer: feedback !== undefined ? exerciseAnswerText(exercise, selectedIds) : undefined, correctAnswer: feedback !== undefined ? exerciseCorrectAnswerText(exercise) : undefined,
    options: exerciseOptions(exercise), answerStatus: feedback === undefined ? "unanswered" : feedback ? "correct" : "incorrect", difficulty: exercise.difficulty,
    conceptId: exercise.conceptId, lessonId: lesson?.id, questionId: exercise.id, learningProfile: buildMobileLearningProfile(progress, exercise.conceptId)
  };
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair da revisão" onPress={() => setSessionIds([])} hitSlop={10}><Icon name="close" size={24} color={palette.textMuted} /></Pressable>
        <View style={styles.track}><GrowBar style={[styles.fill, { width: `${Math.round(((index + (feedback !== undefined ? 1 : 0)) / sessionIds.length) * 100)}%` }]} /></View>
        {progress.settings.heartsEnabled ? <View style={styles.heartBadge}><Icon name="heart" size={20} color={palette.heart} /><Text style={styles.heartText}>{progress.hearts}</Text></View> : null}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pill}><Text style={styles.pillText}>{recovery ? "PRÁTICA DE RECUPERAÇÃO" : "REVISÃO"} · {index + 1} DE {sessionIds.length}</Text></View>
        {item ? <Text style={styles.reason}>{reviewReason(item)}</Text> : null}
        <Text style={styles.prompt}>{exercise.type === "fill-choice" ? "Complete com a palavra certa." : exercise.type === "word-blocks" ? "Monte a frase na ordem certa." : exercise.prompt}</Text>
        {exercise.type === "multiple-choice" ? <ChoiceExercise exercise={exercise} selectedIds={selectedIds} onSelect={(ids) => { playFeedback("select"); setSelectedIds(ids); }} answer={answer} />
          : exercise.type === "fill-choice" ? <FillExercise exercise={exercise} selectedIds={selectedIds} onSelect={(ids) => { playFeedback("select"); setSelectedIds(ids); }} answer={answer} />
            : <BlocksExercise exercise={exercise} selectedIds={selectedIds} onSelect={setSelectedIds} answer={answer} />}
        {feedback !== undefined ? (
          <View style={[styles.feedback, { backgroundColor: feedback ? palette.successSoft : palette.errorSoft, borderColor: feedback ? palette.success : palette.error }]}>
            <Text style={[styles.cardTitle, { color: feedback ? palette.success : palette.error }]}>{feedback ? (progress.settings.heartsEnabled && recovered ? "Acertou! +1 coração" : "Boa recuperação!") : "Vamos reforçar este ponto"}</Text>
            {!feedback ? <Text style={styles.body}>Resposta certa: <Text style={styles.strong}>{exerciseCorrectAnswerText(exercise)}</Text></Text> : null}
            <Text style={styles.body}>{exercise.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        {feedback === undefined ? (
          <Pressable accessibilityRole="button" disabled={!selectedIds.length} onPress={check} style={[styles.primary, !selectedIds.length && styles.disabled]}><Text style={[styles.primaryText, !selectedIds.length && { color: palette.textMuted }]}>Verificar</Text></Pressable>
        ) : (
          <View style={styles.row}>
            {!feedback ? <Pressable accessibilityRole="button" onPress={() => setNoahOpen(true)} style={styles.secondary}><Text style={styles.secondaryText}>Entender</Text></Pressable> : null}
            <Pressable accessibilityRole="button" onPress={next} style={[styles.primary, styles.flex]}><Text style={styles.primaryText}>{index + 1 >= sessionIds.length ? "Concluir" : "Continuar"}</Text></Pressable>
          </View>
        )}
      </View>
      <ProfessorNoahModal visible={noahOpen} context={context} contextKey={`review:${exercise.id}`} autoQuestion="Explique meu erro e recomende como revisar este conceito." onClose={() => setNoahOpen(false)} />
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  content: { paddingHorizontal: 18, paddingBottom: 32, gap: 14 },
  lumi: { alignSelf: "center", width: 170, height: 160 },
  title: { color: p.text, fontSize: 26, fontWeight: "900", textAlign: "center" },
  body: { color: p.text, fontSize: 15, lineHeight: 22 },
  strong: { fontWeight: "900" },
  heartsRow: { flexDirection: "row", gap: 6, alignSelf: "center" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  statValue: { color: p.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: p.textMuted, fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", gap: 6, padding: 20, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  cardTitle: { color: p.text, fontSize: 18, fontWeight: "900" },
  primary: { flexDirection: "row", gap: 8, minHeight: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 2 },
  disabled: { backgroundColor: p.node, borderBottomColor: p.nodeShadow },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  secondary: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  secondaryText: { color: p.accent, fontSize: 15, fontWeight: "900" },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  track: { flex: 1, height: 14, borderRadius: 7, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: p.cta },
  heartBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  heartText: { color: p.heartText, fontWeight: "900", fontSize: 16 },
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: p.activeTabBg },
  pillText: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  reason: { color: p.textMuted, fontSize: 13, lineHeight: 19 },
  prompt: { color: p.text, fontSize: 21, lineHeight: 29, fontWeight: "900" },
  feedback: { gap: 6, padding: 14, borderRadius: 16, borderWidth: 2 },
  bottom: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.divider }
});
