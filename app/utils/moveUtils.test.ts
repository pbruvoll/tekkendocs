import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { charIdFromMove, videoFileNameFromMove } from './moveUtils';

const moveWithId = (id: string) => ({ id }) as Move;

test.each([
  ['Kazuya-f,n,d,df#2', 'kazuya'],
  ['Devil Jin-1,2', 'devil-jin'],
  ['Jack-8-1+4:df+1', 'jack-8'],
  ['Jack 8-1+4', 'jack-8'],
  ['Steve-after-2steps+1', 'steve'],
])('charIdFromMove(%s) is %s', (id, charId) => {
  expect(charIdFromMove(moveWithId(id))).toBe(charId);
});

test.each([
  ['Lee-ws1:4', 'ws1j4.mp4'],
  ['Jin-CD.df#1', 'cd.dfj1.mp4'],
  ['Jack-8-1+4:df+1', '1+4jdf+1.mp4'],
  ['Steve-after-2steps+1', 'after-2steps+1.mp4'],
  ['Bob-(back to wall).b,b,UB', 'back-to-wall.b,b,ub.mp4'],
  ['Heihachi-ub+1+2*', 'ub+1+2x.mp4'],
])('videoFileNameFromMove(%s) is %s', (id, fileName) => {
  expect(videoFileNameFromMove(moveWithId(id))).toBe(fileName);
});
