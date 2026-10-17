import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { exerciseById, getBookForActivity, orderedLessons } from "../../../src/content/catalog";
import { deepenExerciseById, deepenReviewExerciseByQuestionId } from "../../../src/content/deepen/catalog";
import { greekExerciseById } from "../../../src/content/greek/catalog";
import { getReviewQueue, reviewReason, summarizeReviewQueue } from "../../../src/domain/review";
import type { Exercise } from "../../../src/types/content";
import { ExerciseCard } from "../../components/ExerciseCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProfessorNoahModal } from "../../components/ProfessorNoahModal";
import { Screen } from "../../components/Screen";
import { isExerciseAnswerCorrect } from "../../domain/exercises";
import {
  buildMobileLearningProfile,
  exerciseAnswerText,
  exerciseCorrectAnswerText,
  exerciseOptions,
  exercisePrompt,
  type NoahContext
} from "../../domain/noah";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";\nimport { useFeedbackEffects } from "../../hooks/useFeedbackEffects";

function exerciseFor(questionId: string): Exercise | undefined {
  return deepenReviewExerciseByQuestionId.get(questionId)
    ?? greekExerciseById.get(questionId)
    ?? exerciseById.get(questionId);
}

function lessonForQuestion(questionId: string) {
  return orderedLessons.find((lesson) => lesson.steps.some((step) => step.type !== "learn" && step.id === questionId));
}

export default function ReviewScreen() {
  const { progress, answerQuestion } = useMobileProgress();\n  const playFeedback = useFeedbackEffects(progress.settings);
  const queue = useMemo(() => getReviewQueue(progress.reviewItems), [progress.reviewItems]);
  const summary = useMemo(() => summarizeReviewQueue(queue), [queue]);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<boolean>();
  const [noahOpen, setNoahOpen] = useState(false);
  const currentId = sessionIds[index];
  const item = queue.find((candidate) => candidate.questionId === currentId);
  const exercise = currentId ? exerciseFor(currentId) : undefined;
  const lesson = currentId ? lessonForQuestion(currentId) : undefined;
  const book = lesson ? getBookForActivity(lesson.id) : undefined;

  const start = () => {
    setSessionIds(queue.map((candidate) => candidate.questionId).filter((id) => Boolean(exerciseFor(id))).slice(0, 10));
    setIndex(0);
    setSelectedIds([]);
    setFeedback(undefined);
  };

  if (!exercise || !item) {
    return (
      <Screen>
        <Text style={styles.eyebrow}>REPETIÇÃO ESPAÇADA</Text>
        <Text style={styles.title}>Revisar</Text>
        <Text style={styles.body}>Erros recorrentes aparecem primeiro. As questões vêm das lições já existentes.</Text>
        <View style={styles.summary}>
          <Stat value={summary.total} label="para revisar" />
          <Stat value={summary.recentErrors} label="erros recentes" />
          <Stat value={summary.concepts} label="conceitos" />
        </View>
        {queue.length ? (
          <PrimaryButton onPress={start}>Começar revisão · até 10</PrimaryButton>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.cardTitle}>Tudo em dia</Text>
            <Text style={styles.body}>Continue estudando. Quando algo precisar de reforço, aparecerá aqui.</Text>
          </View>
        )}
      </Screen>
    );
  }

  const context: NoahContext = {
    area: "bible",
    title: `Revisão · ${book?.title ?? "Bíblia"}`,
    reference: exercise.reference.label,
    currentQuestion: exercisePrompt(exercise),
    selectedAnswer: feedback !== undefined ? exerciseAnswerText(exercise, selectedIds) : undefined,
    correctAnswer: feedback !== undefined ? exerciseCorrectAnswerText(exercise) : undefined,
    options: exerciseOptions(exercise),
    answerStatus: feedback === undefined ? "unanswered" : feedback ? "correct" : "incorrect",
    difficulty: exercise.difficulty,
    conceptId: exercise.conceptId,
    lessonId: lesson?.id,
    questionId: exercise.id,
    learningProfile: buildMobileLearningProfile(progress, exercise.conceptId)
  };

  return (
    <>
      <Screen>
        <Text style={styles.eyebrow}>REVISÃO {index + 1} DE {sessionIds.length}</Text>
        <Text style={styles.reason}>{reviewReason(item)}</Text>
        <ExerciseCard exercise={exercise} selectedIds={selectedIds} onChange={setSelectedIds} locked={feedback !== undefined} />
        {feedback !== undefined ? (
          <View style={[styles.feedback, feedback ? styles.correct : styles.wrong]}>
            <Text style={styles.cardTitle}>{feedback ? "Boa recuperação" : "Vamos reforçar este ponto"}</Text>
            <Text style={styles.body}>{exercise.explanation}</Text>
          </View>
        ) : null}
        {feedback === undefined ? (
          <PrimaryButton disabled={!selectedIds.length} onPress={() => {
            const correct = isExerciseAnswerCorrect(exercise, selectedIds);
            setFeedback(correct);
            answerQuestion(exercise.id, correct, {
              conceptId: exercise.conceptId,
              lessonId: lesson?.id ?? "review",
              mode: "review"
            });
          }}>Verificar resposta</PrimaryButton>
        ) : (
          <>
            {!feedback ? <PrimaryButton variant="secondary" onPress={() => setNoahOpen(true)}>Entender com Noah</PrimaryButton> : null}
            <PrimaryButton onPress={() => {
              if (index + 1 >= sessionIds.length) {
                setSessionIds([]);
                setIndex(0);
              } else setIndex((value) => value + 1);
              setSelectedIds([]);
              setFeedback(undefined);
            }}>{index + 1 >= sessionIds.length ? "Concluir revisão" : "Continuar"}</PrimaryButton>
          </>
        )}
      </Screen>
      <ProfessorNoahModal visible={noahOpen} context={context} contextKey={`review:${exercise.id}`} autoQuestion="Explique meu erro e recomende como revisar este conceito." onClose={() => setNoahOpen(false)} />
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},
  title:{color:colors.navy,fontSize:30,fontWeight:"900"},
  body:{color:colors.text,fontSize:16,lineHeight:24},
  summary:{flexDirection:"row",gap:spacing.sm},
  stat:{flex:1,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,alignItems:"center"},
  statValue:{color:colors.navy,fontSize:22,fontWeight:"900"},statLabel:{color:colors.muted,fontSize:11,textAlign:"center"},
  empty:{alignItems:"center",gap:spacing.sm,backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.xl,borderWidth:1,borderColor:colors.border},
  emptyIcon:{fontSize:34,color:colors.success,fontWeight:"900"},cardTitle:{color:colors.navy,fontSize:18,fontWeight:"900"},
  reason:{color:colors.tealDark,backgroundColor:"#e8f7f4",padding:spacing.md,borderRadius:radius.md,lineHeight:21},
  feedback:{borderRadius:radius.md,borderWidth:2,padding:spacing.lg,gap:spacing.sm},
  correct:{backgroundColor:"#e8f7ef",borderColor:colors.success},wrong:{backgroundColor:"#fff0f2",borderColor:colors.error}
});
