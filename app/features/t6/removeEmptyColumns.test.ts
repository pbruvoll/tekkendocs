import { expect, test } from 'vitest';
import { removeEmptyColumns } from './removeEmptyColumns';

test('removeEmptyColumns removes columns without any value', () => {
  expect(
    removeEmptyColumns({
      name: 'frames_normal',
      headers: ['Command', 'Hit level', 'Damage', 'Notes'],
      rows: [
        ['1', '', '8', ''],
        ['2', '', '', ''],
      ],
    }),
  ).toEqual({
    name: 'frames_normal',
    headers: ['Command', 'Damage'],
    rows: [
      ['1', '8'],
      ['2', ''],
    ],
  });
});

test('removeEmptyColumns fills in cells missing at the end of short rows', () => {
  expect(
    removeEmptyColumns({
      name: 'frames_normal',
      headers: ['Command', 'Damage'],
      rows: [['1', '8'], ['2']],
    }).rows,
  ).toEqual([
    ['1', '8'],
    ['2', ''],
  ]);
});
