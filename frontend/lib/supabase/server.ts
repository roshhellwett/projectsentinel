/**
 * Server Supabase client (uses service role key - private)
 * Only use in API routes, never in browser components
 */

import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types';

const VALID_CATEGORIES = new Set(['politics', 'business', 'sports', 'crime', 'science', 'health', 'tech', 'world']);
const VALID_STATUSES = new Set(['published', 'corrected', 'retracted']);

// Lazy-initialized server client to handle missing env vars during build
let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseServer() {
  if (supabaseServerInstance) return supabaseServerInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a mock client for build time that returns empty data
    type MockQueryBuilder = {
      eq: (column: string, value: unknown) => MockQueryBuilder & { single: () => Promise<{ data: null; error: null }>; range: (from: number, to: number) => Promise<{ data: never[]; count: number; error: null }>; limit: (n: number) => { single: () => Promise<{ data: null; error: null }> }; order: (column: string, options?: object) => MockQueryBuilder };
      order: (column: string, options?: object) => MockQueryBuilder & { limit: (n: number) => { single: () => Promise<{ data: null; error: null }> }; range: (from: number, to: number) => Promise<{ data: never[]; count: number; error: null }> };
      limit: (n: number) => { single: () => Promise<{ data: null; error: null }> };
      single: () => Promise<{ data: null; error: null }>;
      range: (from: number, to: number) => Promise<{ data: never[]; count: number; error: null }>;
      gte: (column: string, value: unknown) => MockQueryBuilder;
    };
    
    const mockResponse = Promise.resolve({ data: null, error: null });
    const mockArrayResponse = Promise.resolve({ data: [] as never[], count: 0, error: null });
    const createMockQuery = (): MockQueryBuilder => {
      const self: MockQueryBuilder = {
        eq: () => ({ ...self, single: () => mockResponse, range: () => mockArrayResponse, limit: () => ({ single: () => mockResponse }), order: () => self }),
        order: () => ({ ...self, limit: () => ({ single: () => mockResponse }), range: () => mockArrayResponse }),
        limit: () => ({ single: () => mockResponse }),
        single: () => mockResponse,
        range: () => mockArrayResponse,
        gte: () => self,
      };
      return self;
    };
    
    const mockClient = {
      from: (table: string) => ({
        select: (columns?: string, options?: object) => createMockQuery(),
        update: (values: object) => ({ eq: () => mockResponse }),
      }),
    };
    return mockClient as unknown as ReturnType<typeof createClient>;
  }
  
  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  return supabaseServerInstance;
}

export const supabaseServer = getSupabaseServer();

// Fetch posts with pagination
export async function fetchPosts(
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<{ posts: Post[]; count: number }> {
  // Return empty data during build if env vars not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { posts: [], count: 0 };
  }
  
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit - 1;
  
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
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
  
  return { posts: data as Post[], count: count || 0 };
}

// Fetch single post by ID
export async function fetchPostById(id: string): Promise<Post | null> {
  // Return null during build if env vars not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const { data, error } = await getSupabaseServer()
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
  
  return data as Post;
}

// Fetch trending post (highest score in last 24h)
export async function fetchTrendingPost(): Promise<Post | null> {
  // Return null during build if env vars not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  
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
  
  if (error) {
    return null;
  }
  
  return data as Post;
}

// Fetch latest post
export async function fetchLatestPost(): Promise<Post | null> {
  // Return null during build if env vars not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  
  const { data, error } = await getSupabaseServer()
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    return null;
  }
  
  return data as Post;
}

// Update post status (admin only)
export async function updatePostStatus(
  id: string,
  status: string,
  correctionNote?: string | null
): Promise<void> {
  if (!VALID_STATUSES.has(status)) {
    throw new Error('Invalid post status');
  }

  const update: { status: string; correction_note?: string | null } = { status };
  if (correctionNote !== undefined) {
    update.correction_note = correctionNote;
  }
  
  const { error } = await getSupabaseServer()
    .from('posts')
    .update(update as unknown as never)
    .eq('id', id);
  
  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }
}

// Get all posts for admin (including non-published)
export async function fetchAllPosts(): Promise<Post[]> {
  // Check if env vars are missing (build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }
  
  const { data, error } = await getSupabaseServer()
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
  
  return (data || []) as Post[];
}
