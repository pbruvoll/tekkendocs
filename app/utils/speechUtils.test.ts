import { expect, test } from 'vitest';
import { normalizeSpeechText } from './speechUtils';

test('replaces commas between numbers with spaces', () => {
  expect(normalizeSpeechText('1,2')).toBe('1 2');
  expect(normalizeSpeechText('1, 2')).toBe('1 2');
  expect(normalizeSpeechText('1 ,2')).toBe('1 2');
  expect(normalizeSpeechText('df1 , 2, 3')).toBe('df1 2 3');
});
