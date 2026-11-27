import { MoveTags } from '~/constants/moveTags';
import {
  type AnswerOption,
  frameDataSource,
  getBlockPunishment,
  punishQuestions,
  type Question,
  type Stage,
  type TrainingMode,
  type TrainingMove,
  yesNo,
} from './domain';
import { getDragunovDeck } from './dragunovDecks';

type HitLevel = 'h' | 'm' | 'l';

function hitLevel(value: string | undefined): HitLevel | undefined {
  const level = value?.trim().toLowerCase();
  if (level === 'h' || level === 'm' || level === 'l') return level;
  return undefined;
}

function startup(move: TrainingMove) {
  const match = /^i?(\d+)(?:~(\d+))?$/i.exec(
    move.startup?.split(',')[0]?.trim() ?? '',
  );
  if (match) return Number(match[1]);
  return undefined;
}

function hasTag(move: TrainingMove, tag: string) {
  return move.tags?.[tag] !== undefined;
}

function reference(move: TrainingMove, character: string) {
  return {
    moveId: move.id,
    title: move.command,
    source: frameDataSource(move.characterId?.toLowerCase() || character),
  };
}

function choice(
  id: string,
  label: string,
  correct: boolean,
  explanation?: string,
): AnswerOption {
  return { id, label, correct, explanation };
}

function judgment(
  move: TrainingMove,
  character: string,
  key: string,
  context: string,
  prompt: string,
  correct: boolean,
  explanation: string,
): Question {
  return {
    ...reference(move, character),
    id: `${key}:${move.id}`,
    context,
    prompt,
    options: yesNo(correct),
    selection: 'single',
    explanation,
  };
}

function sampleJudgments(
  questions: readonly Question[],
  perAnswer: number,
): Question[] {
  const fits = questions.filter((question) => question.options[0]?.correct);
  const misses = questions.filter((question) => !question.options[0]?.correct);
  return [...fits.slice(0, perAnswer), ...misses.slice(0, perAnswer)];
}

const ordinaryStandingCommand = /^(?:(?:[udfb]|[ud][fb])\+)?[1-4](?:\+[1-4])*$/;

const situations: Record<Stage, { context: string; prompt: string }> = {
  neutral: {
    context:
      'Both players can act on-axis at close range. Assume the first active frame reaches. You want a quick mid to check crouch and a safe finish if the opponent guards.',
    prompt: 'Does this start with a mid by i14 and finish safe on block?',
  },
  pressure: {
    context:
      'You are in range and can use the move as listed. The opponent blocks every hit. You want to retain frame advantage.',
    prompt: 'Does the completed attack leave you plus on block?',
  },
  defense: {
    context:
      'You block a standing attack at point-blank range. It is −10. Your first active frame reaches and the opponent guards as soon as they recover.',
    prompt: 'Can the first hit land before the opponent can guard?',
  },
  'whiff-punish': {
    context:
      'A close-range attack whiffs. The crouching opponent is open for 16 frames. You can input the move immediately from standing and its first active frame reaches.',
    prompt: 'Can the first hit catch crouch by i16?',
  },
  wall: {
    context:
      'The opponent is in range with their back to the wall and has been sidestepping in both directions. You are looking for a homing option.',
    prompt: 'Does this attack have the homing property?',
  },
};

function stageJudgment(
  move: TrainingMove,
  stage: Stage,
): [boolean, string] | undefined {
  const first = hitLevel(move.hitLevel?.split(',')[0]);
  if (!first) return undefined;

  if (stage === 'wall') {
    const homing =
      hasTag(move, MoveTags.Homing) ||
      /^\s*\*?\s*Homing\s*$/im.test(move.notes ?? '');
    return [
      homing,
      homing
        ? 'The move is listed as homing and can cover steps in either direction.'
        : 'The move has no listed homing property. It may still track in some situations.',
    ];
  }

  if (stage === 'pressure') {
    const block = move.block?.trim().replace(/[−–]/g, '-');
    if (!block || !/^[+-]?\d+c?$/i.test(block)) return undefined;
    const plus = Number.parseInt(block, 10) > 0;
    return [
      plus,
      `On block ${block}. ${plus ? 'You recover first.' : 'You gain no frame advantage.'}`,
    ];
  }

  const command = move.command.split(',')[0]?.trim() ?? '';
  const frames = startup(move);
  if (!ordinaryStandingCommand.test(command) || frames === undefined)
    return undefined;

  if (stage === 'neutral') {
    const punish = getBlockPunishment(move);
    if (!punish) return undefined;
    return [
      first === 'm' && frames <= 14 && punish.frames === null,
      `The first hit is ${levelName[first]} at i${frames}. ${punish.explanation}`,
    ];
  }

  const defense = stage === 'defense';
  const limit = defense ? 10 : 16;
  const rightLevel = defense || first === 'm';
  const correct = frames <= limit && rightLevel;
  return [
    correct,
    `The first hit is ${levelName[first]} at i${frames}. ${!rightLevel ? 'This drill needs a mid to catch crouch.' : correct ? `It fits the i${limit} window.` : `It is too slow for the i${limit} window.`}`,
  ];
}

function gamePlan(
  moves: readonly TrainingMove[],
  character: string,
  stage: Stage,
): Question[] {
  const { context, prompt } = situations[stage];
  const candidates = moves.flatMap((move) => {
    const result = stageJudgment(move, stage);
    return result
      ? [judgment(move, character, stage, context, prompt, ...result)]
      : [];
  });
  return sampleJudgments(candidates, 6);
}

const levelName: Record<HitLevel, string> = { h: 'high', m: 'mid', l: 'low' };
const ordinal = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const qualifiedStep =
  /inconsistent|dependent|big bod|small bod|small character|only at|sometimes|tip range|max range/i;

function stringQuestion(
  move: TrainingMove,
  character: string,
  context: string,
  options: AnswerOption[],
  explanation: string,
  key: string,
): Question {
  return {
    ...reference(move, character),
    id: `${key}:${move.id}`,
    context,
    prompt: 'Which options beat the indicated hit? Select all that work.',
    selection: 'multiple',
    options,
    explanation,
  };
}

function documentedCounter(
  move: TrainingMove,
  character: string,
  count: number,
  level: HitLevel,
  event: 'block' | 'hit',
): Question | undefined {
  const previous = ordinal[count - 2];
  if (!previous) return undefined;
  const notes = move.notes ?? '';
  const lineStart = '^\\s*\\*?\\s*';
  const lineEnd = '\\.?[ \\t]*$';
  const window = new RegExp(
    `${lineStart}Interrupt with i(\\d+) from ${previous} (?:normal )?${event}${lineEnd}`,
    'im',
  ).exec(notes);
  const step = qualifiedStep.test(notes)
    ? null
    : new RegExp(
        `${lineStart}Whiffs? vs ([a-z, ]+) from ${previous} (?:normal )?${event}${lineEnd}`,
        'im',
      ).exec(notes);
  const movements =
    step?.[1]?.toUpperCase().split(/[ ,]+/).filter(Boolean) ?? [];
  const directions = movements.every((token) =>
    ['SS', 'SSL', 'SSR', 'SW', 'SWL', 'SWR', 'AND', 'OR'].includes(token),
  )
    ? movements
    : [];
  const options: AnswerOption[] = [];

  if (window) {
    const frames = Number(window[1]);
    const tooSlow = Math.max(12, frames + 1);
    options.push(
      choice(
        'interrupt-i10',
        'Interrupt with a reaching i10 attack',
        frames >= 10,
        `The listed interrupt window is i${frames}.`,
      ),
      choice(
        'interrupt-slow',
        `Interrupt with a reaching i${tooSlow} attack`,
        false,
        `i${tooSlow} exceeds the listed window.`,
      ),
    );
  }

  if (directions.length) {
    for (const [input, label] of [
      ['SSL', 'Sidestep left'],
      ['SSR', 'Sidestep right'],
    ] as const) {
      if (directions.includes(input)) {
        options.push(
          choice(
            input.toLowerCase(),
            label,
            true,
            'The move notes document a whiff in this direction.',
          ),
        );
      }
    }
    if (
      directions.includes('SS') &&
      !options.some(({ id }) => id === 'ssl' || id === 'ssr')
    ) {
      options.push(
        choice(
          'step',
          'Sidestep the extension',
          true,
          'The move notes document a sidestep without specifying a direction.',
        ),
      );
    }
  }

  const duckable =
    count === 2 &&
    level === 'h' &&
    event === 'block' &&
    hasTag(move, MoveTags.Duckable);
  if (duckable) {
    options.push(
      choice(
        'duck',
        'Duck the extension',
        true,
        'The high extension is explicitly marked duckable.',
      ),
    );
    if (options.length === 1) {
      options.push(
        choice(
          'low-crush',
          'Rely on low crush to evade',
          false,
          'Low crush alone does not evade a high.',
        ),
      );
    }
    const stepOption = options.find(
      (option) => option.id === 'ssl' || option.id === 'ssr',
    );
    if (stepOption) {
      options.push(
        choice(
          'step-duck',
          `${stepOption.label}, then duck before contact`,
          true,
          'The move can miss the listed step and misses crouch if you complete it before contact.',
        ),
      );
    }
  } else if (level === 'm') {
    options.push(
      choice('duck', 'Duck in place', false, 'The follow-up is a mid.'),
    );
  }

  if (options.length < 2 || !options.some((option) => option.correct))
    return undefined;
  const firstHit =
    event === 'block'
      ? `You block the ${previous} attack`
      : `The ${previous} attack hits you normally`;
  return stringQuestion(
    move,
    character,
    `${firstHit}, on-axis and in range. The opponent commits to the documented follow-up timing. Assume any listed interrupt input is available from your recovery stance.`,
    options,
    `The answers apply after ${previous}-hit ${event} for this branch. A different delay or continuation can change the coverage.`,
    `documented-${event}`,
  );
}

function levelCounter(
  move: TrainingMove,
  character: string,
  level: HitLevel,
): Question {
  const high = level === 'h';
  const low = level === 'l';
  const guard = low ? 'Block low' : 'Block standing';
  const wrongGuard = low ? 'Block standing' : 'Block low';

  return stringQuestion(
    move,
    character,
    'Consider the final hit of this string in isolation, off the wall and in range. For a crush or armor choice, assume the stated defensive state has already started at contact.',
    [
      choice('guard', guard, true, `The final hit is ${levelName[level]}.`),
      choice(
        'other-guard',
        wrongGuard,
        high,
        high
          ? 'Holding crouch ducks a high.'
          : `This guard does not cover the ${levelName[level]}.`,
      ),
      choice(
        'armor',
        'Use active Power Crush armor',
        !low,
        low
          ? 'Standard armor loses to lows.'
          : 'Standard armor takes the hit as recoverable damage.',
      ),
      choice(
        'high-crush',
        'Use active high crush',
        high,
        high ? 'High crush evades highs.' : 'High crush only evades highs.',
      ),
      choice(
        'low-crush',
        'Use active low crush',
        low,
        low
          ? 'Low crush evades standard lows.'
          : 'Low crush alone does not evade mids or highs.',
      ),
    ],
    `The final hit is ${levelName[level]}. This drill covers what works at contact. The actual gap decides whether you can enter that state.`,
    'hit-level',
  );
}

function stringDefense(
  moves: readonly TrainingMove[],
  character: string,
): Question[] {
  const documented: Question[] = [];
  const example = new Map<HitLevel, Question>();
  for (const move of moves) {
    const hits = move.hitLevel?.split(',') ?? [];
    const level = hitLevel(hits.at(-1));
    if (hits.length < 2 || !level || !move.block?.trim()) continue;
    for (const event of ['block', 'hit'] as const) {
      const question = documentedCounter(
        move,
        character,
        hits.length,
        level,
        event,
      );
      if (question) documented.push(question);
    }
    if (!example.has(level))
      example.set(level, levelCounter(move, character, level));
  }
  return [...documented, ...example.values()];
}

function groundedMoves(moves: readonly TrainingMove[]) {
  return moves.flatMap((move) => {
    const hits = move.hitLevel?.split(',') ?? [];
    const last = hits.at(-1)?.trim();
    if (hits.length !== 1 || !last || !hitLevel(last) || !move.block?.trim())
      return [];
    const grounded = /^[HML]$/.test(last);
    const groundNotes = (move.notes ?? '')
      .split(/\r?\n/)
      .filter((note) =>
        /\b(?:grounded|downed|otg)\b|on the ground/i.test(note),
      );
    if (
      (!grounded && groundNotes.length) ||
      groundNotes.some((note) =>
        /inconsistent|sometimes|conditional|certain|depend|only|except/i.test(
          note,
        ),
      )
    )
      return [];
    return [{ move, grounded }];
  });
}

function okiOffense(
  moves: readonly TrainingMove[],
  character: string,
): Question[] {
  const candidates = groundedMoves(moves);
  const groundAttack = candidates.find(({ grounded }) => grounded)?.move;
  const onGround = candidates
    .filter(({ move }) => groundAttack || hitLevel(move.hitLevel) === 'h')
    .map(({ move, grounded }) =>
      judgment(
        move,
        character,
        'grounded-hit',
        'The opponent stays on the ground and the listed attack reaches their position.',
        'Can this attack hit them while they stay down?',
        grounded,
        grounded
          ? 'The move is listed with a grounded hit. This covers staying down.'
          : 'The listed hit has no grounded property. It can still pressure a rising opponent.',
      ),
    );
  const questions = sampleJudgments(onGround, 4);
  if (groundAttack)
    questions.push(
      judgment(
        groundAttack,
        character,
        'tech-invulnerability',
        'The opponent can tech roll and does so. This attack would reach during the invulnerable portion of the roll.',
        'Does the grounded hit guarantee damage against that timing?',
        false,
        'The same move can hit someone who stays down. The invulnerable part of the tech roll avoids this timing.',
      ),
    );

  const pressureMove = moves.find(
    (move) =>
      hitLevel(move.hitLevel?.split(',')[0]) === 'm' &&
      stageJudgment(move, 'pressure')?.[0],
  );
  if (pressureMove)
    questions.push(
      judgment(
        pressureMove,
        character,
        'tech-guard-pressure',
        'The opponent tech rolls and holds standing guard. You can time this attack to reach after the roll. The goal is to retain the turn if they block.',
        'Does the listed attack fit this wake-up read?',
        true,
        `On block ${pressureMove.block}. This gives frame advantage if your read is right. The tech roll does not guarantee damage.`,
      ),
    );

  return questions;
}

const wakeUpSource = 'https://wavu.wiki/t/Wake-up';

function okiDefense(
  moves: readonly TrainingMove[],
  character: string,
): Question[] {
  const candidates = groundedMoves(moves);
  const groundAttack = candidates.find(({ grounded }) => grounded)?.move;
  const standingAttack = candidates.find(
    ({ move, grounded }) => !grounded && hitLevel(move.hitLevel) === 'h',
  )?.move;
  const questions: Question[] = [];

  if (groundAttack) {
    questions.push({
      ...reference(groundAttack, character),
      id: `tech-roll:${groundAttack.id}`,
      context:
        'You are landing after a knockdown in open space. Lateral tech recovery is available. The follow-up would reach while either lateral tech roll is invulnerable.',
      prompt: 'Which recovery avoids the hit during that window?',
      options: [
        choice('tech-front', 'Tech roll into the foreground', true),
        choice('tech-back', 'Tech roll into the background', true),
        choice('stay', 'Stay down', false),
      ],
      selection: 'single',
      explanation:
        'Either lateral tech roll avoids this timing. Staying down exposes you to the grounded hit.',
      source: wakeUpSource,
    });
  }

  if (!groundAttack) {
    questions.push({
      id: 'lateral-tech-recovery',
      title: 'Recover on landing',
      context:
        'You are about to land face up in open space. This knockdown allows tech recovery, and there is room on both sides.',
      prompt: 'Which input gives you an immediate lateral recovery?',
      options: [
        choice('tech-front', 'Tech roll into the foreground', true),
        choice('tech-back', 'Tech roll into the background', true),
        choice('back', 'Get up backward (b)', false),
      ],
      selection: 'single',
      explanation:
        'Either tech roll recovers laterally on landing. A backward get-up is a different action.',
      source: wakeUpSource,
    });
  }

  if (standingAttack) {
    questions.push({
      ...reference(standingAttack, character),
      id: `delayed-rise:${standingAttack.id}`,
      context:
        'You are already face up on the floor. Tech recovery is over. The attacker commits to this high early enough to catch an immediate rise, then backs out of range.',
      prompt: 'How do you avoid that commitment before getting up?',
      options: [
        choice('stay', 'Stay down through the attack, then rise', true),
        choice('quickstand', 'Quickstand immediately', false),
        choice('back', 'Rise backward immediately', false),
      ],
      selection: 'single',
      explanation: 'The high has no grounded hit. Let it pass and then get up.',
    });
  }

  const backRise: Question = {
    id: 'midscreen-back-rise',
    title: 'Midscreen knockdown',
    context:
      'You are already face up, feet toward the opponent, in open space with no wall behind you. They have backed off and your tech window is over.',
    prompt: 'Which option gets you up while increasing the distance?',
    options: [
      choice('back', 'Get up backward (b)', true),
      choice('quickstand', 'Quickstand (u)', false),
      choice('kick', 'Wake-up kick', false),
    ],
    selection: 'single',
    explanation:
      'Backward get-up creates distance as you rise. Quickstand gets you up in place.',
    source: wakeUpSource,
  };
  return [...questions, backRise];
}

export function getQuestionDeck(
  character: string,
  mode: TrainingMode,
  moves: readonly TrainingMove[],
  stage?: Stage,
): Question[] {
  const characterId = character.toLowerCase();
  if (characterId === 'mokujin') {
    const fighters = new Map<string, TrainingMove[]>();
    for (const move of moves) {
      const id = move.characterId?.toLowerCase();
      if (!id || id === 'mokujin') continue;
      const deck = fighters.get(id);
      if (deck) deck.push(move);
      else fighters.set(id, [move]);
    }

    const questions = new Map<string, Question>();
    for (const [id, fighterMoves] of fighters) {
      for (const question of getQuestionDeck(id, mode, fighterMoves, stage)) {
        const moveId =
          question.moveId ??
          fighterMoves.find(({ command }) => command === question.moveCommand)
            ?.id;
        const key = moveId ? `${id}:${question.id}` : question.id;
        questions.set(key, {
          ...question,
          id: key,
          moveId,
          moveCommand: undefined,
        });
      }
    }
    return [...questions.values()];
  }

  if (mode === 'punish-basic' || mode === 'punish-frames')
    return punishQuestions(moves, mode, characterId);
  if (characterId === 'dragunov') return getDragunovDeck(mode, stage);
  if (mode === 'string-defense') return stringDefense(moves, characterId);
  if (mode === 'oki-offense') return okiOffense(moves, characterId);
  if (mode === 'oki-defense') return okiDefense(moves, characterId);
  return stage ? gamePlan(moves, characterId, stage) : [];
}
