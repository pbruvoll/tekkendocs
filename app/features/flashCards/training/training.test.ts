import { assert, describe, expect, it } from 'vitest';
import {
  getBlockPunishment,
  isCorrectAnswer,
  punishQuestions,
  shuffle,
  type TrainingMove,
} from './domain';
import { resolveFlashCardMode } from './FlashCardTraining';
import {
  deckProgressId,
  progressStorageKey,
  readDeckProgress,
  saveAnswer,
} from './progress';
import { getQuestionDeck } from './rosterDecks';

function move(block: string, hitLevel = 'm', command = 'df+2'): TrainingMove {
  return {
    id: `Dragunov-${command}`,
    characterId: 'dragunov',
    command,
    block,
    hitLevel,
  };
}

describe('flash card entry', () => {
  it('shows the mode menu by default and honors explicit modes', () => {
    expect(resolveFlashCardMode(new URLSearchParams())).toBe('menu');
    expect(resolveFlashCardMode(new URLSearchParams('mode=classic'))).toBe(
      'classic',
    );
    expect(resolveFlashCardMode(new URLSearchParams('mode=oki-defense'))).toBe(
      'oki-defense',
    );
  });

  it('opens filtered legacy links in Classic', () => {
    expect(resolveFlashCardMode(new URLSearchParams('q=df%2B2'))).toBe(
      'classic',
    );
    expect(resolveFlashCardMode(new URLSearchParams('utm_source=wiki'))).toBe(
      'menu',
    );
  });
});

describe('block punishment', () => {
  it.each([
    ['-9', null],
    ['−10', 10],
    ['-12', 12],
    ['+6', null],
  ])('evaluates %s in standing guard', (block, expected) => {
    expect(getBlockPunishment(move(block))?.frames).toBe(expected);
  });

  it('applies the while-standing cutoff after a low or forced crouch', () => {
    expect(getBlockPunishment(move('-10', 'm, L'))?.frames).toBeNull();
    expect(getBlockPunishment(move('-11', 'm, L'))?.frames).toBe(11);
    expect(getBlockPunishment(move('-12c'))?.context).toContain('crouching');
  });

  it('keeps standing punishment when the crouch note applies on hit', () => {
    const string = {
      ...move('-12', 'm, m', 'b+1,2'),
      notes: 'Opponent recovers Crouching',
    };
    expect(getBlockPunishment(string)?.context).toContain('standing');
    expect(getBlockPunishment(string)?.frames).toBe(12);
  });

  it('skips spacing exceptions and unresolved ranges, and accepts the verified safe range', () => {
    expect(getBlockPunishment(move('-12~13'))).toBeUndefined();
    expect(getBlockPunishment(move('-15', 'm', 'qcb+2'))).toBeUndefined();
    expect(getBlockPunishment(move('', 't'))).toBeUndefined();
    expect(getBlockPunishment(move('-6~-3', 'm', 'df+3'))?.frames).toBeNull();
  });

  it('skips incomplete sheet rows', () => {
    expect(
      getBlockPunishment({ id: 'bad-move', command: '1,2' }),
    ).toBeUndefined();
    expect(
      getBlockPunishment({ id: 'bad-move', command: '1,2', block: '-12' }),
    ).toBeUndefined();
  });

  it('produces four distinct answer choices and tests the largest startup that fits', () => {
    const [question] = punishQuestions(
      [move('-10')],
      'punish-frames',
      'dragunov',
    );
    assert(question);
    expect(new Set(question.options.map(({ id }) => id)).size).toBe(4);
    expect(isCorrectAnswer(question, ['i10'])).toBe(true);
    expect(isCorrectAnswer(question, ['safe'])).toBe(false);
  });

  it('keeps the spacing exception limited to the character it documents', () => {
    expect(getBlockPunishment(move('-15', 'm', 'qcb+2'))).toBeUndefined();
    const [other] = punishQuestions(
      [{ ...move('-15', 'm', 'qcb+2'), characterId: 'bryan' }],
      'punish-frames',
      'bryan',
    );
    assert(other);
    expect(isCorrectAnswer(other, ['i15'])).toBe(true);
    expect(other.source).toBe('https://tekkendocs.com/t8/bryan');
  });
});

describe('situation drills', () => {
  it('checks the exact set of working counters', () => {
    const question = getQuestionDeck('dragunov', 'string-defense', []).find(
      ({ title }) => title === 'f+4,3',
    );
    assert(question);
    expect(isCorrectAnswer(question, ['step-duck', 'ssl', 'duck'])).toBe(true);
    expect(isCorrectAnswer(question, ['step-duck', 'duck'])).toBe(false);
    expect(
      isCorrectAnswer(question, ['step-duck', 'ssl', 'duck', 'interrupt']),
    ).toBe(false);
  });

  it('selects only the requested game situation with suitable and unsuitable choices', () => {
    expect(getQuestionDeck('dragunov', 'game-plan', [])).toEqual([]);
    const wall = getQuestionDeck('dragunov', 'game-plan', [], 'wall');
    expect(wall.every(({ id }) => id.startsWith('wall:'))).toBe(true);
    expect(wall.some((question) => isCorrectAnswer(question, ['yes']))).toBe(
      true,
    );
    expect(wall.some((question) => isCorrectAnswer(question, ['no']))).toBe(
      true,
    );
  });

  it('accepts either legal tech roll and omits it after the tech window', () => {
    const deck = getQuestionDeck('dragunov', 'oki-defense', []);
    const tech = deck.find(({ id }) => id === 'ground-tech-side');
    const grounded = deck.find(({ id }) => id === 'pgr-sweep-hold');
    assert(tech);
    assert(grounded);
    expect(isCorrectAnswer(tech, ['tech-front'])).toBe(true);
    expect(isCorrectAnswer(tech, ['tech-back'])).toBe(true);
    expect(isCorrectAnswer(tech, ['tech-front', 'tech-back'])).toBe(false);
    expect(grounded.options.every(({ id }) => !id.startsWith('tech-'))).toBe(
      true,
    );
  });

  it('distinguishes pressure after a tech roll from an attack during its invulnerability', () => {
    const deck = getQuestionDeck('dragunov', 'oki-offense', []);
    const pressure = deck.find(({ id }) => id === 'hammer-after-tech-guard');
    const invulnerability = deck.find(({ id }) => id === 'otg-against-tech');
    assert(pressure);
    assert(invulnerability);
    expect(isCorrectAnswer(pressure, ['yes'])).toBe(true);
    expect(isCorrectAnswer(invulnerability, ['no'])).toBe(true);
  });

  it('shuffles a copy without losing or repeating cards', () => {
    const cards = ['a', 'b', 'c'];
    expect(shuffle(cards, () => 0)).toEqual(['b', 'c', 'a']);
    expect(cards).toEqual(['a', 'b', 'c']);
  });
});

describe('roster questions', () => {
  const moves: TrainingMove[] = [
    {
      id: 'Fighter-1',
      command: '1',
      startup: 'i10',
      block: '+1',
      hitLevel: 'h',
    },
    {
      id: 'Fighter-df+1',
      command: 'df+1',
      startup: 'i13~14',
      block: '-3',
      hitLevel: 'm',
    },
    {
      id: 'Fighter-u+4',
      command: 'u+4',
      startup: 'i18',
      block: '+3',
      hitLevel: 'M',
    },
    {
      id: 'Fighter-b+4',
      command: 'b+4',
      startup: 'i17',
      block: '-7',
      hitLevel: 'h',
      tags: { hom: '' },
    },
    {
      id: 'Fighter-2,3',
      command: '2,3',
      startup: 'i12, i24',
      block: '-12',
      hitLevel: 'm, h',
      tags: { dck: '' },
      notes:
        '* Interrupt with i12 from 1st block\n* Whiffs vs SSR from 1st block',
    },
    {
      id: 'Fighter-2,1,3',
      command: '2,1,3',
      startup: 'i12',
      block: '-12',
      hitLevel: 'm, h, m',
      notes: '* Interrupt with i13 from 1st block',
    },
  ];

  it('uses the specified direction and the correct hit gap, with no guessed direction', () => {
    const deck = getQuestionDeck('nina', 'string-defense', moves);
    const documented = deck.find(
      ({ id }) => id === 'documented-block:Fighter-2,3',
    );
    assert(documented);
    expect(
      isCorrectAnswer(documented, [
        'interrupt-i10',
        'ssr',
        'duck',
        'step-duck',
      ]),
    ).toBe(true);
    expect(documented.options.some(({ id }) => id === 'ssl')).toBe(false);
    expect(deck.some(({ id }) => id === 'documented-block:Fighter-2,1,3')).toBe(
      false,
    );
  });

  it.each([
    '* May whiff vs SSR from 1st block',
    '* Whiffs vs SSR from 1st block (range dependent)',
    '* Whiffs vs SSR from 1st block\n* Not possible with big bodies',
  ])('omits qualified sidestep claims (%s)', (note) => {
    const conditional: TrainingMove = {
      id: 'conditional-step',
      command: '2,3',
      hitLevel: 'm, m',
      block: '-9',
      notes: `* Interrupt with i12 from 1st block\n${note}`,
    };
    const question = getQuestionDeck('nina', 'string-defense', [
      conditional,
    ]).find(({ id }) => id.startsWith('documented-block:'));
    assert(question);
    expect(question.options.some(({ id }) => id === 'ssr')).toBe(false);
  });

  it.each([
    'neutral',
    'pressure',
    'defense',
    'whiff-punish',
    'wall',
  ] as const)('produces both outcomes for %s from supplied moves', (stage) => {
    const deck = getQuestionDeck('nina', 'game-plan', moves, stage);
    expect(deck.some((question) => isCorrectAnswer(question, ['yes']))).toBe(
      true,
    );
    expect(deck.some((question) => isCorrectAnswer(question, ['no']))).toBe(
      true,
    );
  });

  it('distinguishes grounded hits, tech invulnerability, and pressure after rising', () => {
    const deck = getQuestionDeck('nina', 'oki-offense', moves);
    const answers = Object.fromEntries(
      deck.map((question) => [question.id, isCorrectAnswer(question, ['yes'])]),
    );
    expect(answers['grounded-hit:Fighter-u+4']).toBe(true);
    expect(answers['grounded-hit:Fighter-1']).toBe(false);
    expect(answers['tech-invulnerability:Fighter-u+4']).toBe(false);
    expect(answers['tech-guard-pressure:Fighter-u+4']).toBe(true);
    const recovery = getQuestionDeck('nina', 'oki-defense', moves).find(
      ({ id }) => id.startsWith('tech-roll:'),
    );
    assert(recovery);
    expect(isCorrectAnswer(recovery, ['tech-front'])).toBe(true);
    expect(isCorrectAnswer(recovery, ['tech-back'])).toBe(true);
  });

  it('does not guess grounded properties when the fighter has no grounded annotations', () => {
    const sparse = moves.filter(({ hitLevel }) => hitLevel !== 'M');
    const oki = getQuestionDeck('roger-jr', 'oki-offense', sparse);
    expect(oki.some(({ id }) => id === 'grounded-hit:Fighter-df+1')).toBe(
      false,
    );
    expect(
      getQuestionDeck('roger-jr', 'oki-defense', sparse).some(
        ({ id }) => id === 'lateral-tech-recovery',
      ),
    ).toBe(true);
  });

  it.each([
    ['l', '* Can hit grounded on certain ranges'],
    ['L', '* Grounded hit can be inconsistent sometimes'],
  ])('omits conditional grounded hits marked %s', (hitLevel, notes) => {
    const rangeDependent: TrainingMove = {
      id: 'conditional-otg',
      command: 'd+3+4',
      hitLevel,
      block: '-12',
      notes,
    };
    expect(
      getQuestionDeck('bryan', 'oki-offense', [rangeDependent, ...moves]).some(
        ({ id }) => id === 'grounded-hit:conditional-otg',
      ),
    ).toBe(false);
  });

  it('samples every fighter in the aggregate and de-duplicates general wake-up questions', () => {
    const mix = ['nina', 'kazuya'].flatMap((characterId) =>
      moves.map((move) => ({
        ...move,
        characterId,
        id: `${characterId}-${move.command}`,
      })),
    );
    const plan = getQuestionDeck('mokujin', 'game-plan', mix, 'pressure');
    expect(plan.some(({ moveId }) => moveId?.startsWith('nina-'))).toBe(true);
    expect(plan.some(({ moveId }) => moveId?.startsWith('kazuya-'))).toBe(true);
    const oki = getQuestionDeck('mokujin', 'oki-defense', mix);
    expect(oki.filter(({ id }) => id === 'midscreen-back-rise')).toHaveLength(
      1,
    );
    expect(oki.some(({ id }) => id.startsWith('nina:tech-roll:'))).toBe(true);
    expect(oki.some(({ id }) => id.startsWith('kazuya:tech-roll:'))).toBe(true);
  });
});

describe('training progress', () => {
  it('isolates scenarios and preserves the legacy store', () => {
    const storage = window.localStorage;
    storage.setItem('t8_flashCardsAppState', '{"dragunov":{"correct":["1"]}}');
    storage.setItem(progressStorageKey, 'invalid JSON');

    const neutral = deckProgressId('dragunov', 'game-plan', 'neutral');
    const wall = deckProgressId('dragunov', 'game-plan', 'wall');
    const nina = deckProgressId('nina', 'game-plan', 'wall');
    expect(readDeckProgress(storage, neutral)).toEqual({});
    saveAnswer(storage, neutral, 'df+1', false);
    saveAnswer(storage, wall, 'df+1', true);
    saveAnswer(storage, nina, 'df+1', false);
    expect(readDeckProgress(storage, neutral)).toEqual({ 'df+1': false });
    expect(readDeckProgress(storage, wall)).toEqual({ 'df+1': true });
    expect(readDeckProgress(storage, nina)).toEqual({ 'df+1': false });
    expect(storage.getItem('t8_flashCardsAppState')).toBe(
      '{"dragunov":{"correct":["1"]}}',
    );
    storage.clear();
  });
});
