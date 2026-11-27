import { assert, describe, expect, it } from 'vitest';
import { resolveFlashCardMode } from './DragunovTraining';
import {
  getBlockPunishment,
  isCorrectAnswer,
  punishQuestions,
  shuffle,
  type TrainingMove,
} from './domain';
import { getQuestionDeck } from './dragunovDecks';
import {
  deckProgressId,
  progressStorageKey,
  readDeckProgress,
  saveAnswer,
} from './progress';

function move(block: string, hitLevel = 'm', command = 'df+2'): TrainingMove {
  return { id: `Dragunov-${command}`, command, block, hitLevel };
}

describe('flash card entry', () => {
  it('shows the menu for Dragunov and leaves other characters on Classic', () => {
    expect(resolveFlashCardMode('Dragunov', new URLSearchParams())).toBe(
      'menu',
    );
    expect(
      resolveFlashCardMode('nina', new URLSearchParams('mode=oki-defense')),
    ).toBe('classic');
    expect(
      resolveFlashCardMode('dragunov', new URLSearchParams('mode=classic')),
    ).toBe('classic');
    expect(
      resolveFlashCardMode('dragunov', new URLSearchParams('mode=oki-defense')),
    ).toBe('oki-defense');
  });

  it('opens filtered legacy links in Classic', () => {
    expect(
      resolveFlashCardMode('dragunov', new URLSearchParams('q=df%2B2')),
    ).toBe('classic');
    expect(
      resolveFlashCardMode('dragunov', new URLSearchParams('utm_source=wiki')),
    ).toBe('menu');
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
    const [question] = punishQuestions([move('-10')], 'punish-frames');
    assert(question);
    expect(new Set(question.options.map(({ id }) => id)).size).toBe(4);
    expect(isCorrectAnswer(question, ['i10'])).toBe(true);
    expect(isCorrectAnswer(question, ['safe'])).toBe(false);
  });
});

describe('situation drills', () => {
  it('checks the exact set of working counters', () => {
    const question = getQuestionDeck('string-defense', []).find(
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
    expect(getQuestionDeck('game-plan', [])).toEqual([]);
    const wall = getQuestionDeck('game-plan', [], 'wall');
    expect(wall.every(({ id }) => id.startsWith('wall:'))).toBe(true);
    expect(wall.some((question) => isCorrectAnswer(question, ['yes']))).toBe(
      true,
    );
    expect(wall.some((question) => isCorrectAnswer(question, ['no']))).toBe(
      true,
    );
  });

  it('accepts either legal tech roll and omits it after the tech window', () => {
    const deck = getQuestionDeck('oki-defense', []);
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
    const deck = getQuestionDeck('oki-offense', []);
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

describe('training progress', () => {
  it('isolates scenarios and preserves the legacy store', () => {
    const storage = window.localStorage;
    storage.setItem('t8_flashCardsAppState', '{"dragunov":{"correct":["1"]}}');
    storage.setItem(progressStorageKey, 'invalid JSON');

    const neutral = deckProgressId('dragunov', 'game-plan', 'neutral');
    const wall = deckProgressId('dragunov', 'game-plan', 'wall');
    expect(readDeckProgress(storage, neutral)).toEqual({});
    saveAnswer(storage, neutral, 'df+1', false);
    saveAnswer(storage, wall, 'df+1', true);
    expect(readDeckProgress(storage, neutral)).toEqual({ 'df+1': false });
    expect(readDeckProgress(storage, wall)).toEqual({ 'df+1': true });
    expect(storage.getItem('t8_flashCardsAppState')).toBe(
      '{"dragunov":{"correct":["1"]}}',
    );
    storage.clear();
  });
});
