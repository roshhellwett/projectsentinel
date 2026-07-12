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

export function setServerCache(
  key: string,
  data: unknown,
  ttlMs = 60_000,
): void {
  if (serverCache.size >= MAX_SERVER_CACHE_KEYS) {
    // Batch evict oldest 20% to avoid repeated single evictions
    const entries = [...serverCache.entries()].sort(
      (a, b) => (a[1]?.expiresAt ?? 0) - (b[1]?.expiresAt ?? 0),
    );
    const toEvict = Math.max(1, Math.floor(entries.length * 0.2));
    for (let i = 0; i < toEvict; i++) {
      serverCache.delete(entries[i][0]);
    }
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
