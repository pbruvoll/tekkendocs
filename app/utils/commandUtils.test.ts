import { expect, test } from 'vitest';
import {
  compressCommand,
  getCommands,
  removeTransitionInput,
  splitCommands,
} from './commandUtils';

test('compress command', () => {
  expect(compressCommand('d/f+1,2')).toEqual('df1,2');
  expect(compressCommand('CH (1),2,3 (12 ob)')).toEqual('1,2,3');
  expect(compressCommand('CH (1),2,3(12 ob)')).toEqual('1,2,3');
  expect(compressCommand('f,F+2')).toEqual('ff2');
});

test('remove transition input', () => {
  expect(removeTransitionInput('1,2~f')).toEqual('1,2');
  expect(removeTransitionInput('f+2,df')).toEqual('f+2');
  expect(removeTransitionInput('ws+1+2,f')).toEqual('ws+1+2');
  expect(removeTransitionInput('ff,n,2~f')).toEqual('ff,n,2');
});

test('split commands', () => {
  const map = { b1: {}, uf4: {}, df2: {}, f23: {} };
  expect(splitCommands('b+1 into uf+4', map)).toEqual([
    { type: 'command', text: 'b+1' },
    { type: 'separator', text: ' into ' },
    { type: 'command', text: 'uf+4' },
  ]);
  expect(splitCommands('b+1', map)).toEqual([{ type: 'command', text: 'b+1' }]);
});

test('get commands', () => {
  const map = { b1: {}, uf4: {}, df2: {}, f23: {} };
  expect(getCommands('b+1 into uf+4', map)).toEqual(['b+1', 'uf+4']);
  expect(getCommands('df+2 to f+2+3', map)).toEqual(['df+2', 'f+2+3']);
  expect(getCommands('b+1 | uf+4', map)).toEqual(['b+1', 'uf+4']);
  expect(getCommands('db+3 > WS 3 or FC df+4', map)).toEqual([
    'db+3',
    'WS 3',
    'FC df+4',
  ]);
  expect(getCommands('b+1 -> uf+4 ▶ df+2 / f+2+3', map)).toEqual([
    'b+1',
    'uf+4',
    'df+2',
    'f+2+3',
  ]);
  expect(getCommands('b+1', map)).toEqual(['b+1']);
  expect(getCommands('b+1 or 2', { b1or2: {} })).toEqual(['b+1 or 2']);
});
