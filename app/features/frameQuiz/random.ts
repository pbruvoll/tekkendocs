import { type QuizMove } from './types';

export const createSeed = (seedValue: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seedValue.length; i++) {
    hash ^= seedValue.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const createRandom = (seedValue: string): (() => number) => {
  let state = createSeed(seedValue);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

// Fisher-Yates shuffle of a copy of `values`. Pass a seeded `random` for
// deterministic output; defaults to Math.random.
const shuffle = <T>(values: T[], random: () => number = Math.random): T[] => {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }
  return shuffled;
};

export const deterministicSample = <T>(
  values: T[],
  sampleCount: number,
  seedValue: string,
): T[] => {
  if (sampleCount >= values.length) {
    return [...values];
  }

  return shuffle(values, createRandom(seedValue)).slice(0, sampleCount);
};

export const appendRecentQuestionId = (
  recentQuestionIds: string[],
  questionId: string,
  maxRecentCount: number,
): string[] => {
  return [...recentQuestionIds, questionId].slice(-maxRecentCount);
};

export const createQuestionBagExcludingRecent = (
  moves: QuizMove[],
  recentQuestionIds: string[],
): QuizMove[] => {
  if (!moves.length) {
    return [];
  }

  const excludedIds = new Set(recentQuestionIds);
  const candidateMoves = moves.filter((move) => !excludedIds.has(move.id));
  const pool = candidateMoves.length > 0 ? candidateMoves : moves;
  return shuffle(pool);
};

type TakeQuestionFromBagResult = {
  question: QuizMove | null;
  questionBag: QuizMove[];
  questionBagCursor: number;
};

export const takeQuestionFromBag = (
  currentQuestionBag: QuizMove[],
  currentQuestionBagCursor: number,
  moves: QuizMove[],
  recentQuestionIds: string[],
): TakeQuestionFromBagResult => {
  let questionBag = currentQuestionBag;
  let questionBagCursor = currentQuestionBagCursor;

  if (questionBagCursor >= questionBag.length) {
    questionBag = createQuestionBagExcludingRecent(moves, recentQuestionIds);
    questionBagCursor = 0;
  }

  const question = questionBag[questionBagCursor] || null;
  if (!question) {
    return {
      question: null,
      questionBag: [],
      questionBagCursor: 0,
    };
  }

  return {
    question,
    questionBag,
    questionBagCursor: questionBagCursor + 1,
  };
};
