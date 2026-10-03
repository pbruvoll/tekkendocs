import { expect, test } from 'vitest';
import { parseCsv } from './csvUtils.server';

test('parseCsv splits cells and rows', () => {
  expect(parseCsv('a;b\nc;d')).toEqual([
    ['a', 'b'],
    ['c', 'd'],
  ]);
});

test('parseCsv keeps delimiter and newline inside quoted cells', () => {
  expect(parseCsv('"a;b";c\n"line1\nline2";d')).toEqual([
    ['a;b', 'c'],
    ['line1\nline2', 'd'],
  ]);
});

test('parseCsv unescapes doubled quotes', () => {
  expect(parseCsv('cmd;"uses ""1,2,1"" often"')).toEqual([
    ['cmd', 'uses "1,2,1" often'],
  ]);
});

test('parseCsv handles crlf, empty cells and a trailing newline', () => {
  expect(parseCsv('#introduction\r\na;;b\r\n')).toEqual([
    ['#introduction'],
    ['a', '', 'b'],
  ]);
});
