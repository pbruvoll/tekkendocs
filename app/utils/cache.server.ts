import {
  type CacheEntry,
  cachified as baseCachified,
  type CachifiedOptions,
  lruCacheAdapter,
} from 'cachified'
import { LRUCache } from 'lru-cache'
const lru = new LRUCache<string, CacheEntry>({ max: 200 })
export function cachified<Value>(
  options: Omit<CachifiedOptions<Value>, 'cache'>,
) {
  return baseCachified({
    cache: lruCacheAdapter(lru),
    ...options,
  })
}
