import { NextResponse } from 'next/server';
import { fetchPostById, updatePostStatus } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/api/auth';
import { getServerCache, setServerCache, invalidateServerCache } from '@/lib/api/serverCache';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['published', 'corrected', 'retracted'] as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `post:${id}`;
    const cached = getServerCache<{ post: unknown }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
      });
    }

    const post = await fetchPostById(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }
    const payload = { post };
    setServerCache(cacheKey, payload, 30_000); // 30s TTL for single post

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  }
}

function isJsonContentType(request: Request): boolean {
  return request.headers.get('content-type')?.startsWith('application/json') === true;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isJsonContentType(request)) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const authError = await verifyAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, correction_note } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const normalizedNote = correction_note === '' ? null : correction_note;
    await updatePostStatus(id, status, normalizedNote);
    
    // Invalidate server caches when post is updated
    invalidateServerCache(`post:${id}`);
    invalidateServerCache('posts:');
    invalidateServerCache('batch:');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
