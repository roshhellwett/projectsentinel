import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/supabase/server';
import { getServerCache, setServerCache } from '@/lib/api/serverCache';
import { checkRateLimit, getClientIp } from '@/lib/api/rateLimit';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400',
} as const;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = checkRateLimit(ip, { windowMs: 10_000, maxRequests: 20, prefix: 'search' });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)), 'Cache-Control': 'no-cache' } },
    );
  }
  const { searchParams } = new URL(request.url);
  const rawQ = (searchParams.get('q') || '').trim();
  const q = rawQ.slice(0, 100).toLowerCase();
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 20));

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], count: 0 }, { headers: CACHE_HEADERS });
  }

  const cacheKey = `search:q=${encodeURIComponent(q)}:limit=${limit}`;
  const cached = getServerCache<{ posts: unknown[]; count: number }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { ...CACHE_HEADERS, 'X-Cache': 'HIT' } });
  }

  try {
    const result = await searchPosts(q, limit);
    setServerCache(cacheKey, result, 60_000);
    return NextResponse.json(result, { headers: { ...CACHE_HEADERS, 'X-Cache': 'MISS' } });
  } catch (err) {
    console.error('[API] Search error:', err);
    const stale = getServerCache<{ posts: unknown[]; count: number }>(cacheKey);
    if (stale) {
      return NextResponse.json(stale, {
        headers: { 'Cache-Control': 'public, max-age=10', 'X-Cache': 'STALE' },
      });
    }
    return NextResponse.json(
      { error: 'Search failed', posts: [], count: 0 },
      { status: 200, headers: { 'Cache-Control': 'no-cache' } }
    );
  }
}
