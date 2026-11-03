import { useEffect, useMemo, useRef, useState } from "react";
import { mapForPassage } from "../content/maps/biblicalMaps";
import { AccessibilityInfo, Alert, Animated, Easing, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getBookForActivity, getUnitForActivity } from "../../src/content/catalog";
import { contentLayerLabel } from "../../src/domain/contentLayer";
import { nextBookActivityId } from "../../src/domain/unlocks";
import type { Exercise, LessonStep } from "../../src/types/content";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { noahPortrait } from "../assets/noahAssets";
import { isExerciseAnswerCorrect } from "../domain/exercises";
import { buildLessonPlan, comboLevel, NARRATIVE_BOOKS, typedAnswerMatches, type PlayStep } from "../domain/lessonPlan";
import { exerciseAnswerText, exerciseCorrectAnswerText, exerciseOptions, exercisePrompt, buildMobileLearningProfile, type NoahContext } from "../domain/noah";
import { mobileHubRoute, nextActivityForKind, resolveMobileActivity, type MobileActivityKind } from "../domain/activityCatalog";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { BlocksExercise, ChoiceExercise, exerciseTitle, FillExercise, MatchExercise, OrderExercise, PassageExercise, TrueFalseExercise, TypeExercise, type AnswerState } from "./lesson/Exercises";
import { LumiCharacter } from "./LumiCharacter";
import { Icon } from "./navigation/Icons";
import { ProfessorNoahModal } from "./ProfessorNoahModal";
import { HeartsGate } from "./HeartsGate";
import { isOutOfHearts } from "../domain/hearts";

const PRAISE = ["Excelente!", "Mandou bem!", "Isso aí!", "Perfeito!", "Muito bom!"];
const COMFORT = ["Quase!", "Não foi dessa vez", "Vamos aprender juntos"];

interface Feedback { correct: boolean; title: string; explanation: string; correctAnswer?: string }

export function MobileActivityPlayer({ fixedKind }: { fixedKind?: MobileActivityKind }) {
  useLightStatusBar();
  const params = useLocalSearchParams<{ activityId: string; kind?: MobileActivityKind; journeyMode?: "canonical" | "individual"; journeyBookId?: string }>();
  const kind = fixedKind ?? params.kind ?? "bible";
  const activityId = params.activityId;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress, hydrated, startActivity, setStepIndex: persistStepIndex, answerQuestion, completeActivity } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const activity = activityId ? resolveMobileActivity(kind, activityId) : undefined;
  const activityUnit = activityId ? getUnitForActivity(activityId) : undefined;
  const steps = useMemo<LessonStep[]>(() => activity?.steps ?? [], [activity]);
  const reviewPool = useMemo<Exercise[]>(() => {
    if (!activityUnit || !activityId) return [];
    const index = activityUnit.lessons.findIndex((lesson) => lesson.id === activityId);
    return activityUnit.lessons.slice(0, Math.max(0, index)).flatMap((lesson) => lesson.steps.filter((step): step is Exercise => step.type !== "learn"));
  }, [activityUnit, activityId]);
  const unitContext = useMemo(() => {
    if (!activityUnit || !activityId) return undefined;
    const index = activityUnit.lessons.findIndex((lesson) => lesson.id === activityId);
    if (index < 0) return undefined;
    const bookId = kind === "bible" ? getBookForActivity(activityId)?.id : undefined;
    return { index, lessonTitles: activityUnit.lessons.map((lesson) => lesson.title), narrative: Boolean(bookId && NARRATIVE_BOOKS.has(bookId)) };
  }, [activityUnit, activityId, kind]);
  const plan = useMemo<PlayStep[]>(() => activity ? buildLessonPlan({ lessonId: activity.id, steps, checkpoint: Boolean(activity.checkpoint), reviewPool, unit: unitContext }) : [], [activity, steps, reviewPool, unitContext]);
  const lessonContent = useMemo(() => steps.filter((item) => item.type === "learn").map((item) => `${item.title}: ${item.body}`).join("\n\n"), [steps]);
  const exerciseTotal = steps.filter((step) => step.type !== "learn").length;
  const existingSession = progress.activeLesson?.activityId === activityId ? progress.activeLesson : undefined;

  const [planIndex, setPlanIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(existingSession?.correct ?? 0);
  const [incorrectCount, setIncorrectCount] = useState(existingSession?.incorrect ?? 0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [matchDone, setMatchDone] = useState(false);
  const [typed, setTyped] = useState("");
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [noahOpen, setNoahOpen] = useState(false);
  const [noahAutoQuestion, setNoahAutoQuestion] = useState<string>();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heartsGateOpen, setHeartsGateOpen] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); }, []);
  const still = reduceMotion || Boolean(progress.settings.reduceMotionEnabled);

  useEffect(() => {
    if (!hydrated || !activityId || !activity) return;
    const session = startActivity(activityId, params.journeyMode, params.journeyBookId);
    const resumed = Math.max(0, plan.findIndex((item) => "sourceIndex" in item && item.sourceIndex === session.stepIndex));
    setPlanIndex(resumed);
    setCorrectCount(session.correct);
    setIncorrectCount(session.incorrect);
    const resumedStep = plan[resumed];
    const resumedAnswer = resumedStep?.kind === "exercise" ? session.answers[resumedStep.step.id] : undefined;
    setFeedback(resumedStep?.kind === "exercise" && resumedAnswer !== undefined
      ? { correct: resumedAnswer, title: resumedAnswer ? PRAISE[0] : COMFORT[0], explanation: resumedStep.step.explanation }
      : null);
    if (session.stepIndex === 0) playFeedback("start");
    if (isOutOfHearts(progress, kind)) setHeartsGateOpen(true);
  }, [activity, activityId, hydrated, startActivity, plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = plan[planIndex];
  useEffect(() => {
    setSourcesOpen(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    Animated.timing(progressAnim, { toValue: plan.length ? (planIndex + (feedback || matchDone ? 1 : 0)) / plan.length : 0, duration: still ? 0 : 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [planIndex, feedback, matchDone, plan.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.timing(sheetAnim, { toValue: feedback ? 1 : 0, duration: still ? 0 : 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [feedback]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (combo < 2 || still) return;
    comboAnim.setValue(1.35);
    Animated.spring(comboAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [combo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activity || !play) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Atividade não encontrada</Text>
        <Text style={styles.body}>Volte ao percurso e escolha uma atividade disponível.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace(mobileHubRoute(kind))} style={styles.primary}><Text style={styles.primaryText}>Voltar ao percurso</Text></Pressable>
      </View>
    );
  }

  const current = "step" in play ? play.step : undefined;
  const noahContext: NoahContext = !current || current.type === "learn"
    ? { area: kind, title: `${activity.contextTitle} · ${activity.title}${current ? ` · ${current.title}` : ""}`, reference: current?.reference?.label, content: lessonContent || current?.body || "", lessonId: activity.id, questionId: play.id, sources: current?.sourceIds ?? activity.sourceIds }
    : {
        area: kind, title: `${activity.contextTitle} · ${activity.title}`, objective: current.objective, reference: current.reference.label, content: lessonContent,
        currentQuestion: exercisePrompt(current), selectedAnswer: feedback ? exerciseAnswerText(current, selectedIds) || undefined : undefined,
        correctAnswer: feedback ? exerciseCorrectAnswerText(current) || undefined : undefined, options: exerciseOptions(current),
        answerStatus: feedback ? (feedback.correct ? "correct" : "incorrect") : "unanswered", difficulty: current.difficulty, conceptId: current.conceptId,
        lessonId: activity.id, questionId: current.id, learningProfile: buildMobileLearningProfile(progress, current.conceptId), sources: activity.sourceIds
      };

  const registerResult = (correct: boolean) => {
    if (correct) {
      const next = combo + 1;
      setCombo(next);
      setMaxCombo((value) => Math.max(value, next));
      const level = comboLevel(next);
      playFeedback(level ? (`combo${level}` as "combo1" | "combo2" | "combo3") : "correct");
    } else {
      setCombo(0);
      playFeedback("wrong");
    }
  };

  /** Etapas bônus (ordenar, passagem): não contam para aprovação, mas valem combo. */
  const finishBonus = (ok: boolean) => {
    setMatchDone(true);
    registerResult(ok);
  };

  const submit = (forced?: string[]) => {
    if (play.kind !== "exercise" || feedback) return;
    const ids = forced ?? selectedIds;
    if (!ids.length) return;
    const exercise = play.step;
    const rightAnswer = exerciseCorrectAnswerText(exercise);
    let correct: boolean;
    let explanation: string;
    if (play.presentation === "true-false" && play.trueFalse) {
      correct = (ids[0] === "true") === play.trueFalse.isTrue;
      explanation = (play.trueFalse.isTrue ? "" : `A resposta certa é “${rightAnswer}”. `) + (exercise.optionExplanations?.[play.trueFalse.optionId] ?? exercise.explanation);
    } else if (play.presentation === "type") {
      correct = typedAnswerMatches(typed, rightAnswer);
      explanation = exercise.explanation;
    } else {
      correct = isExerciseAnswerCorrect(exercise, ids);
      explanation = exercise.type !== "word-blocks" && ids[0] ? exercise.optionExplanations?.[ids[0]] ?? exercise.explanation : exercise.explanation;
    }
    if (correct) setCorrectCount((value) => value + 1); else setIncorrectCount((value) => value + 1);
    answerQuestion(exercise.id, correct, { conceptId: exercise.conceptId, lessonId: activity.id, mode: kind === "bible" ? (activity.checkpoint ? "checkpoint" : "lesson") : kind, difficulty: exercise.difficulty });
    const titles = correct ? PRAISE : COMFORT;
    const nextCombo = correct ? combo + 1 : 0;
    setFeedback({
      correct,
      title: correct && nextCombo >= 2 ? `Combo x${nextCombo}!` : titles[(planIndex + exercise.id.length) % titles.length],
      explanation,
      correctAnswer: (!correct && play.presentation !== "true-false") || (correct && play.presentation === "type" && typed.trim() !== rightAnswer) ? rightAnswer : undefined
    });
    registerResult(correct);
  };

  const finish = () => {
    const result = completeActivity(activity.id, exerciseTotal, correctCount, activity.checkpoint, activity.passAccuracy);
    const nextId = result.passed
      ? kind === "bible" && params.journeyMode === "individual"
        ? nextBookActivityId((getBookForActivity(activity.id)?.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]) ?? [activity.id]), result.progress.completedLessonIds, result.progress.completedCheckpointIds)
        : nextActivityForKind(kind, result.progress.completedLessonIds, result.progress.completedCheckpointIds)
      : activity.id;
    router.replace({
      pathname: "/result",
      params: { activityId: activity.id, activityTitle: activity.title, kind, nextId, journeyMode: params.journeyMode, journeyBookId: params.journeyBookId, correct: String(correctCount), incorrect: String(incorrectCount), total: String(exerciseTotal), xpEarned: String(result.xpEarned), passed: String(result.passed), maxCombo: String(maxCombo) }
    });
  };

  const outOfHearts = isOutOfHearts(progress, kind);
  const moveToNext = () => {
    setNoahOpen(false); setNoahAutoQuestion(undefined);
    // Corações esgotados no meio da lição: a lição fica salva e a revisão vem antes.
    if (outOfHearts && plan.slice(planIndex + 1).some((item) => item.kind === "exercise")) { setHeartsGateOpen(true); return; }
    const nextIndex = planIndex + 1;
    if (nextIndex >= plan.length) { finish(); return; }
    const next = plan[nextIndex];
    setPlanIndex(nextIndex);
    if ("sourceIndex" in next) persistStepIndex(next.sourceIndex);
    setSelectedIds([]); setTyped(""); setFeedback(null); setMatchDone(false);
  };

  const close = () => Alert.alert("Sair da lição?", "Seu progresso nesta lição fica salvo para continuar depois.", [
    { text: "Continuar estudando", style: "cancel" },
    { text: "Sair", style: "destructive", onPress: () => router.back() }
  ]);

  const openReference = (readerMode?: "original" | "interlinear") => {
    const reference = current?.reference;
    if (!reference) return;
    router.push({ pathname: "/(tabs)/bible", params: { osis: reference.bookId, chapter: String(reference.startChapter), verse: reference.startVerse ? String(reference.startVerse) : undefined, returnActivityId: activity.id, returnKind: kind, returnJourneyMode: params.journeyMode, returnJourneyBookId: params.journeyBookId, readerMode } });
  };
  const openNoah = (autoQuestion?: string) => { setNoahAutoQuestion(autoQuestion); setNoahOpen(true); };

  const answerState: AnswerState = feedback ? (feedback.correct ? "correct" : "wrong") : "idle";
  const choose = (ids: string[]) => { if (feedback) return; playFeedback("select"); setSelectedIds(ids); };
  const isLast = planIndex === plan.length - 1;
  const width = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const sheetY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [260, 0] });
  const headerLabel = play.kind === "learn" ? contentLayerLabel(play.step.layer) : exerciseTitle(play.kind === "exercise" ? play.presentation : play.kind);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Barra superior: sair, progresso, combo e corações */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair da lição" onPress={close} hitSlop={10} style={styles.closeButton}><Icon name="close" size={24} color={palette.textMuted} strokeWidth={2.6} /></Pressable>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: plan.length, now: planIndex }}>
          <Animated.View style={[styles.fill, { width }]}><View style={styles.fillShine} /></Animated.View>
        </View>
        {combo >= 2 ? (
          <Animated.View style={[styles.combo, { transform: [{ scale: comboAnim }] }]} accessibilityLabel={`Combo de ${combo} acertos`}>
            <Icon name="flame" size={16} color="#ffffff" /><Text style={styles.comboText}>x{combo}</Text>
          </Animated.View>
        ) : progress.settings.heartsEnabled ? (
          <View style={styles.hearts} accessibilityLabel={`${progress.hearts} corações`}><Icon name="heart" size={20} color={palette.heart} /><Text style={styles.heartsText}>{progress.hearts}</Text></View>
        ) : null}
      </View>

      <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={[styles.content, { paddingBottom: feedback ? 300 : 140 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.kindPill}><Text style={styles.kindPillText}>{headerLabel.toLocaleUpperCase("pt-BR")}</Text></View>

        {play.kind === "learn" ? (
          <View style={styles.learn}>
            {planIndex === 0 ? <Image source={lumiAnimationAssets.acenar} style={styles.lumiWave} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi dando boas-vindas à lição" /> : null}
            <Text style={styles.title}>{play.step.title}</Text>
            <Text style={styles.body}>{play.step.body}</Text>
            {play.step.keyPoints?.length ? (
              <View style={styles.keyPoints}>
                {play.step.keyPoints.map((point) => (
                  <View key={point} style={styles.keyPoint}><View style={styles.keyDot}><Icon name="check" size={12} color={palette.isDark ? palette.ctaText : "#ffffff"} strokeWidth={3.4} /></View><Text style={styles.keyText}>{point}</Text></View>
                ))}
              </View>
            ) : null}
            {play.step.reference ? (
              <View style={styles.refRow}>
                <Pressable accessibilityRole="link" onPress={() => openReference()} style={styles.refPill}><Icon name="book" size={16} color={palette.accent} /><Text style={styles.refText}>{play.step.reference.label}</Text></Pressable>
                <Pressable accessibilityRole="link" onPress={() => openReference("original")} style={styles.refPill}><Icon name="globe" size={16} color={palette.accent} /><Text style={styles.refText}>Original</Text></Pressable>
                {mapForPassage(play.step.reference.bookId, play.step.reference.startChapter) ? (
                  <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/study/maps/[id]", params: { id: mapForPassage(play.step.reference!.bookId, play.step.reference!.startChapter)! } })} style={styles.refPill}><Icon name="map" size={16} color={palette.accent} /><Text style={styles.refText}>Mapa</Text></Pressable>
                ) : null}
              </View>
            ) : null}
            {activityUnit?.sources?.length ? (
              <View style={styles.sources}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded: sourcesOpen }} onPress={() => setSourcesOpen((open) => !open)} style={styles.sourcesToggle}>
                  <Text style={styles.sourcesTitle}>Fontes e leituras complementares</Text>
                  <Icon name={sourcesOpen ? "chevronDown" : "chevronRight"} size={18} color={palette.textMuted} />
                </Pressable>
                {sourcesOpen ? activityUnit.sources.filter((source) => !play.step.sourceIds?.length || play.step.sourceIds.includes(source.id)).map((source) => (
                  <Pressable key={source.id} disabled={!source.url} onPress={() => (source.url ? Linking.openURL(source.url) : undefined)} style={styles.sourceItem}>
                    <Text style={styles.sourceName}>{source.title}</Text>
                    <Text style={styles.sourceMeta}>{[source.author ?? source.institution, source.coverageRead].filter(Boolean).join(" · ")}</Text>
                  </Pressable>
                )) : null}
              </View>
            ) : null}
          </View>
        ) : play.kind === "match" ? (
          <>
            <Text style={styles.prompt}>Ligue cada pergunta à resposta certa.</Text>
            <Text style={styles.hint}>Revisão rápida com o que você já estudou nesta unidade.</Text>
            <MatchExercise key={play.id} pairs={play.pairs} seed={play.id} onPair={(ok) => { if (ok) { playFeedback("match"); const next = combo + 1; setCombo(next); setMaxCombo((value) => Math.max(value, next)); } else { setCombo(0); playFeedback("wrong"); } }} onDone={() => { setMatchDone(true); playFeedback(comboLevel(combo) ? (`combo${Math.max(1, comboLevel(combo))}` as "combo1") : "correct"); }} />
          </>
        ) : play.kind === "order" ? (
          <>
            <Text style={styles.prompt}>Toque nos acontecimentos na ordem em que aconteceram.</Text>
            <Text style={styles.hint}>Desafio da unidade: toque de novo para desfazer.</Text>
            <OrderExercise key={play.id} items={play.items} correctOrder={play.correctOrder} onDone={finishBonus} />
          </>
        ) : play.kind === "passage" ? (
          <>
            <Text style={styles.prompt}>De qual passagem vem isto?</Text>
            <Text style={styles.hint}>Ligue o que você aprendeu ao texto bíblico.</Text>
            <PassageExercise key={play.id} statement={play.statement} options={play.options} correctId={play.correctId} onDone={finishBonus} />
          </>
        ) : (
          <>
            <Text style={styles.prompt}>{play.presentation === "fill" || play.presentation === "type" ? "Complete com a palavra certa." : play.presentation === "blocks" ? "Monte a frase na ordem certa." : play.step.prompt}</Text>
            {play.presentation === "true-false" && play.trueFalse ? (
              <TrueFalseExercise setup={play.trueFalse} selectedIds={selectedIds} answer={answerState} onAnswer={(value) => { setSelectedIds([value]); submit([value]); }} />
            ) : play.step.type === "multiple-choice" ? (
              <ChoiceExercise exercise={play.step} selectedIds={selectedIds} onSelect={choose} answer={answerState} />
            ) : play.step.type === "fill-choice" && play.presentation === "type" ? (
              <TypeExercise exercise={play.step} value={typed} onChange={(text) => { if (!feedback) setTyped(text); }} onSubmit={() => { if (typed.trim()) submit(["typed"]); }} answer={answerState} />
            ) : play.step.type === "fill-choice" ? (
              <FillExercise exercise={play.step} selectedIds={selectedIds} onSelect={choose} answer={answerState} />
            ) : (
              <BlocksExercise exercise={play.step} selectedIds={selectedIds} onSelect={(ids) => { if (!feedback) { playFeedback("select"); setSelectedIds(ids); } }} answer={answerState} />
            )}
          </>
        )}
      </ScrollView>

      {/* Ação principal */}
      {!feedback ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
          {play.kind === "learn" ? (
            <View style={styles.row}>
              <Pressable accessibilityRole="button" accessibilityLabel="Perguntar ao Professor Noah" onPress={() => openNoah()} style={styles.noahButton}><Image source={noahPortrait} style={styles.noahPortrait} contentFit="cover" accessibilityElementsHidden /></Pressable>
              <Pressable accessibilityRole="button" onPress={moveToNext} style={({ pressed }) => [styles.primary, styles.flex, pressed && styles.primaryPressed]}><Text style={styles.primaryText}>{isLast ? "Concluir" : "Continuar"}</Text></Pressable>
            </View>
          ) : play.kind !== "exercise" ? (
            <Pressable accessibilityRole="button" disabled={!matchDone} onPress={moveToNext} style={({ pressed }) => [styles.primary, !matchDone && styles.primaryDisabled, pressed && styles.primaryPressed]}><Text style={[styles.primaryText, !matchDone && styles.primaryTextDisabled]}>{matchDone ? (isLast ? "Ver resultado" : "Continuar") : play.kind === "match" ? "Ligue todos os pares" : play.kind === "order" ? "Ordene todos" : "Escolha a passagem"}</Text></Pressable>
          ) : play.presentation === "true-false" ? null : play.presentation === "type" ? (
            <Pressable accessibilityRole="button" disabled={!typed.trim()} onPress={() => submit(["typed"])} style={({ pressed }) => [styles.primary, !typed.trim() && styles.primaryDisabled, pressed && styles.primaryPressed]}><Text style={[styles.primaryText, !typed.trim() && styles.primaryTextDisabled]}>Verificar</Text></Pressable>
          ) : (
            <Pressable accessibilityRole="button" disabled={!selectedIds.length} onPress={() => submit()} style={({ pressed }) => [styles.primary, !selectedIds.length && styles.primaryDisabled, pressed && styles.primaryPressed]}><Text style={[styles.primaryText, !selectedIds.length && styles.primaryTextDisabled]}>Verificar</Text></Pressable>
          )}
        </View>
      ) : null}

      {/* Painel de resposta */}
      {feedback && play.kind === "exercise" ? (
        <Animated.View accessibilityLiveRegion="polite" style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 4, backgroundColor: feedback.correct ? palette.successSoft : palette.errorSoft, borderTopColor: feedback.correct ? palette.success : palette.error, transform: [{ translateY: sheetY }] }]}>
          <View style={styles.sheetHeader}>
            {feedback.correct ? (
              <Image source={lumiAnimationAssets.pular} style={styles.sheetLumi} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi comemorando" />
            ) : (
              <LumiCharacter mood="encouragement" motion="encouraging" style={styles.sheetLumi} accessibilityLabel="Lumi encorajando" />
            )}
            <View style={styles.flex}>
              <Text style={[styles.sheetTitle, { color: feedback.correct ? palette.success : palette.error }]}>{feedback.title}</Text>
              {feedback.correctAnswer ? <Text style={styles.sheetAnswer}>Resposta certa: <Text style={styles.sheetAnswerStrong}>{feedback.correctAnswer}</Text></Text> : null}
            </View>
          </View>
          <Text style={styles.sheetText} numberOfLines={6}>{feedback.explanation}</Text>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" onPress={() => openNoah(feedback.correct ? undefined : "Explique por que minha resposta está errada usando a correção editorial e o fundamento bíblico.")} style={styles.sheetSecondary}>
              <Text style={[styles.sheetSecondaryText, { color: feedback.correct ? palette.success : palette.error }]}>{feedback.correct ? "Por quê?" : "Entender"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={moveToNext} style={({ pressed }) => [styles.primary, styles.flex, { backgroundColor: feedback.correct ? palette.cta : palette.error, borderBottomColor: feedback.correct ? palette.ctaShadow : "#8f2238" }, pressed && styles.primaryPressed]}>
              <Text style={[styles.primaryText, !feedback.correct && { color: "#ffffff" }]}>{isLast ? "Ver resultado" : "Continuar"}</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}

      <HeartsGate visible={heartsGateOpen} maxHearts={progress.settings.maxHearts} closeLabel="Sair da lição" onReview={() => { setHeartsGateOpen(false); router.replace("/review"); }} onClose={() => { setHeartsGateOpen(false); router.back(); }} />
      <ProfessorNoahModal visible={noahOpen} context={noahContext} contextKey={`${kind}:${activity.id}:${play.id}`} autoQuestion={noahAutoQuestion} onClose={() => setNoahOpen(false)} />
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  center: { alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  closeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  track: { flex: 1, height: 16, borderRadius: 8, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 8, backgroundColor: p.cta },
  fillShine: { position: "absolute", top: 3, left: 8, right: 8, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)" },
  combo: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, height: 30, borderRadius: 15, backgroundColor: p.streak },
  comboText: { color: "#ffffff", fontWeight: "900", fontSize: 14 },
  hearts: { flexDirection: "row", alignItems: "center", gap: 4 },
  heartsText: { color: p.heartText, fontWeight: "900", fontSize: 16 },
  content: { paddingHorizontal: 18, paddingTop: 6, gap: 16 },
  kindPill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: p.activeTabBg },
  kindPillText: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  learn: { gap: 14 },
  lumiWave: { alignSelf: "center", width: 120, height: 120 },
  title: { color: p.text, fontSize: 26, lineHeight: 32, fontWeight: "900" },
  body: { color: p.text, fontSize: 17, lineHeight: 27 },
  keyPoints: { gap: 10, padding: 14, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  keyPoint: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  keyDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: p.accent, marginTop: 1 },
  keyText: { flex: 1, color: p.text, fontSize: 16, lineHeight: 23, fontWeight: "600" },
  refRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  refPill: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: p.line, backgroundColor: p.card },
  refText: { color: p.accent, fontWeight: "800", fontSize: 14 },
  sources: { gap: 4, padding: 12, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  sourcesToggle: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  sourcesTitle: { flex: 1, color: p.text, fontWeight: "800" },
  sourceItem: { gap: 2, paddingVertical: 4 },
  sourceName: { color: p.accent, fontWeight: "800", textDecorationLine: "underline" },
  sourceMeta: { color: p.textMuted, fontSize: 12, lineHeight: 17 },
  prompt: { color: p.text, fontSize: 22, lineHeight: 30, fontWeight: "900" },
  hint: { color: p.textMuted, fontSize: 14, marginTop: -8 },
  bottomBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.divider, backgroundColor: p.ground },
  primary: { minHeight: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryPressed: { borderBottomWidth: 2, marginTop: 3 },
  primaryDisabled: { backgroundColor: p.node, borderBottomColor: p.nodeShadow },
  primaryText: { color: p.ctaText, fontSize: 17, fontWeight: "900", letterSpacing: 0.3 },
  primaryTextDisabled: { color: p.textMuted },
  noahButton: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 2, borderColor: p.xp },
  noahPortrait: { width: 52, height: 52, borderRadius: 14 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 16, gap: 12, borderTopWidth: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetLumi: { width: 64, height: 64 },
  sheetTitle: { fontSize: 22, fontWeight: "900" },
  sheetAnswer: { color: p.text, fontSize: 14, marginTop: 2 },
  sheetAnswerStrong: { fontWeight: "900" },
  sheetText: { color: p.text, fontSize: 15, lineHeight: 22 },
  sheetSecondary: { minHeight: 56, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  sheetSecondaryText: { fontSize: 15, fontWeight: "900" }
});
