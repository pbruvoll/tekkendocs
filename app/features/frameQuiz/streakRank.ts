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

// Streak threshold required to unlock each rank (must match allRanks.length).
// Curve: fast early ranks (+1), then slowing (+2, +3, +5), GoD VII (+8), GoD ∞ (+13 at 100).
const STREAK_THRESHOLDS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, // Ranks 0-16  (+1 each)
  18, 20, 22, 24, 26, 28,                                      // Ranks 17-22 (+2 each)
  31, 34, 37, 40, 43, 46, 49,                                  // Ranks 23-29 (+3 each)
  54, 59, 64, 69, 74, 79,                                      // Ranks 30-35 (+5 each)
  87,                                                           // Rank 36 — God of Destruction VII (+8)
  100,                                                          // Rank 37 — God of Destruction ∞ (+13)
] as const;

// Compile-time check: errors if STREAK_THRESHOLDS and t8Ranks ever diverge in length
void (STREAK_THRESHOLDS satisfies { length: typeof t8Ranks['length'] });

export const getFrameQuizRankForStreak = (streak: number): FrameQuizRank => {
  const safeStreak = Number.isFinite(streak)
    ? Math.max(0, Math.floor(streak))
    : 0;
  const rankIndex = STREAK_THRESHOLDS.filter(t => t <= safeStreak).length - 1;
  return allRanks[rankIndex];
};
