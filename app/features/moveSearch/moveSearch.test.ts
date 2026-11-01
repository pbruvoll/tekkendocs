import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import {
  matchCharacters,
  parseCharacterMoveQuery,
  searchMoves,
} from './moveSearch';

const createMove = (command: string, extra: Partial<Move> = {}): Move => ({
  id: command,
  characterId: 'test',
  moveNumber: 0,
  command,
  hitLevel: 'h',
  damage: '',
  startup: '',
  block: '',
  hit: '',
  counterHit: '',
  notes: '',
  ...extra,
});

const commands = (moves: Move[]) => moves.map((move) => move.command);

const moves = [
  createMove('b,df1'),
  createMove('df1,2'),
  createMove('df1'),
  createMove('1,1,2'),
  createMove('f,F+2', { name: 'Power Punch' }),
  createMove('d+3', { notes: 'Power crush\nHoming', tags: { pc: '' } }),
];

test('empty query returns all moves in original order', () => {
  expect(searchMoves(moves, '')).toBe(moves);
  expect(searchMoves(moves, '  ')).toBe(moves);
});

test('ranks exact, prefix and contains command matches', () => {
  expect(commands(searchMoves(moves, 'df1'))).toEqual([
    'df1',
    'df1,2',
    'b,df1',
  ]);
});

test('ignores spaces, commas and plus in commands', () => {
  expect(commands(searchMoves(moves, 'f f 2'))).toEqual(['f,F+2']);
  expect(commands(searchMoves(moves, 'd3'))).toEqual(['d+3']);
});

test('neutral is optional, but required when typed', () => {
  const neutralMoves = [
    createMove('f,F+2'),
    createMove('f,f,n,2'),
    createMove('f,n,b+2'),
    createMove('KIN.1'),
    createMove('SEN.1'),
  ];
  expect(commands(searchMoves(neutralMoves, 'ff2 '))).toEqual([
    'f,F+2',
    'f,f,n,2',
  ]);
  expect(commands(searchMoves(neutralMoves, 'fb2'))).toEqual(['f,n,b+2']);
  expect(commands(searchMoves(neutralMoves, 'ffn2'))).toEqual(['f,f,n,2']);
  expect(commands(searchMoves(neutralMoves, 'ffn'))).toEqual(['f,f,n,2']);
  expect(commands(searchMoves(neutralMoves, 'f,f,n,2'))).toEqual(['f,f,n,2']);
  expect(commands(searchMoves(neutralMoves, 'fnb2'))).toEqual(['f,n,b+2']);
  expect(commands(searchMoves(neutralMoves, 'kin1'))).toEqual(['KIN.1']);
  expect(commands(searchMoves(neutralMoves, 'sen1'))).toEqual(['SEN.1']);
});

test('the stance dot is optional', () => {
  const stanceMoves = [createMove('BAD.1'), createMove('BAD.1+2')];
  for (const query of ['bad.1 ', 'bad1 ']) {
    expect(commands(searchMoves(stanceMoves, query))).toEqual(['BAD.1']);
  }
  for (const query of ['bad1', 'bad 1']) {
    expect(commands(searchMoves(stanceMoves, query))).toEqual([
      'BAD.1',
      'BAD.1+2',
    ]);
  }
});

test('trailing space requires an exact command match', () => {
  expect(commands(searchMoves(moves, 'df1 '))).toEqual(['df1']);
});

test('trailing space after other spaces does not require an exact match', () => {
  expect(commands(searchMoves(moves, 'f f '))).toEqual(['f,F+2']);
  expect(commands(searchMoves(moves, 'd f 1 '))).toEqual([
    'df1',
    'df1,2',
    'b,df1',
  ]);
});

test('question mark is a wildcard', () => {
  expect(commands(searchMoves(moves, '1?2'))).toEqual(['1,1,2', 'df1,2']);
  expect(commands(searchMoves(moves, '1?2 '))).toEqual(['1,1,2']);
});

test('text queries match name, notes and tags after command matches', () => {
  expect(commands(searchMoves(moves, 'power'))).toEqual(['f,F+2', 'd+3']);
  expect(commands(searchMoves(moves, 'powercrush'))).toEqual(['d+3']);
  expect(commands(searchMoves(moves, 'homing '))).toEqual(['d+3']);
});

test('text matching needs three characters and no digits', () => {
  expect(searchMoves(moves, 'po')).toEqual([]);
  expect(searchMoves(moves, 'power1')).toEqual([]);
});

test('property abbreviations match moves with that property', () => {
  const propertyMoves = [
    createMove('f+1+2', { tags: { pc: '' } }),
    createMove('2+3', { tags: { hb: '', pc: '' } }),
    createMove('H.2+3', { tags: { hs: '', pc: '' } }),
    createMove('R.df+1+2', { tags: { ra: '', pc: '' } }),
    createMove('f+4,2', { tags: { he: '' } }),
    createMove('db+2', { tags: { hom: '' } }),
    createMove('1+2', { tags: { hom: '' } }),
  ];
  expect(commands(searchMoves(propertyMoves, 'pc'))).toEqual(['f+1+2']);
  expect(commands(searchMoves(propertyMoves, 'PC '))).toEqual(['f+1+2']);
  expect(commands(searchMoves(propertyMoves, 'he'))).toEqual(['f+4,2']);
  expect(commands(searchMoves(propertyMoves, 'hs'))).toEqual(['H.2+3']);
  expect(commands(searchMoves(propertyMoves, 'hom'))).toEqual(['db+2', '1+2']);
});

test('property matches come before command prefix matches', () => {
  const stanceMoves = [
    createMove('BHS.1'),
    createMove('H.2+3', { tags: { hs: '' } }),
  ];
  expect(commands(searchMoves(stanceMoves, 'hs'))).toEqual(['H.2+3', 'BHS.1']);
});

test('parseCharacterMoveQuery', () => {
  expect(parseCharacterMoveQuery('')).toEqual({
    characterQuery: '',
    moveQuery: '',
  });
  expect(parseCharacterMoveQuery('Drag')).toEqual({
    characterQuery: 'drag',
    moveQuery: '',
  });
  expect(parseCharacterMoveQuery(' drag f f 2 ')).toEqual({
    characterQuery: 'drag',
    moveQuery: 'f f 2 ',
  });
});

test('matchCharacters matches id prefix and aliases', () => {
  const characters = [
    { id: 'jack-8' },
    { id: 'jin' },
    { id: 'jun' },
    { id: 'alisa' },
  ];
  const ids = (query: string) =>
    matchCharacters(characters, query).map((char) => char.id);
  expect(ids('j')).toEqual(['jack-8', 'jin', 'jun']);
  expect(ids('jack8')).toEqual(['jack-8']);
  expect(ids('als')).toEqual(['alisa']);
  expect(ids('')).toHaveLength(4);
});
