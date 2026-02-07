import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { getRelatedMoves } from './frameDataUtils';

test('getRelatedMvoes with more that one hit', () => {
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

test('getRelatedMvoes with single hit move', () => {
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
