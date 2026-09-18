import { type MoveT8 } from '~/types/Move';
import { createLocalStorageStore } from './localStorageStore';

const STORAGE_KEY = 't8FavoriteMoves';

export type FavoriteMoves = ReadonlySet<string>;

const noFavorites: FavoriteMoves = new Set();

const parseFavorites = (raw: unknown): FavoriteMoves =>
  Array.isArray(raw)
    ? new Set(raw.filter((key): key is string => typeof key === 'string'))
    : noFavorites;

export const favoritesStore = createLocalStorageStore<FavoriteMoves>(
  STORAGE_KEY,
  noFavorites,
  parseFavorites,
  (favorites) => Array.from(favorites),
);

export const getFavoriteKey = (move: MoveT8) => move.wavuId;

/** Moves without a wavuId have no key, so they can't be favorited. */
export const getFavoriteKeys = (moves: MoveT8[]) =>
  moves.map(getFavoriteKey).filter((key): key is string => Boolean(key));

/** Adds every key, or removes them all if they are already favorites. */
export const toggleFavoriteKeys = (
  favorites: FavoriteMoves,
  keys: string[],
): FavoriteMoves => {
  const next = new Set(favorites);
  const allFavorites = keys.every((key) => favorites.has(key));

  for (const key of keys) {
    if (allFavorites) {
      next.delete(key);
    } else {
      next.add(key);
    }
  }

  return next;
};
