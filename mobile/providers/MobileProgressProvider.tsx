import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { finishActivity, createLessonSession, recordAnswer } from "../domain/progress";
import { loadProgress, saveProgress } from "../services/progressStorage";
import type { ActiveLessonSession, CompletionResult, MobileProgress } from "../types/progress";

interface MobileProgressContextValue {
  progress: MobileProgress;
  hydrated: boolean;
  startActivity: (activityId: string) => ActiveLessonSession;
  setStepIndex: (stepIndex: number) => void;
  answerQuestion: (questionId: string, correct: boolean) => void;
  completeActivity: (
    activityId: string,
    total: number,
    correct: number,
    checkpoint: boolean,
    passAccuracy?: number
  ) => CompletionResult;
}

const MobileProgressContext = createContext<MobileProgressContextValue | null>(null);

const EMPTY_PROGRESS: MobileProgress = {
  schemaVersion: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  completedLessonIds: [],
  completedCheckpointIds: [],
  perfectLessonIds: [],
  incorrectQuestionIds: []
};

export function MobileProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<MobileProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    loadProgress().then((stored) => {
      if (!active) return;
      setProgress(stored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress).catch(() => {
      // A sessão continua em memória. A próxima alteração tentará salvar novamente.
    });
  }, [hydrated, progress]);

  const startActivity = useCallback((activityId: string) => {
    if (progress.activeLesson?.activityId === activityId) return progress.activeLesson;
    const session = createLessonSession(activityId);
    setProgress((current) => ({ ...current, activeLesson: session }));
    return session;
  }, [progress.activeLesson]);

  const setStepIndex = useCallback((stepIndex: number) => {
    setProgress((current) => current.activeLesson
      ? { ...current, activeLesson: { ...current.activeLesson, stepIndex } }
      : current);
  }, []);

  const answerQuestion = useCallback((questionId: string, correct: boolean) => {
    setProgress((current) => {
      if (!current.activeLesson) return current;
      const activeLesson = recordAnswer(current.activeLesson, questionId, correct);
      return {
        ...current,
        activeLesson,
        incorrectQuestionIds: correct
          ? current.incorrectQuestionIds
          : current.incorrectQuestionIds.includes(questionId)
            ? current.incorrectQuestionIds
            : [...current.incorrectQuestionIds, questionId]
      };
    });
  }, []);

  const completeActivity = useCallback((
    activityId: string,
    total: number,
    correct: number,
    checkpoint: boolean,
    passAccuracy?: number
  ) => {
    const result = finishActivity(progress, activityId, total, correct, checkpoint, passAccuracy);
    setProgress(result.progress);
    return result;
  }, [progress]);

  const value = useMemo(() => ({
    progress,
    hydrated,
    startActivity,
    setStepIndex,
    answerQuestion,
    completeActivity
  }), [progress, hydrated, startActivity, setStepIndex, answerQuestion, completeActivity]);

  return (
    <MobileProgressContext.Provider value={value}>
      {children}
    </MobileProgressContext.Provider>
  );
}

export function useMobileProgress() {
  const context = useContext(MobileProgressContext);
  if (!context) throw new Error("useMobileProgress deve ser usado dentro de MobileProgressProvider");
  return context;
}
