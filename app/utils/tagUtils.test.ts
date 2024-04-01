import { expect, test } from 'vitest'
import { tagStringToRecord } from './tagUtils'
test('tagUtils', () => {
  expect(tagStringToRecord('pc, js9~11, cs11')).toEqual({
    pc: '',
    js: '9~11',
    cs: '11',
  })
})
