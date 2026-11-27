import {
  type AnswerOption,
  punishQuestions,
  type Question,
  type Stage,
  type TrainingMode,
  type TrainingMove,
  yesNo,
} from './domain';

const frames = 'https://tekkendocs.com/dragunov';
const guide = 'https://tekkendocs.com/dragunov/guide';
const anti = 'https://tekkendocs.com/dragunov/antistrat';
const wakeUp = 'https://wavu.wiki/t/Wake-up';
const wallOki = 'https://wavu.wiki/t/Dragunov_counterplay#At_the_Wall';
const draftReview = { targetPatch: '3.03.02' };

function option(
  id: string,
  label: string,
  correct: boolean,
  explanation?: string,
): AnswerOption {
  return { id, label, correct, explanation };
}

function judgment(
  id: string,
  command: string,
  context: string,
  prompt: string,
  correct: boolean,
  explanation: string,
  source: string,
): Question {
  return {
    id,
    moveCommand: command,
    title: command,
    context,
    prompt,
    options: yesNo(correct),
    selection: 'single',
    explanation,
    source,
    review: draftReview,
  };
}

type StageExample = readonly [
  command: string,
  suitable: boolean,
  explanation: string,
];

const gamePlan: Record<
  Stage,
  { context: string; examples: readonly StageExample[] }
> = {
  neutral: {
    context:
      'You are on-axis at close range. Both players can act. You want a quick, low-risk check on a crouching opponent.',
    examples: [
      ['df+1', true, 'This fast mid checks crouch and stays safe on block.'],
      [
        'df+4',
        true,
        'A quick, safe mid is enough to make a crouching opponent respect this space.',
      ],
      [
        'b+3',
        false,
        'Its reach and homing property help against movement, but this high misses a crouching opponent.',
      ],
      [
        'df+2',
        false,
        'This mid launcher hits crouch, but is punishable on block. The question calls for a low-risk check.',
      ],
    ],
  },
  pressure: {
    context:
      'The opponent is in range and committed to standing guard. Your goal is to keep frame advantage after they block.',
    examples: [
      ['b+1+2', true, 'This mid leaves Dragunov +6 on block.'],
      ['SNK.4', true, 'From Sneak, this mid leaves Dragunov +7 on block.'],
      [
        'df+1',
        false,
        'This is a safe poke, but Dragunov is minus after it is blocked.',
      ],
      [
        'f+4,3',
        false,
        'The completed series leaves Dragunov minus on block. Both hits are highs.',
      ],
    ],
  },
  defense: {
    context:
      'You have blocked a standing move at point-blank range. The opponent is −10 and will guard on the first possible frame.',
    examples: [
      [
        '2,1',
        true,
        'The i10 start and natural follow-up make this a standing punish at close range.',
      ],
      ['1,2', true, 'The i10 jab starts a natural combo in time to punish.'],
      [
        'b+4,3',
        false,
        'This is an i14 punish. The opponent recovers before the first hit.',
      ],
      [
        '1+2',
        false,
        'Power Crush can absorb an incoming attack. Its i21 startup is too slow to punish here.',
      ],
    ],
  },
  'whiff-punish': {
    context:
      'A close-range attack whiffs. The standing opponent will recover in 15 frames. You can act now and want a launcher.',
    examples: [
      [
        'df+2',
        true,
        'At point-blank range the first active frame is i15 and it launches.',
      ],
      [
        'df+4',
        false,
        'It fits the recovery window but is a poke, so it misses the launch opportunity.',
      ],
      [
        'b+3',
        false,
        'This is useful as a longer-range whiff punish, but it does not launch in this situation.',
      ],
      [
        'f,F+2',
        false,
        'This is a useful advancing punish for bigger whiffs. Here the motion introduces extra input time and the move is not a normal-hit launcher.',
      ],
    ],
  },
  wall: {
    context:
      'A standing opponent whiffs with their back to the wall. You have 14 frames, are at point-blank range, and want a wall splat.',
    examples: [
      [
        'b+4,3',
        true,
        'The i14 string can wall splat a standing opponent on normal hit.',
      ],
      ['f+4,3', true, 'This i14 natural string can wall splat on normal hit.'],
      [
        '1,2',
        false,
        'The jabs fit the window, but the completed string does not wall splat.',
      ],
      [
        'f,F+4',
        false,
        'The startup is too slow for the available whiff recovery.',
      ],
    ],
  },
};

function stringQuestion(
  command: string,
  context: string,
  options: readonly AnswerOption[],
  explanation: string,
  source = frames,
): Question {
  return {
    id: `counter:${command}`,
    moveCommand: command,
    title: command,
    context,
    prompt:
      'Which options avoid or beat the indicated follow-up? Select all that work.',
    options,
    selection: 'multiple',
    explanation,
    source,
    review: draftReview,
  };
}

const stringDefense: readonly Question[] = [
  stringQuestion(
    '4,4',
    'The first kick hits you normally at close range. Dragunov immediately commits to the second hit.',
    [
      option(
        'ssr',
        'Sidestep right on recovery',
        true,
        'The mid follow-up can whiff to your right after a normal hit.',
      ),
      option('duck', 'Duck in place', false, 'The follow-up is a mid.'),
      option(
        'interrupt',
        'Interrupt with an i10 jab',
        false,
        'The listed gap after the first hit is i8.',
      ),
    ],
    'The block situation gives you more time. This question uses the gap after the first hit lands.',
  ),
  stringQuestion(
    'b+1,2',
    'You block hit 1 on-axis at close range. Dragunov commits to the undelayed second hit.',
    [
      option(
        'ssr',
        'Sidestep right',
        true,
        'The mid follow-up can whiff to your right after first-hit block.',
      ),
      option('duck', 'Duck in place', false, 'The follow-up is a mid.'),
      option(
        'interrupt',
        'Interrupt with i10',
        false,
        'The listed interrupt window is i6.',
      ),
    ],
    'Step right as you recover from the first blocked hit.',
    anti,
  ),
  stringQuestion(
    'f+4,3',
    'You block f+4 on-axis and read the undelayed high extension. A step-duck here means stepping as soon as you recover and crouching before contact.',
    [
      option('duck', 'Duck', true, 'The second hit is a high.'),
      option(
        'ssl',
        'Sidestep left',
        true,
        'This extension can whiff against a sidestep after first-hit block.',
      ),
      option(
        'step-duck',
        'Step right, then duck before impact',
        true,
        'The high misses a crouching defender even if the step did not clear its line.',
      ),
      option(
        'interrupt',
        'Interrupt with i15',
        false,
        'The listed interrupt window is i14.',
      ),
    ],
    'This answer is for the stated high branch. The low extension requires a different response.',
  ),
  stringQuestion(
    'd+3,2,1+2',
    'You finish blocking the second hit in range. The final mid comes out immediately. Your armor begins on frame 7 and lasts through contact.',
    [
      option(
        'armor',
        'Use that Power Crush',
        true,
        'Active armor can absorb this mid.',
      ),
      option(
        'interrupt',
        'Interrupt with a reaching i12 attack',
        true,
        'The listed i14 gap is large enough for an i12 attack.',
      ),
      option(
        'high-crush',
        'Rely on high crush alone',
        false,
        'The final hit is a mid.',
      ),
    ],
    'Interrupting stops the swing. Armor absorbs it and still takes recoverable damage.',
  ),
  stringQuestion(
    'b+4,2,1',
    'You block the first two hits. Dragunov commits to the high third hit. Your high-crush state can be active before contact.',
    [
      option(
        'high-crush',
        'Use the active high crush',
        true,
        'A high cannot hit during a true high-crush state.',
      ),
      option(
        'duck',
        'Duck before the third hit',
        true,
        'The high is duckable in this situation.',
      ),
      option(
        'low-crush',
        'Rely on low crush alone',
        false,
        'Low crush does not evade a high.',
      ),
    ],
    'Confirm the high branch. Dragunov can stop, delay, or make a different choice after the first two hits.',
    anti,
  ),
  stringQuestion(
    '2,1,4',
    'You block the first two hits. Dragunov commits to the low extension. Your jumping move enters low crush before contact and stays airborne through it.',
    [
      option(
        'low-crush',
        'Use the active low crush',
        true,
        'The follow-up is a low, so it misses the low-crush state.',
      ),
      option(
        'armor',
        'Rely on Power Crush alone',
        false,
        'Standard Power Crush armor loses to lows.',
      ),
      option(
        'interrupt',
        'Interrupt with i10',
        false,
        'The listed interrupt window is i7.',
      ),
    ],
    'A standing jab is too slow for this gap. Use a low defense or a crush that starts in time.',
  ),
];

const okiOffense = [
  judgment(
    'pgr-grounded-mid',
    'PGR.2',
    'At the wall after a knockdown, Dragunov is in Pigeon Roll, in range and on-axis. The opponent stays down.',
    'Will this move hit the grounded opponent?',
    true,
    'This Pigeon Roll mid has a grounded hit. The answer assumes the opponent stays down.',
    wallOki,
  ),
  judgment(
    'pgr-grounded-low',
    'PGR.3',
    'At the wall after a knockdown, Dragunov is in Pigeon Roll, in range and on-axis. The opponent stays down.',
    'Will this move hit the grounded opponent?',
    false,
    'The sweep attacks a standing or rising opponent, but does not have a grounded hit.',
    wallOki,
  ),
  judgment(
    'otg-sweep-grounded',
    'OTG.db+3',
    'Dragunov is close enough to reach an opponent lying at his feet. The opponent stays down through impact.',
    'Will this move hit the grounded opponent?',
    true,
    'This OTG attack can connect with a grounded opponent. This says nothing about coverage if they change their wake-up timing.',
    frames,
  ),
  judgment(
    'jab-grounded',
    '1',
    'Dragunov is in range after a midscreen knockdown. The opponent stays down through impact.',
    'Will a jab hit the grounded opponent?',
    false,
    'Dragunov’s standing jab is a high. It can pressure a standing opponent after they recover, but cannot hit an opponent who stays down.',
    frames,
  ),
  judgment(
    'hammer-after-tech-guard',
    'b+1+2',
    'You read an opponent who tech rolls and then holds standing guard. You can time this move to reach after the roll and start pressure.',
    'Does this fit your plan to keep the turn against standing guard?',
    true,
    'A blocked b+1+2 leaves Dragunov at +6. This is pressure against a read, so the roll itself does not guarantee the hit.',
    frames,
  ),
  judgment(
    'otg-against-tech',
    'OTG.db+3',
    'The opponent can tech roll. They tech roll on contact with the floor, and your sweep would reach during the roll’s invulnerable portion.',
    'Does your grounded hit guarantee damage against that wake-up?',
    false,
    'Grounded hit properties cover staying down. The invulnerable part of a tech roll avoids this timing.',
    wakeUp,
  ),
] satisfies readonly Question[];

const wakeOptions = {
  quickstand: 'Quickstand (u)',
  back: 'Get up backward (b)',
  kick: 'Wake-up kick',
  stay: 'Stay down through the attack, then rise',
  techFront: 'Tech roll toward the foreground',
  techBack: 'Tech roll toward the background',
};

function wakeQuestion(
  id: string,
  title: string,
  context: string,
  prompt: string,
  options: readonly AnswerOption[],
  explanation: string,
  source = wakeUp,
  command?: string,
): Question {
  return {
    id,
    moveCommand: command,
    title,
    context,
    prompt,
    options,
    selection: 'single',
    explanation,
    source,
    review: draftReview,
  };
}

const okiDefense: readonly Question[] = [
  wakeQuestion(
    'pgr-sweep-hold',
    'Pigeon Roll at the wall',
    'Dragunov knocked you down face down at the wall. The tech window is over. He commits to PGR.3, which reaches before a straight rise can guard.',
    'How do you avoid this specific follow-up?',
    [
      option('stay', wakeOptions.stay, true),
      option('quickstand', wakeOptions.quickstand, false),
      option('back', wakeOptions.back, false),
    ],
    'The sweep has no grounded hit. Let it pass, then rise. PGR.2 can catch the same decision if Dragunov chooses the mid.',
    wallOki,
    'PGR.3',
  ),
  wakeQuestion(
    'ground-tech-side',
    'Tech recovery against Dragunov',
    'You are landing on your back, feet toward Dragunov, in open space. This knockdown allows recovery on contact with the ground and there is space on both sides.',
    'Which input gives an immediate lateral recovery?',
    [
      option('tech-front', wakeOptions.techFront, true),
      option('tech-back', wakeOptions.techBack, true),
      option('back', wakeOptions.back, false),
      option('kick', wakeOptions.kick, false),
    ],
    'Both lateral tech rolls fit the goal here. Use the recovery input on contact with the floor. A side roll after lying down is a different action.',
  ),
  wakeQuestion(
    'space-back-rise',
    'Midscreen against Dragunov',
    'You are on your back, feet toward Dragunov, with no wall behind you. He has backed out of range and you are past the tech window.',
    'Which option rises while moving away from him?',
    [
      option('back', wakeOptions.back, true),
      option('quickstand', wakeOptions.quickstand, false),
      option('kick', wakeOptions.kick, false),
    ],
    'Backward get-up creates space as you rise. Quickstand gets you up in place.',
  ),
  wakeQuestion(
    'pgr-quickstand-ws4',
    'Pigeon Roll at the wall',
    'After SNK.2 at the wall, you are face down. Dragunov follows with Pigeon Roll. For this drill your quickstand into i11 WS4 reaches in the interrupt window.',
    'Which response uses that opening?',
    [
      option('quickstand-ws4', 'Quickstand into i11 WS4', true),
      option('stay', wakeOptions.stay, false),
      option('back', wakeOptions.back, false),
    ],
    'The quickstand gives access to the while-standing mid. Staying down trades the interrupt opportunity for exposure to PGR.2.',
    wallOki,
    'SNK.2',
  ),
];

export function getQuestionDeck(
  mode: TrainingMode,
  moves: readonly TrainingMove[],
  stage?: Stage,
): Question[] {
  if (mode === 'punish-basic' || mode === 'punish-frames')
    return punishQuestions(moves, mode);
  if (mode === 'string-defense') return [...stringDefense];
  if (mode === 'oki-offense') return [...okiOffense];
  if (mode === 'oki-defense') return [...okiDefense];
  if (!stage) return [];

  const { context, examples } = gamePlan[stage];
  return examples.map(([command, suitable, explanation]) =>
    judgment(
      `${stage}:${command}`,
      command,
      context,
      'Does this move fit the situation?',
      suitable,
      explanation,
      guide,
    ),
  );
}
