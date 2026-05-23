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

export const deterministicSample = <T>(
  values: T[],
  sampleCount: number,
  seedValue: string,
): T[] => {
  if (sampleCount >= values.length) {
    return [...values];
  }

  const random = createRandom(seedValue);
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  return shuffled.slice(0, sampleCount);
};

export const appendRecentQuestionId = (
  recentQuestionIds: string[],
  questionId: string,
  maxRecentCount: number,
): string[] => {
  return [...recentQuestionIds, questionId].slice(-maxRecentCount);
};

export const pickRandomQuizMoveExcludingRecent = (
  moves: QuizMove[],
  recentQuestionIds: string[],
): QuizMove | null => {
  if (!moves.length) {
    return null;
  }

  const excludedIds = new Set(recentQuestionIds);
  const candidateMoves = moves.filter((move) => !excludedIds.has(move.id));
  const pool = candidateMoves.length > 0 ? candidateMoves : moves;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || null;
};
