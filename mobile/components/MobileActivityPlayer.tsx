import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getBookForActivity } from "../../src/content/catalog";
import { nextBookActivityId } from "../../src/domain/unlocks";
import type { LessonStep } from "../../src/types/content";
import { ExerciseCard } from "./ExerciseCard";
import { ProfessorNoahModal } from "./ProfessorNoahModal";
import { PrimaryButton } from "./PrimaryButton";
import { ProgressBar } from "./ProgressBar";
import { Screen } from "./Screen";
import { isExerciseAnswerCorrect } from "../domain/exercises";
import {
  exerciseAnswerText,
  exerciseCorrectAnswerText,
  exerciseOptions,
  exercisePrompt,
  buildMobileLearningProfile,
  type NoahContext
} from "../domain/noah";
import {
  mobileActivityRoute,
  mobileHubRoute,
  nextActivityForKind,
  resolveMobileActivity,
  type MobileActivityKind
} from "../domain/activityCatalog";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";

export function MobileActivityPlayer({ fixedKind }: { fixedKind?: MobileActivityKind }) {
  const params = useLocalSearchParams<{ activityId: string; kind?: MobileActivityKind; journeyMode?: "canonical" | "individual"; journeyBookId?: string }>();
  const kind = fixedKind ?? params.kind ?? "bible";
  const activityId = params.activityId;
  const router = useRouter();
  const {
    progress,
    hydrated,
    startActivity,
    setStepIndex: persistStepIndex,
    answerQuestion,
    completeActivity
  } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const activity = activityId ? resolveMobileActivity(kind, activityId) : undefined;
  const steps = useMemo<LessonStep[]>(() => activity?.steps ?? [], [activity]);
  const lessonContent = useMemo(
    () => steps
      .filter((item) => item.type === "learn")
      .map((item) => `${item.title}: ${item.body}`)
      .join("\n\n"),
    [steps]
  );
  const exerciseTotal = steps.filter((step) => step.type !== "learn").length;
  const existingSession = progress.activeLesson?.activityId === activityId
    ? progress.activeLesson
    : undefined;
  const [stepIndex, setStepIndex] = useState(existingSession?.stepIndex ?? 0);
  const [correctCount, setCorrectCount] = useState(existingSession?.correct ?? 0);
  const [incorrectCount, setIncorrectCount] = useState(existingSession?.incorrect ?? 0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [noahOpen, setNoahOpen] = useState(false);
  const [noahAutoQuestion, setNoahAutoQuestion] = useState<string>();

  useEffect(() => {
    if (!hydrated || !activityId || !activity) return;
    const session = startActivity(activityId, params.journeyMode, params.journeyBookId);
    setStepIndex(session.stepIndex);
    setCorrectCount(session.correct);
    setIncorrectCount(session.incorrect);
    const resumedStep = steps[session.stepIndex];
    const resumedAnswer = resumedStep && resumedStep.type !== "learn"
      ? session.answers[resumedStep.id]
      : undefined;
    setFeedback(
      resumedStep && resumedStep.type !== "learn" && resumedAnswer !== undefined
        ? { correct: resumedAnswer, explanation: resumedStep.explanation }
        : null
    );
  }, [activity, activityId, hydrated, startActivity, steps]);

  const step = steps[stepIndex];
  if (!activity || !step) {
    return (
      <Screen>
        <Text style={styles.title}>Atividade não encontrada</Text>
        <Text style={styles.body}>Volte ao percurso e escolha uma atividade disponível.</Text>
        <PrimaryButton onPress={() => router.replace(mobileHubRoute(kind))}>Voltar ao percurso</PrimaryButton>
      </Screen>
    );
  }

  const area = kind;
  const noahContext: NoahContext = step.type === "learn"
    ? {
        area,
        title: `${activity.contextTitle} · ${activity.title} · ${step.title}`,
        reference: step.reference?.label,
        content: lessonContent || step.body,
        lessonId: activity.id,
        questionId: step.id,
        sources: step.sourceIds ?? activity.sourceIds
      }
    : {
        area,
        title: `${activity.contextTitle} · ${activity.title}`,
        objective: step.objective,
        reference: step.reference.label,
        content: lessonContent,
        currentQuestion: exercisePrompt(step),
        selectedAnswer: feedback ? exerciseAnswerText(step, selectedIds) || undefined : undefined,
        correctAnswer: feedback ? exerciseCorrectAnswerText(step) || undefined : undefined,
        options: exerciseOptions(step),
        answerStatus: feedback ? (feedback.correct ? "correct" : "incorrect") : "unanswered",
        difficulty: step.difficulty,
        conceptId: step.conceptId,
        lessonId: activity.id,
        questionId: step.id,
        learningProfile: buildMobileLearningProfile(progress, step.conceptId),
        sources: activity.sourceIds
      };

  const openNoah = (autoQuestion?: string) => {
    setNoahAutoQuestion(autoQuestion);
    setNoahOpen(true);
  };

  const moveToNext = () => {
    setNoahOpen(false);
    setNoahAutoQuestion(undefined);
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      setStepIndex(nextIndex);
      persistStepIndex(nextIndex);
      setSelectedIds([]);
      setFeedback(null);
      return;
    }
    const result = completeActivity(
      activity.id,
      exerciseTotal,
      correctCount,
      activity.checkpoint,
      activity.passAccuracy
    );
    const nextId = result.passed
      ? kind === "bible" && params.journeyMode === "individual"
        ? nextBookActivityId((getBookForActivity(activity.id)?.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]) ?? [activity.id]), result.progress.completedLessonIds, result.progress.completedCheckpointIds)
        : nextActivityForKind(kind, result.progress.completedLessonIds, result.progress.completedCheckpointIds)
      : activity.id;
    router.replace({
      pathname: "/result",
      params: {
        activityId: activity.id,
        activityTitle: activity.title,
        kind,
        nextId,
        journeyMode: params.journeyMode,
        journeyBookId: params.journeyBookId,
        correct: String(correctCount),
        incorrect: String(incorrectCount),
        total: String(exerciseTotal),
        xpEarned: String(result.xpEarned),
        passed: String(result.passed)
      }
    });
  };

  const submitAnswer = () => {
    if (step.type === "learn" || feedback || selectedIds.length === 0) return;
    const correct = isExerciseAnswerCorrect(step, selectedIds);
    const chosenId = selectedIds[0];
    const explanation = step.type !== "word-blocks" && chosenId
      ? step.optionExplanations?.[chosenId] ?? step.explanation
      : step.explanation;
    if (correct) setCorrectCount((value) => value + 1);
    else setIncorrectCount((value) => value + 1);
    answerQuestion(step.id, correct, {
      conceptId: step.conceptId,
      lessonId: activity.id,
      mode: kind === "bible" ? (activity.checkpoint ? "checkpoint" : "lesson") : kind
    });
    setFeedback({ correct, explanation });
  };

  const isLastStep = stepIndex === steps.length - 1;
  const openReference = () => {
    if (!step.reference) return;
    router.push({
      pathname: "/(tabs)/bible",
      params: {
        osis: step.reference.bookId,
        chapter: String(step.reference.startChapter),
        verse: step.reference.startVerse ? String(step.reference.startVerse) : undefined,
        returnActivityId: activity.id,
        returnKind: kind,
        returnJourneyMode: params.journeyMode,
        returnJourneyBookId: params.journeyBookId
      }
    });
  };
  return (
    <>
      <Screen>
        <View style={styles.top}>
          <Text style={styles.context}>{activity.contextTitle}</Text>
          <View style={styles.lessonStatus}>
            {progress.settings.heartsEnabled ? <Text style={styles.hearts}>♥ {progress.hearts}/{progress.settings.maxHearts}</Text> : null}
            <Text style={styles.counter}>{stepIndex + 1}/{steps.length}</Text>
          </View>
        </View>
        <ProgressBar value={(stepIndex + 1) / steps.length} />
        {step.type === "learn" ? (
          <View style={styles.learningCard}>
            <Text style={styles.learningLabel}>APRENDER</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.body}>{step.body}</Text>
            {step.keyPoints?.map((point) => (
              <View key={point} style={styles.keyPoint}>
                <View style={styles.bullet} />
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
            {step.reference ? <Pressable accessibilityRole="link" onPress={openReference} style={styles.referenceButton}><Text style={styles.reference}>{step.reference.label} · abrir na Bíblia</Text></Pressable> : null}
          </View>
        ) : (
          <>
            <Text style={styles.learningLabel}>
              {step.type === "multiple-choice" ? "MÚLTIPLA ESCOLHA" : step.type === "fill-choice" ? "COMPLETE" : "MONTE A FRASE"}
            </Text>
            <ExerciseCard exercise={step} selectedIds={selectedIds} onChange={setSelectedIds} locked={Boolean(feedback)} />
            {feedback ? (
              <View accessibilityLiveRegion="polite" style={[styles.feedback, feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
                <Text style={styles.feedbackTitle}>{feedback.correct ? "Resposta correta" : "Vamos aprender com este erro"}</Text>
                <Text style={styles.feedbackText}>{feedback.explanation}</Text>
                <Pressable accessibilityRole="link" onPress={openReference} style={styles.referenceButton}><Text style={styles.reference}>{step.reference.label} · abrir na Bíblia</Text></Pressable>
              </View>
            ) : null}
          </>
        )}
        {step.type === "learn" ? (
          <>
            <PrimaryButton variant="secondary" onPress={() => openNoah()}>Perguntar ao Noah</PrimaryButton>
            <PrimaryButton onPress={moveToNext}>{isLastStep ? "Concluir" : "Continuar"}</PrimaryButton>
          </>
        ) : feedback ? (
          <>
            <PrimaryButton variant="secondary" onPress={() => openNoah(
              feedback.correct ? undefined : "Explique por que minha resposta está errada usando a correção editorial e o fundamento bíblico."
            )}>
              {feedback.correct ? "Quer entender melhor?" : "Entender com Noah"}
            </PrimaryButton>
            <PrimaryButton onPress={moveToNext}>{isLastStep ? "Ver resultado" : "Continuar"}</PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton variant="text" onPress={() => openNoah()}>Perguntar ao Noah</PrimaryButton>
            <PrimaryButton onPress={submitAnswer} disabled={selectedIds.length === 0}>Verificar resposta</PrimaryButton>
          </>
        )}
      </Screen>
      <ProfessorNoahModal
        visible={noahOpen}
        context={noahContext}
        contextKey={`${kind}:${activity.id}:${step.id}`}
        autoQuestion={noahAutoQuestion}
        onClose={() => setNoahOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  top:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:spacing.md},
  context:{flex:1,color:colors.muted,fontSize:13,fontWeight:"700"},
  lessonStatus:{flexDirection:"row",alignItems:"center",gap:spacing.sm},
  hearts:{color:colors.rose,fontSize:13,fontWeight:"900"},
  counter:{color:colors.tealDark,fontSize:13,fontWeight:"900"},
  learningCard:{backgroundColor:colors.surface,borderRadius:radius.lg,borderColor:colors.border,borderWidth:1,padding:spacing.xl,gap:spacing.lg},
  learningLabel:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},
  title:{color:colors.navy,fontSize:25,lineHeight:32,fontWeight:"900"},
  body:{color:colors.text,fontSize:17,lineHeight:27},
  keyPoint:{flexDirection:"row",alignItems:"flex-start",gap:spacing.md},
  bullet:{width:9,height:9,borderRadius:5,backgroundColor:colors.gold,marginTop:8},
  keyPointText:{flex:1,color:colors.text,fontSize:16,lineHeight:24},
  reference:{color:colors.tealDark,fontSize:14,fontWeight:"800"},referenceButton:{minHeight:44,justifyContent:"center",alignSelf:"flex-start"},
  feedback:{borderRadius:radius.md,borderWidth:2,padding:spacing.lg,gap:spacing.sm},
  feedbackCorrect:{backgroundColor:"#e8f7ef",borderColor:colors.success},
  feedbackWrong:{backgroundColor:"#fff0f2",borderColor:colors.error},
  feedbackTitle:{color:colors.navy,fontSize:18,fontWeight:"900"},
  feedbackText:{color:colors.text,fontSize:16,lineHeight:24}
});
