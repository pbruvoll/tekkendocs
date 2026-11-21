import { expect, test } from 'vitest';
import { parseQuizFrameType } from './frameType';

test('parseQuizFrameType defaults to block', () => {
  expect(parseQuizFrameType('hit')).toBe('hit');
  expect(parseQuizFrameType('block')).toBe('block');
  expect(parseQuizFrameType(null)).toBe('block');
  expect(parseQuizFrameType('other')).toBe('block');
});
