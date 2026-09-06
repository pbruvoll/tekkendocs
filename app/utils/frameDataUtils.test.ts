import { expect, test } from 'vitest';
import { type Move } from '~/types/Move';
import { type SortSettings } from '~/types/SortSettings';
import {
  getChipDamage,
  getRelatedMoves,
  getTransitionNotes,
  recoverFullCrouch,
  sortMovesV2,
} from './frameDataUtils';

test('getRelatedMoves with more that one hit', () => {
  const move: Pick<Move, 'command'> = {
    command: '1, 2, 3',
  };
  const commands = [
    '1',
    '1, 1',
    '1, 2',
    '1, 2, 3',
    '1, 2, 3, 4',
    '1, 2+3, 3',
    '1, 2, 4',
    '1, 2, 4, 4',
    '1, 2, 3, 3, 4',
  ];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual([
    '1',
    '1, 2',
    '1, 2, 3, 4',
    '1, 2, 3, 3, 4',
    '1, 2, 4',
  ]);
});

test('getRelatedMoves with single hit move', () => {
  const move: Pick<Move, 'command'> = {
    command: '1',
  };
  const commands = ['1', '1, 1', '1, 2', '1, 2, 1', '2, 1', '2'];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual([
    '1, 1',
    '1, 2',
    '1, 2, 1',
  ]);
});

test('getRelatedMoves with double direction input', () => {
  const move: Pick<Move, 'command'> = {
    command: 'f,f+2',
  };
  const commands = ['f,f+2,1', 'f,f+3'];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual(['f,f+2,1']);
});

test('getChipDamage', () => {
  expect(getChipDamage({ tags: { chp: '9' } } as unknown as Move)).toBe(9);
  expect(getChipDamage({ tags: { chp: '' } } as unknown as Move)).toBe(
    undefined,
  );
  expect(getChipDamage({ tags: { trn: '' } } as unknown as Move)).toBe(
    undefined,
  );
  expect(getChipDamage({} as Move)).toBe(undefined);
});

test('sortMovesV2 by chip', () => {
  const moves = [
    { command: 'no chip' },
    { command: 'chip 6', tags: { chp: '6' } },
    { command: 'chip unknown', tags: { chp: '' } },
    { command: 'chip 12', tags: { chp: '12' } },
  ] as unknown as Move[];

  const sortByChip = (sortDirection: SortSettings['sortDirection']) =>
    sortMovesV2(moves, { sortByKey: 'chip', sortDirection }).map(
      (m) => m.command,
    );

  // in both directions the moves with a known amount come first, then the moves
  // which chip without a known amount, and last the moves without chip damage
  expect(sortByChip('asc')).toEqual([
    'chip 12',
    'chip 6',
    'chip unknown',
    'no chip',
  ]);
  expect(sortByChip('desc')).toEqual([
    'chip 6',
    'chip 12',
    'chip unknown',
    'no chip',
  ]);
});

test('getRelatedMoves with heat and hold', () => {
  const move: Pick<Move, 'command'> = {
    command: 'f,f+2',
  };
  const commands = ['f,f+2*', 'H.f,f+2'];
  const relatedMoves = getRelatedMoves(
    move as Move,
    commands.map((c) => ({ command: c }) as Move),
  );
  expect(relatedMoves.map((m) => m.command)).toEqual(['f,f+2*', 'H.f,f+2']);
});

test('recoverFullCrouch', () => {
  const recovers = (move: Partial<Move>) =>
    recoverFullCrouch({ notes: '', ...move } as Move);

  expect(recovers({ recoveryState: 'FC' })).toBe(true);
  expect(recovers({ recoveryState: 'BT FC' })).toBe(true);
  expect(recovers({ recoveryState: 'FDFT' })).toBe(false);
  // FUFT must not match the way a substring check on the raw value would
  expect(recovers({ recoveryState: 'BT/FUFT' })).toBe(false);
  expect(recovers({ notes: 'Transition to FC with d' })).toBe(true);
  expect(recovers({})).toBe(false);
});

// Every fixture is a verbatim notes value — or the leading lines of one — from
// utils/wavu-importer/src/json_movelist/<character>.json, named after the move it
// belongs to
const transitionNotesCases: {
  move: string;
  covers: string;
  notes: string;
  expected: string[];
}[] = [
  {
    move: 'Nina-1,2',
    covers: 'the t and r frame markers go, the non-transition line goes',
    notes:
      '* Jail from 1st attack with 8f delay\n' +
      '* Enter SS +0 +11 t15 r9 with D_U',
    expected: ['Enter SS +0 +11 with D_U'],
  },
  {
    move: 'Nina-df+3,2',
    covers: 'a move with several transitions returns all of them',
    notes:
      '* Combo from 1st hit with 10f delay\n' +
      '* Move cannot be interrupted\n' +
      '* Enter SS 0 +4 +11 with D or U\n' +
      '* Enter CD -1 +3 +10 t29 r10 with F\n' +
      '* Enter SWA +8 +12 +19 with B',
    expected: [
      'Enter SS 0 +4 +11 with D or U',
      'Enter CD -1 +3 +10 with F',
      'Enter SWA +8 +12 +19 with B',
    ],
  },
  {
    move: 'Alisa-1',
    covers: 'frame markers in a line that is not a transition are left alone',
    notes: 'Recovers 2f faster on hit or block (t27 r17)',
    expected: [],
  },
  {
    move: 'Nina-1+2',
    covers: 'a move without a transition',
    notes: 'Homing',
    expected: [],
  },
  {
    move: 'no notes at all',
    covers: 'an empty string',
    notes: '',
    expected: [],
  },
  {
    move: 'Nina-qcf',
    covers: 'the word input goes, and so does its "alternate" qualifier',
    notes:
      '* Perform WS moves with qcf,n\n' +
      '* Transition to r6? hFC with alternate input d,DF\n' +
      '** Cannot access stance moves',
    expected: ['Transition to hFC with d,DF'],
  },
  {
    move: 'Alisa-1+2+3',
    covers: 'the "held" qualifier goes the same way',
    notes: 'Can transition to DES with held input 1+2',
    expected: ['Can transition to DES with 1+2'],
  },
  {
    move: 'Bryan-qcf',
    covers: '"with no input" and the frame windows are dropped entirely',
    notes:
      '* Enter FC r25 with no input\n' +
      '* Cancel to SS on any frame with u\n' +
      '* Cancel to block on frames 1~9 with b\n' +
      '* Actionable on frame 1~',
    expected: ['Enter FC', 'Cancel to SS with u', 'Cancel to block with b'],
  },
  {
    move: 'Nina-d+4,1',
    covers: 'parentheses holding frame data are kept',
    notes:
      '* Combo from 1st CH with 6f delay\n' +
      '* Interrupt with i4 from 1st block\n' +
      '* Input can be delayed 9f\n' +
      '* Cancel to SS with D_U (-13/-2)\n' +
      '** Cannot block up to i21 on block?',
    expected: ['Cancel to SS with D_U (-13/-2)'],
  },
  {
    move: 'Kuma-b+1+2',
    covers: 'parentheses holding prose are not',
    notes:
      '* Transition to HBS r36 with input D or 3+4 ' +
      '(does not shift when using Heat Dash)',
    expected: ['Transition to HBS with D or 3+4'],
  },
  {
    move: 'Lars-f+1,2,3',
    covers: 'parentheses can be nested',
    notes:
      '* Cancel DEN and transition to standing with input B ' +
      '(-12/+41d (-17)/+42a)',
    expected: [
      'Cancel DEN and transition to standing with B (-12/+41d (-17)/+42a)',
    ],
  },
  {
    move: 'Xiaoyu-df+3',
    covers: 'a group the frame markers empty out goes with them',
    notes: '* Cancel to BT with B (r31)',
    expected: ['Cancel to BT with B'],
  },
  {
    move: 'Yoshimitsu-uf+1+3',
    covers: 'two frame windows, the second one after a comma',
    notes: '* Cancel to r60 DGF with 1+2 on frame 35, delayable up to frame 92',
    expected: ['Cancel to DGF with 1+2'],
  },
  {
    move: 'Steve-4',
    covers: '"after 7F with 14F delay" goes, and so does "(steps left)"',
    notes:
      '* Actionable for 21F\n' +
      '* Transition to r15 SWY with b+3_4 after 7F with 14F delay\n' +
      '* Transition to r1 DCK with f+3_4 after 7F with 14F delay\n' +
      '* Transition to r8 LWV with u+3_4 (steps left) after 20F\n' +
      '* Can cancel into r1 block when transitioning from attacks ' +
      'that transition to RWV',
    expected: [
      'Transition to SWY with b+3_4',
      'Transition to DCK with f+3_4',
      'Transition to LWV with u+3_4',
      'Can cancel into block when transitioning from attacks that transition to RWV',
    ],
  },
  {
    move: 'Nina-b,B+2+3',
    covers:
      'no bullet, and the recovery frames are the destination, so the "to" ' +
      'goes with them',
    notes: 'Cancel to r25 with b,b',
    expected: ['Cancel with b,b'],
  },
  {
    move: 'Yoshimitsu-KIN.d+1',
    covers: 'a real destination after the marker keeps its "to"',
    notes: '* Weapon\n* Cancel to r34 FC with DB on frame 16',
    expected: ['Cancel to FC with DB'],
  },
  {
    move: 'Lili-BT.d+3+4',
    covers: 'a run of two markers as the destination goes with the "to" too',
    notes: '* Transition to t63 r41 with F (cs8~46)',
    expected: ['Transition with F (cs8~46)'],
  },
  {
    move: 'Reina-d+3',
    covers: 'nested ** bullets, and a line carrying wiki markup is skipped',
    notes:
      '* Transition to UNS (Kou, d)\n' +
      '* Transition to UNS (Gou) r20 with b+3\n' +
      '* Transition to UNS (Kou) r18 with u+3\n' +
      '* Transition to SEN r14 with f+3\n' +
      '* Transition to WGS r1 with DF\n' +
      '** Execute EWGF or EWGK by inputting 2 or 3 respectively exactly ' +
      'one frame after DF\n' +
      '* Punch parry, transitions to WGS on successful parry with ' +
      '[[Reina_combos#Mini-combos|+13]]',
    // the stance the parentheses named (Kou, Gou) is lost with them
    expected: [
      'Transition to UNS',
      'Transition to UNS with b+3',
      'Transition to UNS with u+3',
      'Transition to SEN with f+3',
      'Transition to WGS with DF',
    ],
  },
  {
    move: 'Victor-ws1+2',
    covers: 'the csv keeps \\r\\n inside notes where the json movelists do not',
    notes: '* Weapon\r\n* Transition to PRF (-8/+8) with F',
    expected: ['Transition to PRF (-8/+8) with F'],
  },
  {
    move: 'Alisa-3,2',
    covers: 'a transition the move does not have is dropped',
    notes: '* Does not transition to DES when using Heat Dash',
    expected: [],
  },
  {
    move: 'Asuka-df+1,2',
    covers: 'so is one the move only sometimes has',
    notes:
      "* Won't transition to throw if opponent is too far " +
      '(Jack-8 range 3.3~), gives +13 on hit instead',
    expected: [],
  },
  {
    move: 'Lidia-HRS.2',
    covers: 'a transition that merely mentions "not" is kept',
    notes: '* Transition to r33 HAE on hit only when heat is not depleted',
    expected: ['Transition to HAE on hit only when heat is not depleted'],
  },
  {
    move: 'Yoshimitsu-uf+3+4',
    covers: 'the condition in front of the verb is kept',
    notes: '* In 1SS cancel to DGF r41 with 1+2 on frame 23',
    expected: ['In 1SS cancel to DGF with 1+2'],
  },
  {
    move: 'Bryan-d,db,b',
    covers: '"to enter" with no destination after it is not a transition',
    notes:
      '* Cancel to SS on any frame with u\n' +
      '* Minimum 3f needed to enter (one for each directional)',
    expected: ['Cancel to SS with u'],
  },
  {
    move: 'Anna-db+4',
    covers:
      '"automatically" goes, and backing out of a transition is kept even ' +
      'though "cancel" is not followed by "to" or "into"',
    notes:
      '* Transition to r26 HAM on hit automatically\n' +
      '* Cancel HAM transition -13 +1 with B',
    expected: [
      'Transition to HAM on hit',
      'Cancel HAM transition -13 +1 with B',
    ],
  },
  {
    move: 'Yoshimitsu-f+3+4',
    covers: 'dropping a leading "Automatically" recapitalises the line',
    notes: '* Automatically transitions to r55 IND on self-wallsplat',
    expected: ['Transitions to IND on self-wallsplat'],
  },
];

test.each(transitionNotesCases)('getTransitionNotes $move — $covers', ({
  notes,
  expected,
}) => {
  expect(getTransitionNotes({ notes } as Move)).toEqual(expected);
});

test('getTransitionNotes without a notes property', () => {
  expect(getTransitionNotes({} as Move)).toEqual([]);
});
