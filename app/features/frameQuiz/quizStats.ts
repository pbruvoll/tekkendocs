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

type LocalStorageStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  write: (value: T) => void;
  clear: () => void;
};

function createLocalStorageStore<T>(
  key: string,
  defaultValue: T,
  parse: (raw: unknown) => T,
): LocalStorageStore<T> {
  const listeners = new Set<() => void>();

  function emit() {
    for (const l of listeners) l();
  }

  let cachedRaw: string | null = null;
  let cachedValue: T = defaultValue;

  function getSnapshot(): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        cachedRaw = null;
        cachedValue = defaultValue;
        return defaultValue;
      }
      if (stored === cachedRaw) return cachedValue;
      cachedRaw = stored;
      cachedValue = parse(JSON.parse(stored));
      return cachedValue;
    } catch {
      return defaultValue;
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) emit();
      };
      window.addEventListener('storage', handleStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', handleStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => defaultValue,
    write(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore storage write failures (e.g. quota exceeded/private mode).
      }
      emit();
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }
      emit();
    },
  };
}

export const quizStatsStore = createLocalStorageStore(
  't8FrameQuizStatsV1',
  defaultPersistedFrameQuizStats,
  sanitizePersistedFrameQuizStats,
);

export const charQuizStatsStore = createLocalStorageStore(
  't8FrameQuizStatsByCharsV1',
  {} as PersistedCharFrameQuizData,
  sanitizePersistedCharFrameQuizStats,
);
