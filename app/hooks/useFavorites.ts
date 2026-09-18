import { useCallback, useSyncExternalStore } from 'react';

import { type MoveT8 } from '~/types/Move';
import {
  favoritesStore,
  getFavoriteKey,
  toggleFavoriteKey,
} from '~/utils/favorites';

export function useFavorites() {
  const favorites = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    favoritesStore.getServerSnapshot,
  );

  const isFavorite = useCallback(
    (move: MoveT8) => favorites.has(getFavoriteKey(move)),
    [favorites],
  );

  const toggleFavorite = useCallback((move: MoveT8) => {
    const key = getFavoriteKey(move);
    if (!key) return;

    favoritesStore.write(toggleFavoriteKey(favoritesStore.getSnapshot(), key));
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
