import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { Post, PostsCursorResponse } from "@/types";

const VALID_CATEGORIES = new Set([
  "politics",
  "business",
  "sports",
  "crime",
  "science",
  "health",
  "tech",
  "world",
  "entertainment",
  "education",
]);
const VALID_STATUSES = new Set(["published", "corrected", "retracted"]);

/** Lightweight column projection for feed lists (excludes heavy unneeded fields/vectors). */
const FEED_COLUMNS =
  "id, headline, summary, category, credibility_score, credibility_reason, source_count, sources, fact_check_flags, status, correction_note, published_at, updated_at, language, content_type, video_url, video_thumbnail";

/** Full column projection for detail views. */
const DETAIL_COLUMNS =
  "id, headline, summary, category, credibility_score, credibility_reason, source_count, sources, fact_check_flags, status, correction_note, published_at, updated_at, language, content_type, video_url, video_thumbnail";

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (supabaseServerInstance) return supabaseServerInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseServerInstance;
}

// Exponential backoff with jitter — 500ms * 2^attempt + random 0–30% jitter
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      return await fn();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      lastError = err;
      if (attempt < retries - 1) {
        const baseDelay = 2 ** attempt * 500;
        const jitter = Math.random() * baseDelay * 0.3;
        await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      }
    }
  }
  throw lastError;
}

/**
 * Fetch posts using cursor-based pagination.
 * Uses lightweight queries to minimize free-tier Supabase usage.
 */
export async function fetchPostsCursor(
  cursor?: string,
  limit: number = 20,
  category?: string,
): Promise<PostsCursorResponse> {
  if (!getSupabaseServer()) {
    return { posts: [], nextCursor: null, hasMore: false };
  }

  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const fetchLimit = safeLimit + 1;

  return withRetry(async () => {
    let query = getSupabaseServer()!
      .from("posts")
      .select(FEED_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(fetchLimit);

    if (category && category !== "all" && VALID_CATEGORIES.has(category)) {
      query = query.eq("category", category);
    }

    if (cursor) {
      query = query.lt("published_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      return { posts: [], nextCursor: null, hasMore: false };
    }

    const posts = (data || []) as Post[];
    const hasMore = posts.length >= fetchLimit;

    if (hasMore) {
      posts.pop();
    }

    const nextCursor =
      hasMore && posts.length > 0 ? posts[posts.length - 1].published_at : null;

    return { posts, nextCursor, hasMore };
  });
}

/**
 * Legacy offset-based pagination (kept for backward compatibility).
 */
export const fetchPosts = cache(
  async (
    page: number = 1,
    limit: number = 20,
    category?: string,
  ): Promise<{ posts: Post[]; count: number }> => {
    if (!getSupabaseServer()) {
      return { posts: [], count: 0 };
    }

    const safePage = Math.max(1, Math.floor(page || 1));
    const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
    const start = (safePage - 1) * safeLimit;
    const end = start + safeLimit - 1;

    return withRetry(async () => {
      let query = getSupabaseServer()!
        .from("posts")
        .select(FEED_COLUMNS, { count: "estimated" })
        .eq("status", "published");

      if (category && category !== "all" && VALID_CATEGORIES.has(category)) {
        query = query.eq("category", category);
      }

      query = query
        .order("published_at", { ascending: false })
        .range(start, end);

      const { data, error, count } = await query;

      if (error) {
        if (error.message?.includes("Requested range not satisfiable")) {
          return { posts: [], count: 0 };
        }
        throw new Error(`fetchPosts error: ${error.message}`);
      }

      return { posts: data as Post[], count: count || 0 };
    });
  },
);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const fetchPostById = cache(async (id: string): Promise<Post | null> => {
  if (!UUID_RE.test(id) || !getSupabaseServer()) {
    return null;
  }

  return withRetry(async () => {
    const { data, error } = await getSupabaseServer()!
      .from("posts")
      .select(DETAIL_COLUMNS)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`fetchPostById error: ${error.message}`);
    }

    return data as Post;
  }).catch(() => null);
});

export const fetchLatestPost = cache(async (): Promise<Post | null> => {
  if (!getSupabaseServer()) return null;

  return withRetry(async () => {
    const { data, error } = await getSupabaseServer()!
      .from("posts")
      .select(FEED_COLUMNS)
      .eq("status", "published")
      .limit(1)
      .single();

    if (error) return null;
    return data as Post;
  }).catch(() => null);
});

export async function updatePostStatus(
  id: string,
  status: string,
  correctionNote?: string | null,
): Promise<void> {
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    throw new Error(
      "Supabase environment variables are required for admin mutations.",
    );
  }
  if (!UUID_RE.test(id)) {
    throw new Error("Invalid post ID");
  }
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid post status");
  }

  const payload: Record<string, unknown> = { status };
  if (correctionNote !== undefined) {
    payload.correction_note = correctionNote;
  }

  const { error } = await getSupabaseServer()!
    .from("posts")
    .update(payload as unknown as never)
    .eq("id", id);

  if (error) {
    throw new Error(`updatePostStatus error: ${error.message}`);
  }
}

export async function searchPosts(
  query: string,
  limit: number = 20,
): Promise<{ posts: Post[]; count: number }> {
  const safeQuery = query.trim().slice(0, 200);
  if (!safeQuery || !getSupabaseServer()) return { posts: [], count: 0 };

  const safeLimit = Math.min(50, Math.max(1, limit));

  const ftsTerm = safeQuery
    .replace(/[\\&|!():*'"<>,.;]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" & ");

  if (!ftsTerm) return { posts: [], count: 0 };

  return withRetry(async () => {
    const { data, error, count } = await getSupabaseServer()!
      .from("posts")
      .select(FEED_COLUMNS, { count: "estimated" })
      .eq("status", "published")
      .or(`headline.fts(english).${ftsTerm},summary.fts(english).${ftsTerm}`)
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    if (error) {
      const escapedForIlike = safeQuery
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
      const {
        data: fallback,
        error: fallbackErr,
        count: fallbackCount,
      } = await getSupabaseServer()!
        .from("posts")
        .select(FEED_COLUMNS, { count: "estimated" })
        .eq("status", "published")
        .ilike("headline", `%${escapedForIlike}%`)
        .order("published_at", { ascending: false })
        .limit(safeLimit);

      if (fallbackErr) return { posts: [], count: 0 };
      return { posts: (fallback || []) as Post[], count: fallbackCount || 0 };
    }

    return { posts: (data || []) as Post[], count: count || 0 };
  }).catch(() => ({ posts: [], count: 0 }));
}

export async function fetchAllPosts(): Promise<Post[]> {
  if (!getSupabaseServer()) return [];

  return withRetry(async () => {
    const { data, error } = await getSupabaseServer()!
      .from("posts")
      .select(FEED_COLUMNS)
      .order("published_at", { ascending: false })
      .limit(500);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`fetchAllPosts error: ${error.message}`);
      }
      return [];
    }

    return (data || []) as Post[];
  }).catch(() => []);
}

export const fetchSitemapArticles = cache(
  async (): Promise<
    { id: string; published_at: string; category: string }[]
  > => {
    if (!getSupabaseServer()) return [];

    return withRetry(async () => {
      const { data, error } = await getSupabaseServer()!
        .from("posts")
        .select("id, published_at, category")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1000);

      if (error) return [];
      return (data || []) as {
        id: string;
        published_at: string;
        category: string;
      }[];
    }).catch(() => []);
  },
);
