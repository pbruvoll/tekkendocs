import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { getRelatedMoves } from './frameDataUtils';

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
