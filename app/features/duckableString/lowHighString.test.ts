import { describe, expect, it } from 'vitest';
import { type Move } from '~/types/Move';
import { isDuckableString } from '~/utils/frameDataUtils';
import { canDuckHighAfterLowHit, isLowHit } from './lowHighString';

const move = (hitLevel: string, notes = '') => ({ hitLevel, notes }) as Move;

// Wavu data where the "High String Punishment" sheet agrees: "duck on hit"
const duckableOnHit: [string, string, string, string][] = [
  ['anna', 'd+4,1', 'l, h', '* Combo from 1st CH with 5f delay'],
  ['bryan', 'd+3,2', 'l, h', '* Combo from 1st CH'],
  ['dragunov', 'd+4,1', 'L, h', '* Combo from 1st CH with 1f delay'],
  ['dragunov', 'd+4,4', 'L, h', '* Combo from 1st CH'],
  ['hwoarang', 'db+4,4', 'L, h', '* Combo from 1st CH'],
  ['jack-8', 'db+3, ... 1+2', 'l, h', ''],
  ['jin', 'd+3,4', 'l, h', '* Combo from 1st CH'],
  ['jun', 'd+4,4', 'L, h', '* Combo from 1st CH'],
  ['lars', 'd+3,1', 'l, h,h', '* Combo from 1st hit CH'],
  ['law', 'd+1,3', 'l, h', ''],
  ['law', 'd+3,3', 'l, h', '* Combos from 1st hit CH'],
  ['leo', 'd+4,2', 'L, h', '* Combo from 1st CH'],
  ['nina', 'SS.4,2', 'L, h', '* Combo from 1st CH'],
  ['shaheen', 'FC.df+4,1', 'L, h', '* Combo from 1st CH'],
  ['shaheen', 'f+2,4,4', 'h, L, h', '* Aerial combo from 2nd CH'],
  ['xiaoyu', 'BT.d+3,4', 'L, h', '* Combo from 1st CH with 12F delay'],
  ['xiaoyu', 'd+3,4', 'L, h', '* Combo from 1st CH'],
  ['zafina', 'SCR.d+3,3', 'l, h', '* Combo from 1st CH'],
  ['zafina', 'd+4,3', 'L, h', '* Combo from 1st hit CH with 11f delay'],
];

// ...and "must block low"
const mustBlockLow: [string, string, string, string][] = [
  ['alisa', 'd+4,1+2', 'L, h', '* Jail from 1st attack\n* Combo from 1st CH'],
  ['claudio', 'db+4,3', 'L, h', '* Combo from 1st hit with 1f delay'],
  ['feng', 'FC.df+4,1', 'l, h', '* Combo from 1st hit'],
  [
    'hwoarang',
    'd+4,4',
    'l, h',
    '* Jail from 1st normal hit\n* Combo from 1st CH',
  ],
  ['lars', 'db+1,3', 'l, h', '* Combo from 1st hit'],
  ['law', 'd+4,3', 'l, h', '* Combos from 1st hit'],
  ['lee', 'b+3,3', 'l, h', '* Combos from 1st hit'],
  ['leroy', 'd+3,2', 'L, h', '* Combos from 1st hit'],
  ['lili', 'd+1,2', 'L, h', '* Combo from 1st hit with 4f delay'],
  ['raven', 'BT.f+4,1', 'L, h', '* Combo from 1st hit'],
  ['steve', 'db+3,2', 'l, h', '* Combo from 1st hit'],
  ['steve', 'uf+3,2', 'l, h', '* Combo from 1st hit'],
  ['victor', 'd+1,1', 'L, h', '* Combo from 1st CH\n* Jail on 1st hit'],
];

describe('isDuckableString', () => {
  it.each(
    duckableOnHit,
  )('%s %s is duckable after the low hits', (_character, _command, hitLevel, notes) => {
    expect(isDuckableString(move(hitLevel, notes))).toBe(true);
  });

  it.each(
    mustBlockLow,
  )('%s %s is not duckable', (_character, _command, hitLevel, notes) => {
    expect(isDuckableString(move(hitLevel, notes))).toBe(false);
  });

  it('is duckable when tagged as duckable', () => {
    expect(
      isDuckableString({ ...move('l, h'), tags: { dck: '' } } as Move),
    ).toBe(true);
  });

  it('only reads combo notes when the hit before the high is a low', () => {
    expect(isDuckableString(move('h, h', '* Combo from 1st hit'))).toBe(true);
    expect(isDuckableString(move('l, m, h', '* Combo from 1st hit'))).toBe(
      true,
    );
  });
});

describe('isLowHit', () => {
  it('finds a low', () => {
    expect(isLowHit('L')).toBe(true);
    expect(isLowHit('l')).toBe(true);
    expect(isLowHit('sl,l')).toBe(true);
  });

  it('only looks at the last part of a hit', () => {
    expect(isLowHit('L,h')).toBe(false);
  });

  it('does not count a special low as a low', () => {
    expect(isLowHit('sl')).toBe(false);
    expect(isLowHit('l,sl')).toBe(false);
  });

  it('is false when there is no hit', () => {
    expect(isLowHit(undefined)).toBe(false);
  });
});

describe('canDuckHighAfterLowHit', () => {
  it('is not duckable when the notes say so', () => {
    expect(
      canDuckHighAfterLowHit(
        move('L, L, L, h', '** Not duckable from the 2nd and 3rd lows'),
      ),
    ).toBe(false);
  });

  it('is not duckable when the high also connects on normal hit', () => {
    expect(
      canDuckHighAfterLowHit(
        move(
          'L, h',
          '* Combo from 1st hit on clean hit\n* Combo from 1st CH with no clean hit',
        ),
      ),
    ).toBe(false);
  });
});
