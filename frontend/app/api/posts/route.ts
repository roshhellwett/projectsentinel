import { NextResponse } from 'next/server';
import { fetchPostsCursor } from '@/lib/supabase/server';
import { getServerCache, setServerCache, invalidateServerCache } from '@/lib/api/serverCache';
import { checkRateLimit, getClientIp } from '@/lib/api/rateLimit';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400',
} as const;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = checkRateLimit(ip, { windowMs: 10_000, maxRequests: 30, prefix: 'posts' });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)), 'Cache-Control': 'no-cache' } },
    );
  }
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') || undefined;
  const rawLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
  const category = searchParams.get('category') || undefined;
  const bypass = searchParams.get('_cb') !== null || searchParams.get('_poll') !== null; // cache-bust param for realtime/polling

  const cacheKey = `posts:cursor=${cursor || 'null'}:limit=${limit}:cat=${category || 'all'}`;

  if (!bypass) {
    const cached = getServerCache<{ posts: unknown[]; nextCursor: string | null; hasMore: boolean }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { ...CACHE_HEADERS, 'X-Cache': 'HIT', 'Server-Timing': `cache;dur=${performance.now() - start}` },
      });
    }
  }

  try {
    const { posts, nextCursor, hasMore } = await fetchPostsCursor(cursor, limit, category);
    const payload = { posts, nextCursor, hasMore };
    setServerCache(cacheKey, payload, 60_000);
    return NextResponse.json(payload, {
      headers: { ...CACHE_HEADERS, 'X-Cache': 'MISS', 'Server-Timing': `db;dur=${performance.now() - start}` },
    });
  } catch (err) {
    console.error('[API] Failed to fetch posts:', err);
    // Try serving stale cache on error
    const stale = getServerCache<{ posts: unknown[]; nextCursor: string | null; hasMore: boolean }>(cacheKey);
    if (stale) {
      return NextResponse.json(stale, {
        headers: { ...CACHE_HEADERS, 'X-Cache': 'STALE', 'Cache-Control': 'public, max-age=10' },
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch posts', posts: [], nextCursor: null, hasMore: false },
      { status: 200, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    );
  }
}
