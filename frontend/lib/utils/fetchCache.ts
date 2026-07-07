'use client';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60_000;
const FALLBACK_TTL = 24 * 60 * 60 * 1000; // 24 hours fallback window
const MAX_MEMORY_ITEMS = 100;
const STORAGE_PREFIX = 'zenith_cache_';

function getCacheKey(url: string, method: string, body?: unknown): string {
  if (body) return `${method}:${url}:${JSON.stringify(body)}`;
  return `${method}:${url}`;
}

function pruneLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys: { key: string; timestamp: number }[] = [];
    const now = Date.now();

    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        try {
          const item = window.localStorage.getItem(k);
          if (item) {
            const entry = JSON.parse(item) as CacheEntry;
            if (now - entry.timestamp > FALLBACK_TTL) {
              window.localStorage.removeItem(k);
            } else {
              keys.push({ key: k, timestamp: entry.timestamp });
            }
          }
        } catch {
          window.localStorage.removeItem(k);
        }
      }
    }

    // If still over 50 items in localStorage, sort by timestamp and evict the oldest 20%
    if (keys.length > 50) {
      keys.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.floor(keys.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        window.localStorage.removeItem(keys[i].key);
      }
    }
  } catch {
    // Ignore access errors
  }
}

// Run initial cleanup once in browser environment
if (typeof window !== 'undefined') {
  setTimeout(pruneLocalStorage, 2000);
}

function getFromLocalStorage<T>(key: string): CacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!item) return null;
    return JSON.parse(item) as CacheEntry;
  } catch {
    return null;
  }
}

function saveToLocalStorage(key: string, entry: CacheEntry): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (err) {
    // Check if storage quota exceeded
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014)) {
      pruneLocalStorage();
      try {
        window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch {
        // If still failing after prune, ignore
      }
    }
  }
}

function getCached<T>(key: string, allowStale = false): T | null {
  let entry = cache.get(key);
  if (!entry) {
    entry = getFromLocalStorage<T>(key) || undefined;
    if (entry) {
      cache.set(key, entry);
    }
  }
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (!allowStale && age > entry.ttl) {
    return null;
  }
  if (allowStale && age > FALLBACK_TTL) {
    cache.delete(key);
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`); } catch {}
    }
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttl = DEFAULT_TTL): void {
  // Evict 20% oldest entries when at capacity (batch eviction is more efficient)
  if (cache.size >= MAX_MEMORY_ITEMS) {
    const entries = [...cache.entries()];
    // Sort by timestamp ascending to get oldest first
    entries.sort((a, b) => (a[1]?.timestamp ?? 0) - (b[1]?.timestamp ?? 0));
    const toEvict = Math.max(1, Math.floor(entries.length * 0.2));
    for (let i = 0; i < toEvict; i++) {
      cache.delete(entries[i][0]);
    }
  }
  const entry = { data, timestamp: Date.now(), ttl };
  cache.set(key, entry);
  if (key.startsWith('GET:')) {
    saveToLocalStorage(key, entry);
  }
}

function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    if (typeof window !== 'undefined') {
      try {
        for (let i = window.localStorage.length - 1; i >= 0; i--) {
          const k = window.localStorage.key(i);
          if (k?.startsWith(STORAGE_PREFIX)) window.localStorage.removeItem(k);
        }
      } catch {}
    }
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      if (typeof window !== 'undefined') {
        try { window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`); } catch {}
      }
    }
  }
}

const inflight = new Map<string, Promise<unknown>>();

async function fetchWithRetry<T>(url: string, options?: RequestInit, retries = 2, delayMs = 600): Promise<T> {
  // If offline immediately fail to trigger fallback without waiting
  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new Error('Device is offline');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, cache: options?.cache || 'no-store' });
      if (!res.ok) {
        if ((res.status >= 500 || res.status === 429) && attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`fetch failed: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt < retries && (typeof window === 'undefined' || navigator.onLine)) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Fetch exhausted retries');
}

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cacheTtl?: number },
): Promise<T> {
  const method = options?.method || 'GET';
  const shouldCache = method === 'GET' || (options?.cacheTtl !== undefined && options.cacheTtl > 0);
  const cacheKey = getCacheKey(url, method, options?.body);

  if (shouldCache) {
    // When offline, immediately allow stale data even if TTL expired (up to FALLBACK_TTL)
    const isOffline = typeof window !== 'undefined' && !navigator.onLine;
    const cached = getCached<T>(cacheKey, isOffline);
    if (cached !== null) return cached;

    const existing = inflight.get(cacheKey);
    if (existing) return (await existing) as T;
  }

  const fetchPromise = (async () => {
    try {
      const data = await fetchWithRetry<T>(url, options, shouldCache ? 2 : 0);
      if (shouldCache) {
        setCache(cacheKey, data, options?.cacheTtl);
      }
      return data;
    } catch (err) {
      if (shouldCache) {
        const staleFallback = getCached<T>(cacheKey, true);
        if (staleFallback !== null) {
          console.warn(`[Fetch Fallback] Serving stale data for ${url} due to network error/offline:`, err);
          return staleFallback;
        }
      }
      throw err;
    } finally {
      if (shouldCache) {
        inflight.delete(cacheKey);
      }
    }
  })();

  if (shouldCache) {
    inflight.set(cacheKey, fetchPromise);
  }

  return (await fetchPromise) as T;
}

export function invalidatePostsCache(): void {
  clearCache('/api/posts/');
  clearCache('/api/post/');
}
