import { LRUCache } from "lru-cache"
import type {
  CacheEntry,
  CachifiedOptions,
} from "cachified"
import {
  lruCacheAdapter,
  cachified as baseCachified,
} from "cachified"
const lru = new LRUCache<string, CacheEntry>({ max: 200 })
export function cachified<Value>(
  options: Omit<CachifiedOptions<Value>, "cache">,
) {
  return baseCachified({
    cache: lruCacheAdapter(lru),
    ...options,
  })
}