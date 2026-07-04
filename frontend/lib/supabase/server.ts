import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types';

const VALID_CATEGORIES = new Set(['politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world', 'entertainment', 'education']);
const VALID_STATUSES = new Set(['published', 'corrected', 'retracted']);

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (supabaseServerInstance) return supabaseServerInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and a Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY) are required.'
    );
  }

  supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseServerInstance;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        const baseDelay = 2 ** attempt * 500;
        const jitter = Math.random() * baseDelay * 0.3;
        await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
      }
    }
  }
  throw lastError;
}

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

      if (error.message?.includes('Requested range not satisfiable')) {
        return { posts: [], count: 0 };
      }
      throw new Error(`fetchPosts error: ${error.message}`);
    }

    return { posts: data as Post[], count: count || 0 };
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

      if (error.code === 'PGRST116') return null;
      throw new Error(`fetchPostById error: ${error.message}`);
    }

    return data as Post;
  }).catch(() => null);
}

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

export async function updatePostStatus(
  id: string,
  status: string,
  correctionNote?: string | null
): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('updatePostStatus requires SUPABASE_SERVICE_ROLE_KEY environment variable to perform admin mutations.');
  }
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

export async function searchPosts(
  query: string,
  limit: number = 20
): Promise<{ posts: Post[]; count: number }> {
  const safeQuery = query.trim().slice(0, 200);
  if (!safeQuery) return { posts: [], count: 0 };

  const safeLimit = Math.min(50, Math.max(1, limit));

  const ftsTerm = safeQuery
    .replace(/[\\&|!():*'"<>,.;]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' & ');

  if (!ftsTerm) return { posts: [], count: 0 };

  const { data, error, count } = await getSupabaseServer()
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .or(`headline.fts(english).${ftsTerm},summary.fts(english).${ftsTerm}`)
    .order('published_at', { ascending: false })
    .limit(safeLimit);

  if (error) {

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

export async function fetchAllPosts(): Promise<Post[]> {
  const { data, error } = await getSupabaseServer()
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(500);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`fetchAllPosts error: ${error.message}`);
    }
    return [];
  }

  return (data || []) as Post[];
}
