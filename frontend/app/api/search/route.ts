import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/supabase/server';
import { getServerCache, setServerCache } from '@/lib/api/serverCache';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQ = (searchParams.get('q') || '').trim();
  const q = rawQ.slice(0, 100).toLowerCase(); // Normalize and cap length to 100 chars
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 20));

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], count: 0 }, { headers: CACHE_HEADERS });
  }

  const cacheKey = `search:q=${encodeURIComponent(q)}:limit=${limit}`;
  const cached = getServerCache<{ posts: unknown[]; count: number }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: CACHE_HEADERS });
  }

  try {
    const result = await searchPosts(q, limit);
    setServerCache(cacheKey, result, 30_000); // 30s server memory TTL for search
    return NextResponse.json(result, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  }
}
