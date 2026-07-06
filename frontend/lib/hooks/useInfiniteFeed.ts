import { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { subscribeToPosts } from '@/lib/supabase/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/config/constants';
import { cachedFetch } from '@/lib/utils/fetchCache';

interface UseInfiniteFeedProps {
  initialPosts: Post[];
  hasInitialMore: boolean;
  category?: string;
  pageSize?: number;
  excludeIds?: string[];
}

export function useInfiniteFeed({
  initialPosts,
  hasInitialMore,
  category,
  pageSize = DEFAULT_PAGE_SIZE,
  excludeIds,
}: UseInfiniteFeedProps) {
  const [posts, setPosts] = useState<Post[]>(() => dedupe(initialPosts));
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(!hasInitialMore);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const excludeIdsRef = useRef(excludeIds ? new Set(excludeIds) : undefined);
  const loadingRef = useRef(false);
  const flashTimersRef = useRef<Set<number>>(new Set());
  const postsRef = useRef(posts);
  const cursorRef = useRef(cursor);
  const exhaustedRef = useRef(exhausted);
  const categoryRef = useRef(category);
  const pageSizeRef = useRef(pageSize);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync refs and reset when category or initialPosts change
  useEffect(() => {
    excludeIdsRef.current = excludeIds ? new Set(excludeIds) : undefined;
    postsRef.current = posts;
    cursorRef.current = cursor;
    exhaustedRef.current = exhausted;
    categoryRef.current = category;
    pageSizeRef.current = pageSize;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [excludeIds, posts, cursor, exhausted, category, pageSize]);

  // When initialPosts change (e.g. category switch), reset feed state
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPosts(dedupe(initialPosts));
    setCursor(null);
    setExhausted(!hasInitialMore);
    setLoading(false);
    loadingRef.current = false;
  }, [initialPosts, hasInitialMore, category]);

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

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams({ limit: String(pageSizeRef.current) });
      if (cursorRef.current) params.set('cursor', cursorRef.current);
      if (categoryRef.current) params.set('category', categoryRef.current);
      
      const payload = await cachedFetch<{ posts: Post[]; nextCursor: string | null; hasMore: boolean }>(
        `/api/posts/?${params.toString()}`,
        { cacheTtl: 15_000, signal: controller.signal },
      );

      if (mountedRef.current && !controller.signal.aborted) {
        setPosts((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const excluded = excludeIdsRef.current;
          const incoming = payload.posts.filter(
            (p) => !existing.has(p.id) && !(excluded?.has(p.id)),
          );
          return dedupe([...prev, ...incoming]);
        });
        
        setCursor(payload.nextCursor);
        if (!payload.hasMore) {
          setExhausted(true);
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        console.error('Failed to load more posts', err);
      }
    } finally {
      if (mountedRef.current && abortControllerRef.current === controller) {
        setLoading(false);
        loadingRef.current = false;
        abortControllerRef.current = null;
      }
    }
  }, []);

  const incomingBufferRef = useRef<Post[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushIncoming = useCallback(() => {
    flushTimerRef.current = null;
    const incoming = incomingBufferRef.current;
    incomingBufferRef.current = [];
    if (incoming.length === 0 || !mountedRef.current) return;

    const existing = new Set(postsRef.current.map((p) => p.id));
    const excluded = excludeIdsRef.current;
    
    const fresh = incoming.filter(
      (p) =>
        !existing.has(p.id) &&
        !(excluded?.has(p.id)) &&
        (!categoryRef.current || p.category === categoryRef.current),
    );
    
    if (fresh.length === 0) return;
    flashFresh(fresh.map((p) => p.id));
    setPosts((prev) => dedupe([...fresh, ...prev]));
  }, [flashFresh]);

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
    const flashTimers = flashTimersRef.current;
    const sub = subscribeToPosts((post) => {
      processIncomingPosts([post]);
    });

    return () => {
      try { sub.unsubscribe(); } catch { /* ignore */ }
      if (flushTimerRef.current !== null) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
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