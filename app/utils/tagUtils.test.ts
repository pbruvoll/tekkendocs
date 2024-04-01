import { expect, test } from 'vitest'
import { tagStringToRecord } from './tagUtils'
test('tagUtils', () => {
  expect(tagStringToRecord('pc, js9~11, cs11')).toEqual({
    pc: undefined,
    js: '9~11',
    cs: '11',
  })
})
