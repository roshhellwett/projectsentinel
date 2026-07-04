import { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { subscribeToPosts } from '@/lib/supabase/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/config/constants';
import { cachedFetch, invalidatePostsCache } from '@/lib/utils/fetchCache';

interface UseInfiniteFeedProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;
  excludeIds?: string[];
}

export function useInfiniteFeed({
  initialPosts,
  initialCount,
  category,
  pageSize = DEFAULT_PAGE_SIZE,
  excludeIds,
}: UseInfiniteFeedProps) {
  const [posts, setPosts] = useState<Post[]>(() => dedupe(initialPosts));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(initialPosts.length >= initialCount);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const excludeIdsRef = useRef(excludeIds ? new Set(excludeIds) : undefined);
  excludeIdsRef.current = excludeIds ? new Set(excludeIds) : undefined;
  const loadingRef = useRef(false);
  const flashTimersRef = useRef<Set<number>>(new Set());
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const pageRef = useRef(page);
  pageRef.current = page;
  const exhaustedRef = useRef(exhausted);
  exhaustedRef.current = exhausted;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const loadMoreRef = useRef<() => void>(() => {});
  const pageSizeRef = useRef(pageSize);
  pageSizeRef.current = pageSize;

  // Flash new posts green for 5 seconds
  const flashFresh = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setFreshIds((curr) => {
      const next = new Set(curr);
      for (const id of ids) next.add(id);
      return next;
    });
    const tid = window.setTimeout(() => {
      flashTimersRef.current.delete(tid);
      setFreshIds((curr) => {
        const next = new Set(curr);
        for (const id of ids) next.delete(id);
        return next;
      });
    }, 5000);
    flashTimersRef.current.add(tid);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhaustedRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const next = pageRef.current + 1;
      const params = new URLSearchParams({ page: String(next), limit: String(pageSizeRef.current) });
      if (categoryRef.current) params.set('category', categoryRef.current);
      
      const payload = await cachedFetch<{ posts: Post[]; count: number }>(
        `/api/posts?${params.toString()}`,
        { cacheTtl: 15_000 },
      );

      setPosts((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const excluded = excludeIdsRef.current;
        const incoming = payload.posts.filter(
          (p) => !existing.has(p.id) && !(excluded?.has(p.id)),
        );
        return dedupe([...prev, ...incoming]);
      });
      
      setPage(next);
      if (payload.posts.length === 0 || payload.posts.length < pageSizeRef.current) {
        setExhausted(true);
      }
    } catch (err) {
      console.error('Failed to load more posts', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  loadMoreRef.current = loadMore;

  // Buffer incoming posts to prevent rapid state updates and UI thrashing.
  // We collect all incoming socket events into a ref array, then flush them
  // periodically. This is crucial for performance when many posts arrive at once.
  const incomingBufferRef = useRef<Post[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushIncoming = useCallback(() => {
    flushTimerRef.current = null;
    const incoming = incomingBufferRef.current;
    incomingBufferRef.current = [];
    if (incoming.length === 0) return;

    const existing = new Set(postsRef.current.map((p) => p.id));
    const excluded = excludeIdsRef.current;
    
    // Only keep posts that are new, not excluded, and match the current category (if any)
    const fresh = incoming.filter(
      (p) =>
        !existing.has(p.id) &&
        !(excluded?.has(p.id)) &&
        (!category || p.category === category),
    );
    
    if (fresh.length === 0) return;
    flashFresh(fresh.map((p) => p.id));
    setPosts((prev) => dedupe([...fresh, ...prev]));
  }, [category, flashFresh]);

  const processIncomingPosts = useCallback((incoming: Post[]) => {
    if (incoming.length === 0) return;

    const bufIds = new Set(incomingBufferRef.current.map((p) => p.id));
    for (const p of incoming) {
      if (bufIds.has(p.id)) {
        incomingBufferRef.current = incomingBufferRef.current.map((b) => (b.id === p.id ? p : b));
      } else {
        incomingBufferRef.current.push(p);
        bufIds.add(p.id);
      }
    }

    if (flushTimerRef.current === null) {
      flushTimerRef.current = setTimeout(flushIncoming, 800);
    }
  }, [flushIncoming]);

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;

    // We explicitly manage the websocket connection lifecycle based on page visibility.
    // This prevents background tabs from consuming unnecessary bandwidth and battery
    // by only subscribing to real-time events when the user is actively viewing the tab.
    const connect = () => {
      if (sub) {
        try { sub.unsubscribe(); } catch { /* ignore */ }
        sub = null;
      }
      try {
        sub = subscribeToPosts((post) => {
          processIncomingPosts([post]);
        });
      } catch {
        // Fallback or retry logic can be added here
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') connect();
    };

    const flashTimers = flashTimersRef.current;
    connect();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (sub) {
        try { sub.unsubscribe(); } catch { /* ignore */ }
      }
      if (flushTimerRef.current !== null) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      for (const tid of flashTimers) {
        clearTimeout(tid);
      }
      flashTimers.clear();
    };
  }, [processIncomingPosts]);

  return {
    posts,
    setPosts,
    loading,
    exhausted,
    freshIds,
    loadMore
  };
}
