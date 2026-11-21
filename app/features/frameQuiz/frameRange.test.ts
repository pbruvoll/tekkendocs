import { describe, expect, test } from 'vitest';
import { formatFrameRange, isInFrameRange } from './frameRange';

describe('isInFrameRange', () => {
  test('includes both bounds', () => {
    expect(isInFrameRange(-12, { min: -14, max: -12 })).toBe(true);
    expect(isInFrameRange(-14, { min: -14, max: -12 })).toBe(true);
    expect(isInFrameRange(-11, { min: -14, max: -12 })).toBe(false);
    expect(isInFrameRange(-15, { min: -14, max: -12 })).toBe(false);
  });

  test('treats a missing bound as open', () => {
    expect(isInFrameRange(20, { min: 1 })).toBe(true);
    expect(isInFrameRange(0, { min: 1 })).toBe(false);
    expect(isInFrameRange(-30, { max: -15 })).toBe(true);
    expect(isInFrameRange(-14, { max: -15 })).toBe(false);
  });
});

describe('formatFrameRange', () => {
  test('formats the current answer options', () => {
    expect(formatFrameRange({ min: 1 })).toBe('+1 or more');
    expect(formatFrameRange({ min: -9, max: 0 })).toBe('0 to -9');
    expect(formatFrameRange({ min: -11, max: -10 })).toBe('-10 to -11');
    expect(formatFrameRange({ min: -14, max: -12 })).toBe('-12 to -14');
    expect(formatFrameRange({ max: -15 })).toBe('-15 or less');
  });

  test('formats a single frame value', () => {
    expect(formatFrameRange({ min: -10, max: -10 })).toBe('-10');
  });

  test('shows the value closest to zero first', () => {
    expect(formatFrameRange({ min: 1, max: 3 })).toBe('+1 to +3');
    expect(formatFrameRange({ min: -3, max: -1 })).toBe('-1 to -3');
  });

  test('formats a range across zero from low to high', () => {
    expect(formatFrameRange({ min: -2, max: 3 })).toBe('-2 to +3');
  });

  test('formats open ranges in either direction', () => {
    expect(formatFrameRange({ min: -5 })).toBe('-5 or more');
    expect(formatFrameRange({ max: 5 })).toBe('+5 or less');
  });
});
