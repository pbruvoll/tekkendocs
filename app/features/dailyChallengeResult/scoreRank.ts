import { type T8Rank, t8Ranks } from '~/constants/t8Ranks';

const allRanks = t8Ranks;

// Explicit score-to-rank table for quick remapping.
const rankByScore: Record<number, T8Rank | undefined> = {
  0: allRanks[0],
  1: allRanks[allRanks.length - 16],
  2: allRanks[allRanks.length - 15],
  3: allRanks[allRanks.length - 14],
  4: allRanks[allRanks.length - 13],
  5: allRanks[allRanks.length - 12],
  6: allRanks[allRanks.length - 11],
  7: allRanks[allRanks.length - 10],
  8: allRanks[allRanks.length - 9],
  9: allRanks[allRanks.length - 8],
  10: allRanks[allRanks.length - 1],
};

export const getRankForScore = (
  score: number,
  totalQuestions: number,
): T8Rank | undefined => {
  const clampedScore = Math.max(0, Math.min(score, totalQuestions));
  return rankByScore[clampedScore];
};
