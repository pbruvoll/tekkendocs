import { useCallback, useEffect, useState } from 'react';

import { type MoveT8 } from '~/types/Move';
import {
  type FavoriteMoves,
  getFavoriteKey,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from '~/utils/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMoves>(() => new Set());

  useEffect(() => {
    setFavorites(readFavoritesFromStorage());
  }, []);

  const isFavorite = useCallback(
    (move: MoveT8) => favorites.has(getFavoriteKey(move)),
    [favorites],
  );

  const toggleFavorite = useCallback((move: MoveT8) => {
    const key = getFavoriteKey(move);
    if (!key) return;

    setFavorites((prev) => {
      const next = new Set(prev);

      if (!next.delete(key)) {
        next.add(key);
      }

      writeFavoritesToStorage(next);

      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
