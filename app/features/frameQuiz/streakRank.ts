import { t8Ranks } from '~/constants/t8Ranks';

type FrameQuizRank = {
  image: string;
  name: string;
};

const isNonEmptyArray = <T>(array: T[]): array is [T, ...T[]] =>
  array.length > 0;

const allRanksRaw = t8Ranks.map(({ image, name }) => ({ image, name }));

if (!isNonEmptyArray(allRanksRaw)) {
  throw new Error('Expected t8Ranks to contain at least one rank.');
}

const allRanks: [FrameQuizRank, ...FrameQuizRank[]] = allRanksRaw;

export const getFrameQuizRankForStreak = (streak: number): FrameQuizRank => {
  const safeStreak = Number.isFinite(streak)
    ? Math.max(0, Math.floor(streak))
    : 0;
  const clampedIndex = Math.min(safeStreak, allRanks.length - 1);
  return allRanks[clampedIndex];
};
