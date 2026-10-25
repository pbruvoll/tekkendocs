import { describe, expect, it } from 'vitest';
import { formatStartup } from './formatStartup';

describe('formatStartup', () => {
  it.each([
    ['i10', 'i10'],
    ['10', 'i10'],
    ['15f', 'i15'],
    ['i10 ', 'i10'],
    ['I12', 'i12'],
    ['i13~14', 'i13'],
    ['i15, i23~24', 'i15'],
  ])('formats %j as %j', (startup, expected) => {
    expect(formatStartup(startup)).toBe(expected);
  });

  it('returns undefined for missing startup', () => {
    expect(formatStartup(undefined)).toBeUndefined();
    expect(formatStartup('')).toBeUndefined();
    expect(formatStartup('  ')).toBeUndefined();
  });

  it('keeps startup it cannot parse', () => {
    expect(formatStartup('varies')).toBe('varies');
  });
});
