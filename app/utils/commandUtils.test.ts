import { expect, test } from 'vitest';
import { compressCommand, removeTransitionInput } from './commandUtils';

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
