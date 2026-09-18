export type LocalStorageStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  write: (value: T) => void;
  clear: () => void;
};

/**
 * A localStorage-backed store for useSyncExternalStore. The parsed value is
 * kept in memory and only re-read when it can actually have changed, so
 * getSnapshot stays cheap and returns a stable reference between changes.
 */
export function createLocalStorageStore<T>(
  key: string,
  defaultValue: T,
  parse: (raw: unknown) => T,
  serialize: (value: T) => unknown = (value) => value,
): LocalStorageStore<T> {
  const listeners = new Set<() => void>();

  function emit() {
    for (const l of listeners) l();
  }

  let cachedValue: T = defaultValue;
  let hasCachedValue = false;

  function setCachedValue(value: T) {
    cachedValue = value;
    hasCachedValue = true;
  }

  function getSnapshot(): T {
    if (hasCachedValue) return cachedValue;

    try {
      const stored = localStorage.getItem(key);
      setCachedValue(stored ? parse(JSON.parse(stored)) : defaultValue);
    } catch {
      // Unreadable or malformed storage: fall back to the default. Cached so a
      // throwing parse doesn't re-run on every snapshot.
      setCachedValue(defaultValue);
    }

    return cachedValue;
  }

  // One storage listener per store rather than one per subscriber: a cross-tab
  // write only needs to invalidate the cache once, however many are mounted.
  let handleStorage: ((e: StorageEvent) => void) | null = null;

  return {
    subscribe(listener) {
      listeners.add(listener);

      if (!handleStorage) {
        // Storage events went unobserved while nothing was subscribed, so the
        // cache may be stale as of right now.
        hasCachedValue = false;

        handleStorage = (e: StorageEvent) => {
          if (e.key !== key) return;
          hasCachedValue = false;
          emit();
        };
        window.addEventListener('storage', handleStorage);
      }

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && handleStorage) {
          window.removeEventListener('storage', handleStorage);
          handleStorage = null;
        }
      };
    },
    getSnapshot,
    getServerSnapshot: () => defaultValue,
    write(value) {
      try {
        localStorage.setItem(key, JSON.stringify(serialize(value)));
      } catch {
        // Ignore storage write failures (e.g. quota exceeded/private mode).
      }
      setCachedValue(value);
      emit();
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }
      setCachedValue(defaultValue);
      emit();
    },
  };
}
