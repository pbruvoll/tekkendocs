export type LocalStorageStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  write: (value: T) => void;
  clear: () => void;
};

/**
 * A localStorage-backed store for useSyncExternalStore. The parsed value is
 * cached in memory, so getSnapshot is cheap and returns a stable reference
 * until the stored string actually changes.
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
  // the string cachedValue was parsed from, so an unchanged store is recognised
  // without parsing it into a new value
  let cachedRaw: string | null = null;
  let hasCachedValue = false;

  function setCachedValue(value: T, raw: string | null) {
    cachedValue = value;
    cachedRaw = raw;
    hasCachedValue = true;
  }

  function syncWithStorage() {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // Storage unreadable, e.g. blocked in an embedded context: treat as empty
    }

    if (hasCachedValue && raw === cachedRaw) return;

    try {
      setCachedValue(raw ? parse(JSON.parse(raw)) : defaultValue, raw);
    } catch {
      // Malformed storage; cache the default so a throwing parse doesn't re-run
      // on every snapshot
      setCachedValue(defaultValue, raw);
    }
  }

  // One storage listener per store, not per subscriber: a cross-tab write only
  // has to reach the cache once.
  let handleStorage: ((e: StorageEvent) => void) | null = null;

  function getSnapshot(): T {
    // While a listener is attached, storage events keep the cache current.
    // Without one, another tab may have changed the value since it was cached.
    if (!hasCachedValue || !handleStorage) syncWithStorage();

    return cachedValue;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);

      if (!handleStorage) {
        handleStorage = (e: StorageEvent) => {
          if (e.key !== key && e.key !== null) return;

          const previous = cachedValue;
          syncWithStorage();
          if (cachedValue !== previous) emit();
        };
        window.addEventListener('storage', handleStorage);

        // A write between the last snapshot and this listener would go unseen,
        // so check once; the value is replaced only if the string changed
        syncWithStorage();
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
      const raw = JSON.stringify(serialize(value));

      try {
        localStorage.setItem(key, raw);
      } catch {
        // Ignore storage write failures (e.g. quota exceeded/private mode).
      }

      setCachedValue(value, raw);
      emit();
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }

      setCachedValue(defaultValue, null);
      emit();
    },
  };
}
