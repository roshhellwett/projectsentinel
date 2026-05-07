/**
 * API route for single post operations
 * Fixed: PATCH authentication, validation
 */

import { NextResponse } from 'next/server';
import { fetchPostById, updatePostStatus } from '@/lib/supabase/server';

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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  const secretToken = process.env.ADMIN_SECRET_TOKEN;
  if (!secretToken || token !== secretToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, correction_note } = body;

    if (status && !VALID_STATUSES.includes(status)) {
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
