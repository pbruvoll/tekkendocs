import { expect, test } from 'vitest';
import { buildDailyShareText, dailyChallengeShareUrl } from './shareText';

const results = (correctIndexes: number[], total = 10): boolean[] =>
  Array.from({ length: total }, (_, index) => correctIndexes.includes(index));

test('formats a mixed result as score, rank, streak and emoji grid', () => {
  expect(
    buildDailyShareText({
      displayDate: '14 August',
      score: 8,
      totalQuestions: 10,
      rankName: 'Tekken King',
      streak: 5,
      results: results([0, 1, 3, 4, 5, 6, 7, 9]),
    }),
  ).toBe(
    [
      'TekkenDocs Daily Challenge - 14 August',
      'Score: 8/10 - Tekken King',
      'Streak: 5 days 🔥',
      '',
      '🟩🟩🟥🟩🟩',
      '🟩🟩🟩🟥🟩',
      '',
      dailyChallengeShareUrl,
    ].join('\n'),
  );
});

test('formats a perfect score', () => {
  expect(
    buildDailyShareText({
      displayDate: '1 January',
      score: 10,
      totalQuestions: 10,
      rankName: 'God of Destruction ∞',
      streak: 12,
      results: results([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    }),
  ).toBe(
    [
      'TekkenDocs Daily Challenge - 1 January',
      'Score: 10/10 - God of Destruction ∞',
      'Streak: 12 days 🔥',
      '',
      '🟩🟩🟩🟩🟩',
      '🟩🟩🟩🟩🟩',
      '',
      dailyChallengeShareUrl,
    ].join('\n'),
  );
});

test('formats a zero score', () => {
  expect(
    buildDailyShareText({
      displayDate: '1 January',
      score: 0,
      totalQuestions: 10,
      rankName: 'Beginner',
      streak: 1,
      results: results([]),
    }),
  ).toBe(
    [
      'TekkenDocs Daily Challenge - 1 January',
      'Score: 0/10 - Beginner',
      'Streak: 1 day 🔥',
      '',
      '🟥🟥🟥🟥🟥',
      '🟥🟥🟥🟥🟥',
      '',
      dailyChallengeShareUrl,
    ].join('\n'),
  );
});

test('leaves out the streak line and the rank when they are missing', () => {
  expect(
    buildDailyShareText({
      displayDate: '14 August',
      score: 3,
      totalQuestions: 5,
      rankName: '',
      streak: 0,
      results: results([0, 2, 4], 5),
    }),
  ).toBe(
    [
      'TekkenDocs Daily Challenge - 14 August',
      'Score: 3/5',
      '',
      '🟩🟥🟩🟥🟩',
      '',
      dailyChallengeShareUrl,
    ].join('\n'),
  );
});
