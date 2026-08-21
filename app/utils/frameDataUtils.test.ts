import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { type SortSettings } from '~/types/SortSettings';
import {
  getChipDamage,
  getRelatedMoves,
  recoverFullCrouch,
  sortMovesV2,
} from './frameDataUtils';

test('getRelatedMoves with more that one hit', () => {
  const move: Pick<Move, 'command'> = {
    command: '1, 2, 3',
  };
  const commands = [
    '1',
    '1, 1',
    '1, 2',
    '1, 2, 3',
    '1, 2, 3, 4',
    '1, 2+3, 3',
    '1, 2, 4',
    '1, 2, 4, 4',
    '1, 2, 3, 3, 4',
  ];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual([
    '1',
    '1, 2',
    '1, 2, 3, 4',
    '1, 2, 3, 3, 4',
    '1, 2, 4',
  ]);
});

test('getRelatedMoves with single hit move', () => {
  const move: Pick<Move, 'command'> = {
    command: '1',
  };
  const commands = ['1', '1, 1', '1, 2', '1, 2, 1', '2, 1', '2'];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual([
    '1, 1',
    '1, 2',
    '1, 2, 1',
  ]);
});

test('getRelatedMoves with double direction input', () => {
  const move: Pick<Move, 'command'> = {
    command: 'f,f+2',
  };
  const commands = ['f,f+2,1', 'f,f+3'];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual(['f,f+2,1']);
});

test('getChipDamage', () => {
  expect(getChipDamage({ tags: { chp: '9' } } as unknown as Move)).toBe(9);
  expect(getChipDamage({ tags: { chp: '' } } as unknown as Move)).toBe(
    undefined,
  );
  expect(getChipDamage({ tags: { trn: '' } } as unknown as Move)).toBe(
    undefined,
  );
  expect(getChipDamage({} as Move)).toBe(undefined);
});

test('sortMovesV2 by chip', () => {
  const moves = [
    { command: 'no chip' },
    { command: 'chip 6', tags: { chp: '6' } },
    { command: 'chip unknown', tags: { chp: '' } },
    { command: 'chip 12', tags: { chp: '12' } },
  ] as unknown as Move[];

  const sortByChip = (sortDirection: SortSettings['sortDirection']) =>
    sortMovesV2(moves, { sortByKey: 'chip', sortDirection }).map(
      (m) => m.command,
    );

  // in both directions the moves with a known amount come first, then the moves
  // which chip without a known amount, and last the moves without chip damage
  expect(sortByChip('asc')).toEqual([
    'chip 12',
    'chip 6',
    'chip unknown',
    'no chip',
  ]);
  expect(sortByChip('desc')).toEqual([
    'chip 6',
    'chip 12',
    'chip unknown',
    'no chip',
  ]);
});

test('getRelatedMoves with heat and hold', () => {
  const move: Pick<Move, 'command'> = {
    command: 'f,f+2',
  };
  const commands = ['f,f+2*', 'H.f,f+2'];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual(['f,f+2*', 'H.f,f+2']);
});

test('recoverFullCrouch', () => {
  const recovers = (move: Partial<Move>) =>
    recoverFullCrouch({ notes: '', ...move } as Move);

  expect(recovers({ recoveryState: 'FC' })).toBe(true);
  expect(recovers({ recoveryState: 'BT FC' })).toBe(true);
  expect(recovers({ recoveryState: 'FDFT' })).toBe(false);
  // FUFT must not match the way a substring check on the raw value would
  expect(recovers({ recoveryState: 'BT/FUFT' })).toBe(false);
  expect(recovers({ notes: 'Transition to FC with d' })).toBe(true);
  expect(recovers({})).toBe(false);
});
