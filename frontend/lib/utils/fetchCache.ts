'use client';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 30_000;
const FALLBACK_TTL = 24 * 60 * 60 * 1000; // 24 hours fallback window

function getCacheKey(url: string, method: string, body?: unknown): string {
  if (body) return `${method}:${url}:${JSON.stringify(body)}`;
  return `${method}:${url}`;
}

function getFromLocalStorage<T>(key: string): CacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(`zenith_cache_${key}`);
    if (!item) return null;
    return JSON.parse(item) as CacheEntry;
  } catch {
    return null;
  }
}

function saveToLocalStorage(key: string, entry: CacheEntry): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`zenith_cache_${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota errors
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
      try { window.localStorage.removeItem(`zenith_cache_${key}`); } catch {}
    }
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttl = DEFAULT_TTL): void {
  if (cache.size > 100) {
    const oldest = cache.entries().next().value;
    if (oldest) {
      cache.delete(oldest[0]);
      if (typeof window !== 'undefined') {
        try { window.localStorage.removeItem(`zenith_cache_${oldest[0]}`); } catch {}
      }
    }
  }
  const entry = { data, timestamp: Date.now(), ttl };
  cache.set(key, entry);
  if (key.includes('/api/posts/') || key.includes('/api/post/')) {
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
          if (k?.startsWith('zenith_cache_')) window.localStorage.removeItem(k);
        }
      } catch {}
    }
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      if (typeof window !== 'undefined') {
        try { window.localStorage.removeItem(`zenith_cache_${key}`); } catch {}
      }
    }
  }
}

const inflight = new Map<string, Promise<unknown>>();

async function fetchWithRetry<T>(url: string, options?: RequestInit, retries = 2, delayMs = 600): Promise<T> {
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
      if (attempt < retries) {
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
    const cached = getCached<T>(cacheKey, false);
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
          console.warn(`[Fetch Fallback] Serving stale data for ${url} due to network error:`, err);
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
