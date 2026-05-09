import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') || '20', 10)));

  if (!q) {
    return NextResponse.json({ posts: [], count: 0 });
  }

  try {
    const result = await searchPosts(q, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
