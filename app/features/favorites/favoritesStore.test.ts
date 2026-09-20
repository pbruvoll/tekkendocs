import { describe, expect, it } from 'vitest';
import { type MoveT8 } from '~/types/Move';
import { getFavoriteKeys, toggleFavoriteKeys } from './favoritesStore';

const move = (wavuId: string) => ({ wavuId }) as MoveT8;

describe('getFavoriteKeys', () => {
  it('keys moves on their wavuId', () => {
    expect(getFavoriteKeys([move('Jin-1'), move('Jin-2')])).toEqual([
      'Jin-1',
      'Jin-2',
    ]);
  });
});

describe('toggleFavoriteKeys', () => {
  it('adds every key when none are favorites', () => {
    expect(toggleFavoriteKeys(new Set(), ['Jin-1', 'Jin-2'])).toEqual(
      new Set(['Jin-1', 'Jin-2']),
    );
  });

  it('adds the missing keys when only some are favorites', () => {
    expect(toggleFavoriteKeys(new Set(['Jin-1']), ['Jin-1', 'Jin-2'])).toEqual(
      new Set(['Jin-1', 'Jin-2']),
    );
  });

  it('removes every key when they are all favorites', () => {
    expect(
      toggleFavoriteKeys(new Set(['Jin-1', 'Jin-2']), ['Jin-1', 'Jin-2']),
    ).toEqual(new Set());
  });

  it('leaves unrelated favorites alone', () => {
    expect(toggleFavoriteKeys(new Set(['Law-1']), ['Jin-1'])).toEqual(
      new Set(['Law-1', 'Jin-1']),
    );
  });

  it('does not mutate the set it is given', () => {
    const favorites = new Set(['Jin-1']);
    toggleFavoriteKeys(favorites, ['Jin-1']);
    expect(favorites).toEqual(new Set(['Jin-1']));
  });
});
