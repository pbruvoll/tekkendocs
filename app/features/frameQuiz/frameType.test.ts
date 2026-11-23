import { describe, expect, test } from 'vitest';
import { formatFrameRange } from './frameRange';
import { getAnswerOptions, parseQuizFrameType } from './frameType';

test('parseQuizFrameType defaults to block', () => {
  expect(parseQuizFrameType('hit')).toBe('hit');
  expect(parseQuizFrameType('block')).toBe('block');
  expect(parseQuizFrameType(null)).toBe('block');
  expect(parseQuizFrameType('other')).toBe('block');
});

const answerLabels = (...args: Parameters<typeof getAnswerOptions>) =>
  getAnswerOptions(...args).map(formatFrameRange);

describe('getAnswerOptions', () => {
  test('uses the normal ranges by default', () => {
    expect(answerLabels('block')).toEqual([
      '+1 or more',
      '0 to -9',
      '-10 to -11',
      '-12 to -14',
      '-15 or less',
    ]);
    expect(answerLabels('hit')).toEqual([
      '-1 or less',
      '0 to +3',
      '+4 to +7',
      '+8 or more',
    ]);
  });

  test('uses smaller ranges on block in hard mode', () => {
    expect(answerLabels('block', true)).toEqual([
      '+5 or more',
      '+1 to +4',
      '0 to -4',
      '-5 to -9',
      '-10 to -11',
      '-12 to -13',
      '-14',
      '-15 or less',
    ]);
  });

  test('keeps the normal ranges on hit in hard mode', () => {
    expect(answerLabels('hit', true)).toEqual(answerLabels('hit'));
  });
});
