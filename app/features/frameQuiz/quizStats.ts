export const RECENT_ANSWER_WINDOW = 200;

export type PersistedFrameQuizStats = {
  personalBestStreak: number;
  lifetimeAnsweredCount: number;
  recentAnswerResults: boolean[];
};

export type QuizDifficulty = 'normal';

export type PersistedCharFrameQuizData = {
  [D in QuizDifficulty]?: Record<string, PersistedFrameQuizStats>;
};

export const defaultPersistedFrameQuizStats: PersistedFrameQuizStats = {
  personalBestStreak: 0,
  lifetimeAnsweredCount: 0,
  recentAnswerResults: [],
};

export const sanitizePersistedFrameQuizStats = (
  value: unknown,
): PersistedFrameQuizStats => {
  if (!value || typeof value !== 'object') {
    return defaultPersistedFrameQuizStats;
  }

  const candidate = value as Partial<PersistedFrameQuizStats>;
  const personalBestStreak = Number.isFinite(candidate.personalBestStreak)
    ? Math.max(0, Math.floor(candidate.personalBestStreak ?? 0))
    : 0;
  const lifetimeAnsweredCount = Number.isFinite(candidate.lifetimeAnsweredCount)
    ? Math.max(0, Math.floor(candidate.lifetimeAnsweredCount ?? 0))
    : 0;
  const recentAnswerResults = Array.isArray(candidate.recentAnswerResults)
    ? candidate.recentAnswerResults
        .filter((answer): answer is boolean => typeof answer === 'boolean')
        .slice(-RECENT_ANSWER_WINDOW)
    : [];

  return { personalBestStreak, lifetimeAnsweredCount, recentAnswerResults };
};

export const sanitizePersistedCharFrameQuizStats = (
  value: unknown,
): PersistedCharFrameQuizData => {
  if (!value || typeof value !== 'object') return {};
  const candidate = value as Record<string, unknown>;
  const normalData = candidate['normal'];
  if (!normalData || typeof normalData !== 'object') return {};
  const normal: Record<string, PersistedFrameQuizStats> = {};
  for (const [charId, charStats] of Object.entries(
    normalData as Record<string, unknown>,
  )) {
    if (typeof charId === 'string') {
      normal[charId] = sanitizePersistedFrameQuizStats(charStats);
    }
  }
  return { normal };
};

export const computeNextStats = (
  current: PersistedFrameQuizStats,
  isCorrect: boolean,
  nextConsecutiveStreak: number,
): PersistedFrameQuizStats => {
  const nextRecentAnswerResults = [...current.recentAnswerResults, isCorrect];
  const trimmedRecentAnswerResults =
    nextRecentAnswerResults.length <= RECENT_ANSWER_WINDOW
      ? nextRecentAnswerResults
      : nextRecentAnswerResults.slice(-RECENT_ANSWER_WINDOW);
  return {
    personalBestStreak: Math.max(
      current.personalBestStreak,
      nextConsecutiveStreak,
    ),
    lifetimeAnsweredCount: current.lifetimeAnsweredCount + 1,
    recentAnswerResults: trimmedRecentAnswerResults,
  };
};

export const updateCharData = (
  current: PersistedCharFrameQuizData,
  charId: string,
  isCorrect: boolean,
  nextConsecutiveStreak: number,
): PersistedCharFrameQuizData => ({
  ...current,
  normal: {
    ...current.normal,
    [charId]: computeNextStats(
      current.normal?.[charId] ?? defaultPersistedFrameQuizStats,
      isCorrect,
      nextConsecutiveStreak,
    ),
  },
});

export const loadCharQuizStats = (key: string): PersistedCharFrameQuizData => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return {};
    return sanitizePersistedCharFrameQuizStats(JSON.parse(stored));
  } catch {
    return {};
  }
};

export const saveCharQuizStats = (
  key: string,
  data: PersistedCharFrameQuizData,
): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage write failures (e.g. quota exceeded/private mode).
  }
};
