import { NextResponse } from 'next/server';
import { fetchPostById, updatePostStatus } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['published', 'corrected', 'retracted'] as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await fetchPostById(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }
    return NextResponse.json({ post }, {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
