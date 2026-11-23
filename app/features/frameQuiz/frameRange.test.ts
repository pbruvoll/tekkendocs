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
  test('shows the highest value first on block', () => {
    expect(formatFrameRange({ min: 1, max: 4 }, 'block')).toBe('+4 to +1');
    expect(formatFrameRange({ min: -4, max: 0 }, 'block')).toBe('0 to -4');
    expect(formatFrameRange({ min: -14, max: -12 }, 'block')).toBe(
      '-12 to -14',
    );
  });

  test('shows the lowest value first on hit', () => {
    expect(formatFrameRange({ min: 0, max: 3 }, 'hit')).toBe('0 to +3');
    expect(formatFrameRange({ min: 4, max: 7 }, 'hit')).toBe('+4 to +7');
    expect(formatFrameRange({ min: -3, max: -1 }, 'hit')).toBe('-3 to -1');
  });

  test('formats a single frame value', () => {
    expect(formatFrameRange({ min: -14, max: -14 }, 'block')).toBe('-14');
  });

  test('says "or more" for open ranges in both directions', () => {
    expect(formatFrameRange({ min: 1 }, 'block')).toBe('+1 or more');
    expect(formatFrameRange({ max: -15 }, 'block')).toBe('-15 or more');
    expect(formatFrameRange({ max: -1 }, 'hit')).toBe('-1 or more');
    expect(formatFrameRange({ min: 8 }, 'hit')).toBe('+8 or more');
  });
});
