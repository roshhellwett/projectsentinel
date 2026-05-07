/**
 * API route for fetching posts
 */

import { NextResponse } from 'next/server';
import { fetchPosts } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
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
