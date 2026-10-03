import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode
} from "react";
import { GAMIFICATION } from "../config/gamification";
import { initialState } from "./initialState";
import { evaluateAchievements } from "../domain/achievements";
import { registerReviewResult } from "../domain/review";
import { toLocalDateKey, updateStreak } from "../domain/streak";
import { loadState, replaceState, saveState } from "../storage/database";
import type { AppState, StudyGoal } from "../types/progress";

export const initialState: AppState = {
  schemaVersion: 1,
  contentVersion: CONTENT_VERSION,
  profile: { onboarded: false, goal: "daily-habit", dailyGoal: 100 },
  settings: { heartsEnabled: true, maxHearts: GAMIFICATION.hearts.initial },
  xp: 0,
  hearts: GAMIFICATION.hearts.initial,
  streak: 0,
  bestStreak: 0,
  completedLessonIds: [],
  completedCheckpointIds: [],
  perfectLessonIds: [],
  attempts: [],
  reviewItems: [],
  earnedAchievementIds: [],
  activity: {},
  promptsGenerated: {},
  storageRevision: 0
};

type Action =
  | { type: "ONBOARD"; goal: StudyGoal; dailyGoal: 50 | 100 | 150 | 200 }
  | { type: "START_SESSION"; lessonId: string }
  | { type: "SET_STEP"; stepIndex: number }
  | {
      type: "ANSWER";
      questionId: string;
      lessonId: string;
      conceptId: string;
      difficulty: "easy" | "medium" | "hard";
      correct: boolean;
      mode: "lesson" | "checkpoint" | "review";
    }
  | {
      type: "FINISH";
      lessonId: string;
      checkpoint: boolean;
      perfect: boolean;
      passed: boolean;
      durationSeconds: number;
    }
  | { type: "PROMPT"; promptType: string }
  | { type: "TOGGLE_HEARTS"; enabled: boolean }
  | { type: "IMPORT"; state: AppState };

function touchStudy(state: AppState, xp: number, seconds = 0, lessons = 0): AppState {
  const now = new Date();
  const streak = updateStreak(state.lastStudyDate, state.streak, state.bestStreak, now);
  const date = toLocalDateKey(now);
  const activity = state.activity[date] ?? { date, xp: 0, seconds: 0, lessons: 0 };
  return {
    ...state,
    ...streak,
    xp: state.xp + xp,
    activity: {
      ...state.activity,
      [date]: {
        ...activity,
        xp: activity.xp + xp,
        seconds: activity.seconds + seconds,
        lessons: activity.lessons + lessons
      }
    }
  };
}

function finalize(state: AppState): AppState {
  const earned = new Set([...state.earnedAchievementIds, ...evaluateAchievements(state)]);
  return {
    ...state,
    earnedAchievementIds: [...earned],
    storageRevision: state.storageRevision + 1
  };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ONBOARD":
      return finalize({
        ...state,
        profile: {
          ...state.profile,
          onboarded: true,
          goal: action.goal,
          dailyGoal: action.dailyGoal
        }
      });

    case "START_SESSION":
      if (state.activeSession?.lessonId === action.lessonId) return state;
      return finalize({
        ...state,
        activeSession: {
          lessonId: action.lessonId,
          stepIndex: 0,
          startedAt: new Date().toISOString(),
          answers: {}
        }
      });

    case "SET_STEP":
      if (!state.activeSession) return state;
      return finalize({
        ...state,
        activeSession: { ...state.activeSession, stepIndex: Math.max(0, action.stepIndex) }
      });

    case "ANSWER": {
      const alreadyAnswered =
        action.mode !== "review" && state.activeSession?.answers[action.questionId] !== undefined;
      if (alreadyAnswered) return state;

      const now = new Date();
      const currentReview = state.reviewItems.find((item) => item.questionId === action.questionId);
      const shouldTrackReview = !action.correct || action.mode === "review" || Boolean(currentReview);
      const nextReview = shouldTrackReview
        ? registerReviewResult(currentReview, {
            questionId: action.questionId,
            conceptId: action.conceptId,
            correct: action.correct,
            now
          })
        : undefined;
      const reviewItems = nextReview
        ? [...state.reviewItems.filter((item) => item.questionId !== action.questionId), nextReview]
        : state.reviewItems;

      const xp =
        action.mode === "review"
          ? action.correct
            ? GAMIFICATION.xp.reviewCorrect
            : 0
          : GAMIFICATION.xp.exercise;
      const session =
        action.mode === "review" || !state.activeSession
          ? state.activeSession
          : {
              ...state.activeSession,
              answers: { ...state.activeSession.answers, [action.questionId]: action.correct }
            };
      const heartsLost =
        !action.correct && action.mode !== "review" && state.settings.heartsEnabled ? 1 : 0;
      const heartsRecovered =
        action.correct && action.mode === "review" ? GAMIFICATION.hearts.recoveredPerReview : 0;

      const next = touchStudy(
        {
          ...state,
          activeSession: session,
          hearts: Math.min(
            state.settings.maxHearts,
            Math.max(0, state.hearts - heartsLost + heartsRecovered)
          ),
          reviewItems,
          attempts: [
            ...state.attempts,
            {
              id: action.questionId + "-" + now.getTime(),
              questionId: action.questionId,
              lessonId: action.lessonId,
              correct: action.correct,
              difficulty: action.difficulty,
              answeredAt: now.toISOString(),
              mode: action.mode
            }
          ]
        },
        xp
      );
      return finalize(next);
    }

    case "FINISH": {
      const bonus = action.passed
        ? action.checkpoint
          ? GAMIFICATION.xp.checkpoint
          : GAMIFICATION.xp.lesson + (action.perfect ? GAMIFICATION.xp.perfectLesson : 0)
        : 0;
      const completedLessonIds =
        !action.checkpoint && action.passed
          ? [...new Set([...state.completedLessonIds, action.lessonId])]
          : state.completedLessonIds;
      const completedCheckpointIds =
        action.checkpoint && action.passed
          ? [...new Set([...state.completedCheckpointIds, action.lessonId])]
          : state.completedCheckpointIds;
      const perfectLessonIds =
        !action.checkpoint && action.perfect
          ? [...new Set([...state.perfectLessonIds, action.lessonId])]
          : state.perfectLessonIds;
      return finalize(
        touchStudy(
          {
            ...state,
            completedLessonIds,
            completedCheckpointIds,
            perfectLessonIds,
            activeSession: undefined
          },
          bonus,
          action.durationSeconds,
          action.passed ? 1 : 0
        )
      );
    }

    case "PROMPT":
      return finalize({
        ...state,
        promptsGenerated: {
          ...state.promptsGenerated,
          [action.promptType]: (state.promptsGenerated[action.promptType] ?? 0) + 1
        }
      });

    case "TOGGLE_HEARTS":
      return finalize({
        ...state,
        settings: { ...state.settings, heartsEnabled: action.enabled },
        hearts: action.enabled ? Math.max(1, state.hearts) : state.settings.maxHearts
      });

    case "IMPORT":
      return { ...action.state, storageRevision: action.state.storageRevision + 1 };
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  ready: boolean;
  storageError?: string;
  importProgress: (state: AppState) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string>();

  useEffect(() => {
    let active = true;
    loadState()
      .then((stored) => {
        if (stored && active) dispatch({ type: "IMPORT", state: stored });
      })
      .catch(() => {
        if (active) setStorageError("O progresso está apenas nesta sessão. Exporte um backup antes de sair.");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      saveState(state).catch(() =>
        setStorageError("Não foi possível salvar agora. Seu estudo continua aberto nesta sessão.")
      );
    }, 120);
    return () => window.clearTimeout(timer);
  }, [state, ready]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      ready,
      storageError,
      importProgress: async (nextState) => {
        await replaceState(nextState);
        dispatch({ type: "IMPORT", state: nextState });
      }
    }),
    [state, ready, storageError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider");
  return context;
}
