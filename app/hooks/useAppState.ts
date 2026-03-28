import { useEffect, useState } from 'react';
import { type AppState, appStateSchema } from '~/types/AppState';

export const useAppState = (): [
  AppState,
  (newAppState: AppState) => void,
  boolean,
] => {
  const [appState, setAppState] = useState<AppState>({
    reactChallenge: {
      completedLowBlocks: [],
    },
    dailyChallenge: {
      dailyResultsByDate: {},
      currentCompletedAnswers: null,
      currentStreak: 0,
      lastCompletedDate: null,
      inProgress: null,
    },
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedAppState = localStorage.getItem('appState');
    if (storedAppState) {
      try {
        const parsedState = JSON.parse(storedAppState);
        const stored = appStateSchema.parse(parsedState);

        setAppState({
          reactChallenge: {
            completedLowBlocks: stored.reactChallenge.completedLowBlocks,
          },
          dailyChallenge: {
            dailyResultsByDate: stored.dailyChallenge.dailyResultsByDate,
            currentCompletedAnswers:
              stored.dailyChallenge.currentCompletedAnswers,
            currentStreak: stored.dailyChallenge.currentStreak,
            lastCompletedDate: stored.dailyChallenge.lastCompletedDate,
            inProgress: stored.dailyChallenge.inProgress || null,
          },
        });
      } catch (e) {
        console.warn('can not parse appState', e);
      } finally {
        setIsHydrated(true);
      }
    } else {
      setIsHydrated(true);
    }
  }, []);

  return [
    appState,
    (newAppState: AppState) => {
      localStorage.setItem('appState', JSON.stringify(newAppState));
      setAppState(newAppState);
    },
    isHydrated,
  ];
};
