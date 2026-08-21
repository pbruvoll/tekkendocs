import { describe, expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import {
  getEligibleQuizMoves,
  isGroundedRecoveryState,
  isThrowHitLevel,
} from './moveSelection';

const createMove = (move: Partial<Move>): Move => ({
  moveNumber: 1,
  command: '1',
  hitLevel: 'h',
  damage: '5',
  startup: 'i10',
  block: '-1',
  hit: '+8',
  counterHit: '+8',
  notes: '',
  video: 'video.mp4',
  ...move,
});

test('isThrowHitLevel', () => {
  // Moves that are only a throw
  expect(isThrowHitLevel('t')).toBe(true); // Alisa-1+3
  expect(isThrowHitLevel('th')).toBe(true); // Jack-8-GMH.1+2
  expect(isThrowHitLevel('th(h)')).toBe(true); // Armor King-Back Throw

  // Strings where one of the inputs is a throw
  expect(isThrowHitLevel('h, h, t')).toBe(true); // King-1,2,2+4
  expect(isThrowHitLevel('h, h, m, t')).toBe(true); // King-1,2,1,2+4
  expect(isThrowHitLevel('m, m, t')).toBe(true); // Dragunov-b+4,2,1+2
  expect(isThrowHitLevel('m, t')).toBe(true); // Asuka-ws2,1+2
  expect(isThrowHitLevel('sp, t(h)')).toBe(true); // Lars-uf+3+4,1+2
  expect(isThrowHitLevel('t, m')).toBe(true); // Paul-df+1+3,qcf+2

  // Attack throws, where a single input turns into a throw on hit
  expect(isThrowHitLevel('m,t')).toBe(false); // Bryan-ws2
  expect(isThrowHitLevel('m,m,t')).toBe(false); // Bryan-H.2+3
  expect(isThrowHitLevel('h,t')).toBe(false); // Asuka-uf+2
  expect(isThrowHitLevel('M,t')).toBe(false); // Alisa-DBT.f+1
  expect(isThrowHitLevel('m,(t)')).toBe(false); // King-f,F+4
  expect(isThrowHitLevel('m(th)')).toBe(false); // Shaheen-b+2
  expect(isThrowHitLevel('L, h, sm,t, sm,t')).toBe(false); // Kunimitsu-d+3,4,1,F

  // Regular hit levels
  expect(isThrowHitLevel('m')).toBe(false); // Alisa-3
  expect(isThrowHitLevel('h, h')).toBe(false); // Alisa-1,1
  expect(isThrowHitLevel('sm')).toBe(false); // Clive-WOL.1
});

test('isGroundedRecoveryState', () => {
  expect(isGroundedRecoveryState('FUFT')).toBe(true); // Armor King-uf+3+4
  expect(isGroundedRecoveryState('FUFA')).toBe(true); // Armor King-3+4,2
  expect(isGroundedRecoveryState('FDFT')).toBe(true); // Armor King-db+4
  expect(isGroundedRecoveryState('FDFA')).toBe(true); // Armor King-BAD.db+1+2
  expect(isGroundedRecoveryState('FDFL')).toBe(true); // Armor King-3+4,1+2
  expect(isGroundedRecoveryState('(FUFT)')).toBe(true); // King-f,F+3+4

  expect(isGroundedRecoveryState('FC')).toBe(false); // Alisa-d+2
  expect(isGroundedRecoveryState('BT FC')).toBe(false); // Xiaoyu-BT.d+3
  expect(isGroundedRecoveryState('DES')).toBe(false); // Alisa-1,1,1+2
  expect(isGroundedRecoveryState('')).toBe(false);
});

describe('getEligibleQuizMoves', () => {
  const kingPalmStrikeHeadJammer = createMove({
    // King-1,2,2+4
    command: '1,2,2+4',
    hitLevel: 'h, h, t',
    block: '-6',
    wavuId: 'King-1,2,2+4',
    video: 'File:t8-p2-king-1,2,2+4.mp4',
  });
  const kingOneTwo = createMove({
    // King-1,2
    command: '1,2',
    hitLevel: 'h, h',
    block: '-3',
    wavuId: 'King-1,2',
    video: 'File:t8-p2-king-1,2.mp4',
  });
  const bryanFishermansSlam = createMove({
    // Bryan-ws2
    command: 'ws2',
    hitLevel: 'm,t',
    block: '-10',
    wavuId: 'Bryan-ws2',
    video: 'File:t8-p2-bryan-ws2.mp4',
  });

  const armorKingArmageddonDrop = createMove({
    // Armor King-uf+3+4, recovers face up feet towards
    command: 'uf+3+4',
    hitLevel: 'm',
    block: '-7',
    recoveryState: 'FUFT',
    wavuId: 'Armor King-uf+3+4',
    video: 'File:t8-p2-armor-king-uf+3+4.mp4',
  });

  test('filters out strings ending in a throw', () => {
    expect(
      getEligibleQuizMoves([kingPalmStrikeHeadJammer, kingOneTwo]).map(
        ({ id }) => id,
      ),
    ).toEqual(['King-1,2']);
  });

  test('keeps attack throws, which are blockable', () => {
    expect(
      getEligibleQuizMoves([bryanFishermansSlam]).map(({ id }) => id),
    ).toEqual(['Bryan-ws2']);
  });

  test('filters out moves that recover on the ground', () => {
    expect(
      getEligibleQuizMoves([armorKingArmageddonDrop, kingOneTwo]).map(
        ({ id }) => id,
      ),
    ).toEqual(['King-1,2']);
  });
});
