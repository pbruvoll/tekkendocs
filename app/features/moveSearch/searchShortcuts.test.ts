import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { filterMoves } from '~/utils/frameDataUtils';
import { getShortcutFilter } from './searchShortcuts';

const createMove = (command: string, extra: Partial<Move> = {}): Move => ({
  id: command,
  characterId: 'test',
  moveNumber: 0,
  command,
  hitLevel: 'm',
  damage: '',
  startup: '',
  block: '',
  hit: '',
  counterHit: '',
  notes: '',
  ...extra,
});

const search = (moves: Move[], searchQuery: string) =>
  filterMoves(moves, { searchQuery }).map((move) => move.command);

test('getShortcutFilter ignores case and spaces', () => {
  expect(getShortcutFilter('pc')).toEqual({ powerCrush: true });
  expect(getShortcutFilter(' PC ')).toEqual({ powerCrush: true });
  expect(getShortcutFilter('pcx')).toBeUndefined();
  expect(getShortcutFilter('constructor')).toBeUndefined();
  expect(getShortcutFilter(undefined)).toBeUndefined();
});

test('pc leaves out heat bursts, heat smashes and rage arts', () => {
  const moves = [
    createMove('f+1+2', { tags: { pc: '' } }),
    createMove('2+3', { tags: { hb: '', pc: '' } }),
    createMove('H.2+3', { tags: { hs: '', pc: '' } }),
    createMove('R.df+1+2', { tags: { ra: '', pc: '' } }),
  ];
  expect(search(moves, 'pc')).toEqual(['f+1+2']);
});

test('property shortcuts', () => {
  const moves = [
    createMove('f+4,2', { notes: '* Heat Engager' }),
    createMove('H.2+3', { tags: { hs: '' } }),
    createMove('db+2', { tags: { hom: '' } }),
    createMove('d+1', { tags: { cs: '4~' } }),
    createMove('uf+3', { tags: { js: '9~' } }),
  ];
  expect(search(moves, 'he')).toEqual(['f+4,2']);
  expect(search(moves, 'hs')).toEqual(['H.2+3']);
  expect(search(moves, 'hom')).toEqual(['db+2']);
  expect(search(moves, 'hc')).toEqual(['d+1']);
  expect(search(moves, 'cs')).toEqual(['d+1']);
  expect(search(moves, 'lc')).toEqual(['uf+3']);
  expect(search(moves, 'js')).toEqual(['uf+3']);
});

test('hit level shortcuts use the first hit of the last input', () => {
  const moves = [
    createMove('df+1', { hitLevel: 'm' }),
    createMove('df+1,2', { hitLevel: 'm, h' }),
    createMove('d+4', { hitLevel: 'l' }),
    createMove('1+3', { hitLevel: 'th(h)' }),
    createMove('DVK.1,1,2,D', { hitLevel: 'h, h, m, t' }),
    // One input with three hits
    createMove('H.2+3', { hitLevel: 'L,m,th' }),
    // Special mids and lows are neither mids nor lows
    createMove('d+2', { hitLevel: 'sm' }),
    createMove('db+3', { hitLevel: 'sl' }),
  ];
  expect(search(moves, 'low')).toEqual(['d+4', 'H.2+3']);
  expect(search(moves, 'mid')).toEqual(['df+1']);
  expect(search(moves, 'high')).toEqual(['df+1,2']);
  expect(search(moves, 'throw')).toEqual(['1+3', 'DVK.1,1,2,D']);
});

test('a shortcut is combined with the other filters', () => {
  const moves = [
    createMove('d+4', { hitLevel: 'l', startup: 'i12' }),
    createMove('db+3', { hitLevel: 'l', startup: 'i20' }),
  ];
  const filtered = filterMoves(moves, {
    searchQuery: 'low',
    startupFrameMax: 15,
  });
  expect(filtered.map((move) => move.command)).toEqual(['d+4']);
});
