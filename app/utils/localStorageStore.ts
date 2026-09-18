export type LocalStorageStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  write: (value: T) => void;
  clear: () => void;
};

/**
 * A localStorage-backed store for useSyncExternalStore. Snapshots are cached by
 * raw string, so getSnapshot returns a stable reference until the value changes.
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

  let cachedRaw: string | null = null;
  let cachedValue: T = defaultValue;

  function getSnapshot(): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        cachedRaw = null;
        cachedValue = defaultValue;
        return defaultValue;
      }
      if (stored === cachedRaw) return cachedValue;

      // Only cache once parsing succeeded, so a throw can't leave cachedRaw
      // pointing at the previous value and make later snapshots inconsistent
      const parsed = parse(JSON.parse(stored));
      cachedRaw = stored;
      cachedValue = parsed;
      return cachedValue;
    } catch {
      cachedRaw = null;
      cachedValue = defaultValue;
      return defaultValue;
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) emit();
      };
      window.addEventListener('storage', handleStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', handleStorage);
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
      emit();
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }
      emit();
    },
  };
}
