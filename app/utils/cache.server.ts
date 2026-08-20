import {
  cachified as baseCachified,
  type Cache,
  type CacheEntry,
  type CachifiedOptions,
  totalTtl,
} from '@epic-web/cachified';
import { LRUCache } from 'lru-cache';

const lruInstance = new LRUCache<string, CacheEntry>({ max: 200 });
/* cachified v5 dropped its built-in adapters, so the lru adapter lives here */
const lru: Cache = {
  set(key, value) {
    const ttl = totalTtl(value?.metadata);
    return lruInstance.set(key, value, {
      ttl: ttl === Infinity ? undefined : ttl,
      start: value?.metadata?.createdTime,
    });
  },
  get(key) {
    return lruInstance.get(key);
  },
  delete(key) {
    return lruInstance.delete(key);
  },
};
export function cachified<Value>(
  options: Omit<CachifiedOptions<Value>, 'cache'>,
) {
  return baseCachified({
    cache: lru,
    ...options,
  });
}
