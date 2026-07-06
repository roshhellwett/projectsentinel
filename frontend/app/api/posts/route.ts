import { NextResponse } from 'next/server';
import { fetchPostsCursor } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') || undefined;
  const rawLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
  const category = searchParams.get('category') || undefined;

  try {
    const { posts, nextCursor, hasMore } = await fetchPostsCursor(cursor, limit, category);
    return NextResponse.json({ posts, nextCursor, hasMore }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    );
  }
}
