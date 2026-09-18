import { useCallback, useEffect, useState } from 'react';

import { type MoveT8 } from '~/types/Move';
import {
  type FavoriteMoves,
  getFavoriteKey,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from '~/utils/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMoves>({});

  useEffect(() => {
    setFavorites(readFavoritesFromStorage());
  }, []);

  const isFavorite = useCallback(
    (move: MoveT8) => Boolean(favorites[getFavoriteKey(move)]),
    [favorites],
  );

  const toggleFavorite = useCallback((move: MoveT8) => {
    const key = getFavoriteKey(move);
    if (!key) return;

    setFavorites((prev) => {
      const next = { ...prev };

      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
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
