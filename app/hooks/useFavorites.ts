import { useCallback, useState } from 'react';

import {
  type FavoriteMoves,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from '~/utils/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMoves>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    return readFavoritesFromStorage();
  });

  const toggleFavorite = useCallback((key: string) => {
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

  const isFavorite = useCallback(
    (key: string) => Boolean(favorites[key]),
    [favorites],
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
