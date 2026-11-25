import { quizSoundsEnabledStore } from './quizSoundsEnabledStore';

const sounds: Record<string, HTMLAudioElement> = {};

/** Call from the answer click itself: browsers only allow audio after a user gesture. */
export const playAnswerSound = (isCorrect: boolean) => {
  if (!quizSoundsEnabledStore.getSnapshot()) return;

  const url = isCorrect ? '/sounds/quiz-correct.mp3' : '/sounds/quiz-wrong.mp3';
  sounds[url] ??= new Audio(url);
  const audio = sounds[url];
  audio.currentTime = 0;
  audio.play().catch(() => {});
};
