import { NextResponse } from 'next/server';
import { Post } from '@/types';
import { getSupabaseServer, withRetry } from '@/lib/supabase/server';
import { getServerCache, setServerCache } from '@/lib/api/serverCache';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_IDS = 100;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ids = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(ids)) {
    return NextResponse.json(
      { error: 'Body must be { ids: string[] }' },
      { status: 400 },
    );
  }

  const valid = Array.from(
    new Set(ids.filter((x): x is string => typeof x === 'string' && UUID_RE.test(x))),
  ).slice(0, MAX_IDS);

  if (valid.length === 0) {
    return NextResponse.json({ posts: [] });
  }

  const sortedIds = [...valid].sort().join(',');
  const cacheKey = `batch:${sortedIds}`;
  const cached = getServerCache<{ posts: Post[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' }
    });
  }

  try {
    const data = await withRetry(async () => {
      const { data: res, error } = await getSupabaseServer()
        .from('posts')
        .select('*')
        .in('id', valid);

      if (error) {
        throw new Error(`Batch fetch error: ${error.message}`);
      }
      return res as Post[];
    });

    const byId = new Map((data || []).map((p) => [p.id, p]));
    const ordered = valid.map((id) => byId.get(id)).filter(Boolean) as Post[];
    const payload = { posts: ordered };

    setServerCache(cacheKey, payload, 20_000); // 20s TTL for batch fetches

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' }
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Batch route exception:', err);
    }
    return NextResponse.json(
      { error: 'Failed to fetch batch posts' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  }
}
