export const GAMIFICATION = {
  xp: { exercise: 5, lesson: 20, perfectLesson: 10, checkpoint: 50, reviewCorrect: 3 },
  levelCurveBase: 80,
  hearts: { initial: 5, recoveredPerReview: 1 },
  dailyGoals: { casual: 50, regular: 100, dedicated: 150, intense: 200 },
  reviewIntervalsDays: [0, 1, 3, 7, 14, 30] as const
} as const;

export const CONTENT_VERSION = 6;
