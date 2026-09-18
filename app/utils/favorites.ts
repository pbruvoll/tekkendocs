import { type MoveT8 } from '~/types/Move';

const STORAGE_KEY = 't8FavoriteMoves';

export type FavoriteMoves = ReadonlySet<string>;

export const readFavoritesFromStorage = (): FavoriteMoves => {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed as string[]);
      }
    }
  } catch {
    // ignore parse errors
  }
  return new Set();
};

export const writeFavoritesToStorage = (favorites: FavoriteMoves) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch {
    // ignore write errors
  }
};

export const getFavoriteKey = (move: MoveT8) => move.wavuId;
