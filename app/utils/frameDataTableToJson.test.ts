import { describe, expect, test } from 'vitest';
import { type TableData } from '~/types/TableData';
import { frameDataTableToJson } from './frameDataUtils';

const headers = [
  'Command',
  'Hit level',
  'Damage',
  'Start up frame',
  'Block frame',
  'Hit frame',
  'Counter hit frame',
  'Notes',
  'Wavu id',
  'Character id',
  'YT Video',
  'YT Start',
  'YT End',
];

const toTable = (rows: string[][], tableHeaders = headers): TableData => ({
  name: 'frames_normal',
  headers: tableHeaders,
  rows,
});

describe('frameDataTableToJson youtube video', () => {
  test('reads the video from the yt columns', () => {
    const [move] = frameDataTableToJson(
      toTable([
        [
          '1,2',
          'h, h',
          '5,8',
          'i10',
          '+1',
          '+8',
          '',
          '',
          'Lee-1,2',
          'lee',
          'X38X1JoMGZ8',
          '3',
          '7',
        ],
      ]),
      'lee',
    );
    expect(move.ytVideo).toEqual({ id: 'X38X1JoMGZ8', start: '3', end: '7' });
  });

  test('has no video when the yt video cell is empty', () => {
    const [move] = frameDataTableToJson(
      toTable([
        ['1', 'h', '5', 'i10', '+1', '+8', '', '', 'Lee-1', 'lee', '', '', ''],
      ]),
      'lee',
    );
    expect(move.ytVideo).toBeUndefined();
  });

  test('has no video when the table has no yt columns', () => {
    const [move] = frameDataTableToJson(
      toTable(
        [['1', 'h', '5', 'i10', '+1', '+8', '', '', 'Lee-1', 'lee']],
        headers.slice(0, 10),
      ),
      'lee',
    );
    expect(move.ytVideo).toBeUndefined();
  });
});
