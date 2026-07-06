interface ServerCacheEntry {
  data: unknown;
  expiresAt: number;
}

const serverCache = new Map<string, ServerCacheEntry>();
const MAX_SERVER_CACHE_KEYS = 500;

export function getServerCache<T>(key: string): T | null {
  const entry = serverCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    serverCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setServerCache(key: string, data: unknown, ttlMs = 60_000): void {
  if (serverCache.size >= MAX_SERVER_CACHE_KEYS) {
    const oldestKey = serverCache.keys().next().value;
    if (oldestKey) serverCache.delete(oldestKey);
  }
  serverCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateServerCache(pattern?: string): void {
  if (!pattern) {
    serverCache.clear();
    return;
  }
  for (const key of serverCache.keys()) {
    if (key.includes(pattern)) {
      serverCache.delete(key);
    }
  }
}
