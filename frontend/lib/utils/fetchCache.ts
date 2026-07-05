'use client';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL = 30_000;

function getCacheKey(url: string, method: string, body?: unknown): string {
  if (body) return `${method}:${url}:${JSON.stringify(body)}`;
  return `${method}:${url}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttl = DEFAULT_TTL): void {
  if (cache.size > 100) {
    const oldest = cache.entries().next().value;
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

const inflight = new Map<string, Promise<unknown>>();

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cacheTtl?: number },
): Promise<T> {
  const method = options?.method || 'GET';
  const cacheKey = getCacheKey(url, method, options?.body);

  if (method === 'GET') {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) return cached;

    const existing = inflight.get(cacheKey);
    if (existing) return (await existing) as T;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, { ...options, cache: options?.cache || 'no-store' });
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      const data: T = await res.json();
      if (method === 'GET') {
        setCache(cacheKey, data, options?.cacheTtl);
      }
      return data;
    } finally {
      if (method === 'GET') {
        inflight.delete(cacheKey);
      }
    }
  })();

  if (method === 'GET') {
    inflight.set(cacheKey, fetchPromise);
  }

  return (await fetchPromise) as T;
}

export function invalidatePostsCache(): void {
  clearCache('/api/posts/');
  clearCache('/api/post/');
}
