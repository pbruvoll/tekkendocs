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

export const toggleFavoriteKey = (
  favorites: FavoriteMoves,
  key: string,
): FavoriteMoves => {
  const next = new Set(favorites);

  if (!next.delete(key)) {
    next.add(key);
  }

  return next;
};
