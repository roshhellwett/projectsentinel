import { NextResponse } from 'next/server';
import { Post } from '@/types';
import { getSupabaseServer, withRetry } from '@/lib/supabase/server';
import { getServerCache, setServerCache } from '@/lib/api/serverCache';
import { checkRateLimit, getClientIp } from '@/lib/api/rateLimit';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_IDS = 50;

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }

  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = checkRateLimit(ip, { windowMs: 10_000, maxRequests: 60, prefix: 'batch' });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)), 'Cache-Control': 'no-cache' } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }

  const ids = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ posts: [] });
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
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', 'X-Cache': 'HIT' }
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

    setServerCache(cacheKey, payload, 60_000);

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', 'X-Cache': 'MISS' }
    });
  } catch (err) {
    console.error('[API] Batch fetch error:', err);
    // Return empty gracefully instead of 500
    return NextResponse.json(
      { posts: [] },
      { status: 200, headers: { 'Cache-Control': 'no-cache' } }
    );
  }
}
