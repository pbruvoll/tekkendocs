import { expect, test } from 'vitest';
import { parseQuizModifiers } from './quizModifiers';

const parse = (search: string) =>
  parseQuizModifiers(new URLSearchParams(search));

test('parseQuizModifiers turns on the modifiers in the url', () => {
  expect(parse('')).toEqual({
    hideCommand: false,
    hideVideo: false,
    hard: false,
  });
  expect(parse('hideCommand&hard')).toEqual({
    hideCommand: true,
    hideVideo: false,
    hard: true,
  });
});

test('parseQuizModifiers ignores hard mode on hit', () => {
  expect(parse('hard&frameType=hit').hard).toBe(false);
});
