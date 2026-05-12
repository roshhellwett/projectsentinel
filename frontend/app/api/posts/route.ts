/**
 * API route for fetching posts
 */

import { NextResponse } from 'next/server';
import { fetchPosts } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const category = searchParams.get('category') || undefined;
  
  try {
    const { posts, count } = await fetchPosts(page, limit, category);
    return NextResponse.json({ posts, count });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
