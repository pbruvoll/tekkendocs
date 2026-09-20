import { type FavoriteMoves } from '~/types/FavoriteMoves';
import { type MoveT8 } from '~/types/Move';
import { createLocalStorageStore } from '~/utils/localStorageStore';

const STORAGE_KEY = 't8FavoriteMoves';

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

export const getFavoriteKeys = (moves: MoveT8[]) => moves.map(getFavoriteKey);

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
