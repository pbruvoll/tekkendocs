import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { formatRecovery } from './frameDataViewUtils';

test('formatRecovery', () => {
  const format = (recovery?: string, recoveryState?: string) =>
    formatRecovery({ recovery, recoveryState } as Move);

  expect(format('24', 'BT')).toBe('24f in BT');
  expect(format('24')).toBe('24f');
  // a move can recover without wavu knowing in how many frames
  expect(format(undefined, 'FC')).toBe('FC');
  expect(format('', '')).toBe('');
  expect(format()).toBe('');
  // the f goes before the ? wavu marks an uncertain value with
  expect(format('25?', 'BT FC')).toBe('25f? in BT FC');
});
