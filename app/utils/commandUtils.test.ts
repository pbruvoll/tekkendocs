import { expect, test } from 'vitest'
import { compressCommand } from './commandUtils';
test('compress command', () => {
  expect(compressCommand("d/f+1,2")).toEqual("df1,2");
  expect(compressCommand("CH (1),2,3 (12 ob)")).toEqual("1,2,3");
  expect(compressCommand("CH (1),2,3(12 ob)")).toEqual("1,2,3");
})