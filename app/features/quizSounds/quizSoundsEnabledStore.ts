import { createLocalStorageStore } from '~/utils/localStorageStore';

export const quizSoundsEnabledStore = createLocalStorageStore<boolean>(
  't8_quizSoundsEnabled',
  true,
  (raw) => raw !== false,
);
