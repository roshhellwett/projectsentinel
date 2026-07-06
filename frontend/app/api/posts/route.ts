import { NextResponse } from 'next/server';
import { fetchPostsCursor } from '@/lib/supabase/server';
import { getServerCache, setServerCache } from '@/lib/api/serverCache';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') || undefined;
  const rawLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
  const category = searchParams.get('category') || undefined;

  const cacheKey = `posts:cursor=${cursor || 'null'}:limit=${limit}:cat=${category || 'all'}`;
  const cached = getServerCache<{ posts: unknown[]; nextCursor: string | null; hasMore: boolean }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: CACHE_HEADERS });
  }

  try {
    const { posts, nextCursor, hasMore } = await fetchPostsCursor(cursor, limit, category);
    const payload = { posts, nextCursor, hasMore };
    setServerCache(cacheKey, payload, 60_000); // 60s server memory TTL
    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    );
  }
}
