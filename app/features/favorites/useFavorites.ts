import { useCallback, useSyncExternalStore } from 'react';
import {
  favoritesStore,
  getFavoriteKey,
  getFavoriteKeys,
  toggleFavoriteKeys,
} from '~/features/favorites/favoritesStore';
import { type MoveT8 } from '~/types/Move';

const toggleFavoriteKeysInStore = (keys: string[]) => {
  if (!keys.length) return;

  favoritesStore.write(toggleFavoriteKeys(favoritesStore.getSnapshot(), keys));
};

const toggleFavoriteMove = (move: MoveT8) =>
  toggleFavoriteKeysInStore(getFavoriteKeys([move]));

/**
 * Subscribes to every favorite at once, for filtering a move list. For the
 * heart on a move use useAreFavorites, so one toggle doesn't re-render them
 * all.
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
 * Subscribes to a group of moves, favorited only when every move in it is.
 * Toggling favorites the whole group, or clears it when they all already are.
 * The snapshot is a boolean, so the component re-renders only when that answer
 * changes. An empty group is allowed, since hooks can't be called
 * conditionally.
 */
export function useAreFavorites(moves: MoveT8[]) {
  const keys = getFavoriteKeys(moves);

  const isFavorite = useSyncExternalStore(
    favoritesStore.subscribe,
    () =>
      keys.length > 0 &&
      keys.every((key) => favoritesStore.getSnapshot().has(key)),
    () => false,
  );

  return {
    isFavorite,
    toggleFavorite: () => toggleFavoriteKeysInStore(keys),
  };
}

/**
 * Subscribes to one move's favorite state. Takes undefined for a move that
 * isn't known yet, since hooks can't be called conditionally.
 */
export function useIsFavorite(move: MoveT8 | undefined) {
  return useAreFavorites(move ? [move] : []);
}
