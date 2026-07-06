import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(50, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 20));

  if (!q) {
    return NextResponse.json({ posts: [], count: 0 }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    });
  }

  try {
    const result = await searchPosts(q, limit);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' }
    });
  } catch {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  }
}
