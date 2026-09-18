import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalStorageStore } from './localStorageStore';

const KEY = 'testStore';

const createStore = () =>
  createLocalStorageStore<string[]>(KEY, [], (raw) =>
    Array.isArray(raw) ? (raw as string[]) : [],
  );

const storageEvent = () =>
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }));

beforeEach(() => {
  localStorage.clear();
});

describe('createLocalStorageStore', () => {
  it('reads the stored value', () => {
    localStorage.setItem(KEY, JSON.stringify(['a']));

    expect(createStore().getSnapshot()).toEqual(['a']);
  });

  it('falls back to the default for malformed storage', () => {
    localStorage.setItem(KEY, 'not json');

    expect(createStore().getSnapshot()).toEqual([]);
  });

  it('returns the same reference while the stored value is unchanged', () => {
    localStorage.setItem(KEY, JSON.stringify(['a']));
    const store = createStore();

    const first = store.getSnapshot();
    store.subscribe(() => {});

    expect(store.getSnapshot()).toBe(first);
  });

  it('returns a new reference once the stored value changes', () => {
    localStorage.setItem(KEY, JSON.stringify(['a']));
    const store = createStore();
    const first = store.getSnapshot();

    localStorage.setItem(KEY, JSON.stringify(['a', 'b']));
    storageEvent();

    expect(store.getSnapshot()).not.toBe(first);
    expect(store.getSnapshot()).toEqual(['a', 'b']);
  });

  it('keeps the written value without reparsing it', () => {
    const store = createStore();
    store.subscribe(() => {});
    const written = ['a'];

    store.write(written);

    expect(store.getSnapshot()).toBe(written);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(['a']));
  });

  it('notifies listeners on write and on a change from another tab', () => {
    const store = createStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.write(['a']);
    expect(listener).toHaveBeenCalledTimes(1);

    localStorage.setItem(KEY, JSON.stringify(['a', 'b']));
    storageEvent();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('ignores a storage event that leaves the value unchanged', () => {
    localStorage.setItem(KEY, JSON.stringify(['a']));
    const store = createStore();
    const listener = vi.fn();
    store.subscribe(listener);

    storageEvent();

    expect(listener).not.toHaveBeenCalled();
  });

  it('picks up a change made while nothing was subscribed', () => {
    localStorage.setItem(KEY, JSON.stringify(['a']));
    const store = createStore();
    const unsubscribe = store.subscribe(() => {});
    unsubscribe();

    localStorage.setItem(KEY, JSON.stringify(['b']));

    expect(store.getSnapshot()).toEqual(['b']);
  });

  it('clear empties storage and returns the default', () => {
    localStorage.setItem(KEY, JSON.stringify(['a']));
    const store = createStore();

    store.clear();

    expect(store.getSnapshot()).toEqual([]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
