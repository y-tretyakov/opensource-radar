interface CacheEntry<T> {
  data: T
  expiry: number
}

const store = new Map<string, CacheEntry<unknown>>()
const DEFAULT_TTL = 5 * 60 * 1000
const MAX_ENTRIES = 200
const EVICT_BATCH = 50

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    store.delete(key)
    return null
  }
  store.delete(key)
  store.set(key, entry)
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (store.size >= MAX_ENTRIES) {
    const keys = [...store.keys()]
    for (let i = 0; i < EVICT_BATCH && i < keys.length; i++) {
      store.delete(keys[i])
    }
  }
  store.set(key, { data, expiry: Date.now() + ttl })
}

export function cacheClear(): void {
  store.clear()
}

export function cacheKeys(): string[] {
  return [...store.keys()]
}

export function cacheSize(): number {
  return store.size
}
