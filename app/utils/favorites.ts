const STORAGE_KEY = 't8FavoriteMoves';

export type FavoriteMoves = Record<string, boolean>;

const defaultFavorites: FavoriteMoves = {};

export const readFavoritesFromStorage = (): FavoriteMoves => {
  if (typeof window === 'undefined') return defaultFavorites;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as FavoriteMoves;
    }
  } catch {
    // ignore parse errors
  }
  return defaultFavorites;
};

export const writeFavoritesToStorage = (favorites: FavoriteMoves) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // ignore write errors
  }
};
