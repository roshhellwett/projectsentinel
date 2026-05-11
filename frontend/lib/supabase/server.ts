/**
 * Server Supabase client (uses service role key - private)
 * Only use in API routes, never in browser components
 */

import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types';

const VALID_CATEGORIES = new Set(['politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world', 'entertainment', 'education']);
const VALID_STATUSES = new Set(['published', 'corrected', 'retracted']);

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseServer() {
  if (supabaseServerInstance) return supabaseServerInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  }

  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseServerInstance;
}

// Exponential-backoff retry wrapper (3 attempts: 0 ms, 500 ms, 1000 ms).
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 500));
      }
    }
  }
  throw lastError;
}

// Fetch posts with pagination (retried up to 3 times on transient failures).
export async function fetchPosts(
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<{ posts: Post[]; count: number }> {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit - 1;

  return withRetry(async () => {
    let query = getSupabaseServer()
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (category && category !== 'all' && VALID_CATEGORIES.has(category)) {
      query = query.eq('category', category);
    }

    query = query
      .order('published_at', { ascending: false })
      .range(start, end);

    const { data, error, count } = await query;

    if (error) {
      // Handle "Requested range not satisfiable" gracefully
      // This occurs when pagination range exceeds available rows
      if (error.message?.includes('Requested range not satisfiable')) {
        return { posts: [], count: 0 };
      }
      throw new Error(`fetchPosts error: ${error.message}`);
    }

    return { posts: data as Post[], count: count || 0 };
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Fetch single post by ID (retried up to 3 times on transient failures).
export async function fetchPostById(id: string): Promise<Post | null> {
  if (!UUID_RE.test(id)) {
    return null;
  }

  return withRetry(async () => {
    const { data, error } = await getSupabaseServer()
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // .single() returns PGRST116 when no row matches — that's a real 404,
      // so propagate null without burning further retries.
      if (error.code === 'PGRST116') return null;
      throw new Error(`fetchPostById error: ${error.message}`);
    }

    return data as Post;
  }).catch(() => null);
}

// Fetch trending post (highest score in last 24h)
export async function fetchTrendingPost(): Promise<Post | null> {
  return withRetry(async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await getSupabaseServer()
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .gte('published_at', yesterday.toISOString())
      .order('credibility_score', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as Post;
  }).catch(() => null);
}

// Fetch latest post
export async function fetchLatestPost(): Promise<Post | null> {
  return withRetry(async () => {
    const { data, error } = await getSupabaseServer()
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as Post;
  }).catch(() => null);
}

// Update post status (admin only)
export async function updatePostStatus(
  id: string,
  status: string,
  correctionNote?: string | null
): Promise<void> {
  if (!UUID_RE.test(id)) {
    throw new Error('Invalid post ID');
  }
  if (!VALID_STATUSES.has(status)) {
    throw new Error('Invalid post status');
  }

  const payload: Record<string, unknown> = { status };
  if (correctionNote !== undefined) {
    payload.correction_note = correctionNote;
  }

  const { error } = await getSupabaseServer()
    .from('posts')
    .update(payload as unknown as never)
    .eq('id', id);

  if (error) {
    throw new Error(`updatePostStatus error: ${error.message}`);
  }
}

// Full-text search posts by query
export async function searchPosts(
  query: string,
  limit: number = 20
): Promise<{ posts: Post[]; count: number }> {
  const safeQuery = query.trim().slice(0, 200);
  if (!safeQuery) return { posts: [], count: 0 };

  const safeLimit = Math.min(50, Math.max(1, limit));

  // Search both headline AND summary so queries that only match the body
  // still return results. PostgREST supports per-column FTS via the `fts`
  // operator inside an `or` filter. Each term is escaped (single quotes →
  // doubled) to keep user input literal and avoid breaking the filter syntax.
  const ftsTerm = safeQuery.replace(/'/g, "''");
  const { data, error, count } = await getSupabaseServer()
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .or(`headline.fts(english).${ftsTerm},summary.fts(english).${ftsTerm}`)
    .order('published_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    // Fallback to ilike if textSearch fails (e.g. FTS index not yet created).
    // Escape SQL LIKE metacharacters so user input is treated as a literal string.
    const escapedForIlike = safeQuery.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const { data: fallback, error: fallbackErr, count: fallbackCount } = await getSupabaseServer()
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .ilike('headline', `%${escapedForIlike}%`)
      .order('published_at', { ascending: false })
      .limit(safeLimit);

    if (fallbackErr) return { posts: [], count: 0 };
    return { posts: (fallback || []) as Post[], count: fallbackCount || 0 };
  }

  return { posts: (data || []) as Post[], count: count || 0 };
}

// Get all posts for admin (including non-published) — capped at 500 rows.
export async function fetchAllPosts(): Promise<Post[]> {
  const { data, error } = await getSupabaseServer()
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(500);
  
  if (error) {
    console.error(`fetchAllPosts error: ${error.message}`);
    return [];
  }
  
  return (data || []) as Post[];
}
