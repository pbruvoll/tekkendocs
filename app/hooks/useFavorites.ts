import { useCallback, useSyncExternalStore } from 'react';

import { type MoveT8 } from '~/types/Move';
import {
  favoritesStore,
  getFavoriteKey,
  toggleFavoriteKey,
} from '~/utils/favorites';

const toggleFavoriteMove = (move: MoveT8) => {
  const key = getFavoriteKey(move);
  if (!key) return;

  favoritesStore.write(toggleFavoriteKey(favoritesStore.getSnapshot(), key));
};

/**
 * Subscribes to the whole favorites set. Use this when you need every favorite
 * at once, such as filtering a move list; prefer useIsFavorite for a heart on a
 * single move, so one toggle doesn't re-render all of them.
 */
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

  return {
    favorites,
    isFavorite,
    toggleFavorite: toggleFavoriteMove,
  };
}

/**
 * Subscribes to one move's favorite state. The snapshot is a boolean, so a
 * component only re-renders when that move is toggled, not when any other is.
 * Accepts undefined for moves that can't be favorited, since hooks can't be
 * called conditionally.
 */
export function useIsFavorite(move: MoveT8 | undefined) {
  const key = move ? getFavoriteKey(move) : undefined;

  const isFavorite = useSyncExternalStore(
    favoritesStore.subscribe,
    () => (key ? favoritesStore.getSnapshot().has(key) : false),
    () => false,
  );

  const toggleFavorite = useCallback(() => {
    if (move) toggleFavoriteMove(move);
  }, [move]);

  return { isFavorite, toggleFavorite };
}
