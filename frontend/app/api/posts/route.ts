// last edited 2026-05-17 by roshhellwett

import { NextResponse } from 'next/server';
import { fetchPosts } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const FRESH_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const rawLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1);
  const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
  const category = searchParams.get('category') || undefined;

  try {
    const { posts, count } = await fetchPosts(page, limit, category);
    return NextResponse.json({ posts, count }, { headers: FRESH_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500, headers: FRESH_HEADERS },
    );
  }
}
