export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  /** Optional prefix for the IP-based cache key */
  prefix?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();
const PRUNE_INTERVAL = 60_000;
const MAX_ENTRIES_PER_STORE = 1000;

let lastPrune = 0;

function pruneStore(store: Map<string, RateLimitEntry>) {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt || store.size > MAX_ENTRIES_PER_STORE) {
      store.delete(key);
    }
  }
}

function getStore(prefix: string): Map<string, RateLimitEntry> {
  let store = stores.get(prefix);
  if (!store) {
    store = new Map();
    stores.set(prefix, store);
  }
  return store;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const store = getStore(config.prefix || 'default');
  const key = `${config.prefix || 'default'}:${ip}`;

  if (now - lastPrune > PRUNE_INTERVAL) {
    pruneStore(store);
    lastPrune = now;
  }

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  const allowed = entry.count <= config.maxRequests;
  return { allowed, remaining: Math.max(0, config.maxRequests - entry.count), resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || '127.0.0.1';
}
