'use client';

// last edited 2026-05-17 by roshhellwett
//
// Swipe queue manager. Reuses the existing /api/posts endpoint — zero
// backend changes. Filters out seen/read IDs and keeps a small history
// for rewind. Prefetches the next page when the buffer drops low.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { loadSeenWithinDays } from '@/lib/utils/seenSet';

const READ_KEY = 'iv:readPosts:v1';

function loadReadIdsSync(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

const SWIPE_PAGE_SIZE = 20;
const PREFETCH_THRESHOLD = 5;
const HISTORY_MAX = 25;
const SEEN_PREFIX = 'iv:swipe:seen:';
const MAX_REFILL_FAILURES = 3;
const REFILL_BACKOFF_MS = [1500, 4000, 10000] as const;

interface UseSwipeQueueOpts {
  initialPosts: Post[];
  excludeReadIds?: Set<string>;
  hideRead?: boolean;
}

interface SwipeQueueApi {
  current: Post | null;
  next: Post | null;
  upcoming: Post | null;
  remaining: number;
  canRewind: boolean;
  isFetching: boolean;
  isExhausted: boolean;
  hasError: boolean;
  advance: (post: Post) => void;
  rewind: () => Post | null;
  refill: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useSwipeQueue({
  initialPosts,
  excludeReadIds,
  hideRead = false,
}: UseSwipeQueueOpts): SwipeQueueApi {
  const seenRef = useRef<Set<string>>(new Set());
  const [queue, setQueue] = useState<Post[]>([]);
  const [history, setHistory] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [exhausted, setExhausted] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchingRef = useRef(false);
  const failureCountRef = useRef<number>(0);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  // Refresh seen-set from localStorage. Used during cross-tab sync and
  // tab-visibility wake-ups. Loads today AND yesterday so a post dismissed
  // shortly before midnight does not reappear minutes later.
  const refreshSeenFromDisk = useCallback(() => {
    seenRef.current = loadSeenWithinDays(2);
    setQueue((prev) => prev.filter((p) => !seenRef.current.has(p.id)));
  }, []);

  // Always read the latest read-set from disk so cross-tab dismissals are
  // honored on the next prefetch even before React state catches up.
  const filterIds = useCallback(
    (posts: Post[]): Post[] => {
      const seen = seenRef.current;
      const readDisk = hideRead ? loadReadIdsSync() : null;
      return posts.filter((p) => {
        if (!p?.id) return false;
        if (seen.has(p.id)) return false;
        if (hideRead) {
          if (excludeReadIds?.has(p.id)) return false;
          if (readDisk?.has(p.id)) return false;
        }
        return true;
      });
    },
    [hideRead, excludeReadIds],
  );

  // Hydrate seen-set from localStorage and seed the queue. Read-set is
  // pulled synchronously to avoid a race where the first batch of SSR
  // posts is filtered against an empty React state. We do NOT rotate the
  // queue against `resume` — read+seen filtering is sufficient and the
  // natural API order keeps newer posts at the top.
  useEffect(() => {
    seenRef.current = loadSeenWithinDays(2);
    const seen = seenRef.current;
    const readNow = hideRead ? loadReadIdsSync() : new Set<string>();
    const cleaned = dedupe(
      initialPosts.filter((p) => p?.id && !seen.has(p.id) && !readNow.has(p.id)),
    );
    setQueue(cleaned);
    setHydrated(true);
    // Initial-mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-tab sync: when seen or read sets change in another tab, refresh
  // ours and prune the queue accordingly.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith(SEEN_PREFIX)) {
        refreshSeenFromDisk();
        return;
      }
      if (e.key === READ_KEY && hideRead) {
        const fresh = loadReadIdsSync();
        setQueue((prev) => prev.filter((p) => !fresh.has(p.id)));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshSeenFromDisk, hideRead]);

  // Tab visibility: when the user comes back, the localStorage state may
  // have changed in another tab. Refresh and reconcile.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      refreshSeenFromDisk();
      if (hideRead) {
        const fresh = loadReadIdsSync();
        setQueue((prev) => prev.filter((p) => !fresh.has(p.id)));
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshSeenFromDisk, hideRead]);

  // Refill with bounded retry. Surfaces an error state after
  // MAX_REFILL_FAILURES consecutive failures so the UI can recover.
  const refill = useCallback(async () => {
    if (fetchingRef.current || exhausted) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setHasError(true);
      return;
    }
    fetchingRef.current = true;
    setIsFetching(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(SWIPE_PAGE_SIZE),
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);
      let res: Response;
      try {
        res = await fetch(`/api/posts?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      const data: { posts: Post[]; count?: number } = await res.json();
      const incoming = filterIds(data.posts ?? []);
      setQueue((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const toAppend = incoming.filter((p) => !existing.has(p.id));
        return dedupe([...prev, ...toAppend]);
      });
      setPage(nextPage);
      if ((data.posts?.length ?? 0) < SWIPE_PAGE_SIZE) setExhausted(true);
      failureCountRef.current = 0;
      setHasError(false);
    } catch {
      failureCountRef.current += 1;
      if (failureCountRef.current >= MAX_REFILL_FAILURES) {
        setHasError(true);
      } else {
        const delay = REFILL_BACKOFF_MS[Math.min(failureCountRef.current - 1, REFILL_BACKOFF_MS.length - 1)];
        setTimeout(() => {
          fetchingRef.current = false;
          void refill();
        }, delay);
        return;
      }
    } finally {
      setIsFetching(false);
      fetchingRef.current = false;
    }
  }, [exhausted, filterIds, page]);

  const retry = useCallback(async () => {
    failureCountRef.current = 0;
    setHasError(false);
    await refill();
  }, [refill]);

  // Auto-prefetch when the buffer is low.
  useEffect(() => {
    if (!hydrated) return;
    if (exhausted) return;
    if (queue.length <= PREFETCH_THRESHOLD) {
      void refill();
    }
  }, [hydrated, queue.length, exhausted, refill]);

  const advance = useCallback((post: Post) => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const front = prev[0];
      if (front.id !== post.id) {
        // Defensive: only consume if it's actually the front card.
        return prev;
      }
      return prev.slice(1);
    });
    setHistory((prev) => {
      const next = [post, ...prev];
      return next.length > HISTORY_MAX ? next.slice(0, HISTORY_MAX) : next;
    });
  }, []);

  const rewind = useCallback((): Post | null => {
    let restored: Post | null = null;
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      restored = prev[0];
      return prev.slice(1);
    });
    if (restored) {
      const r = restored as Post;
      setQueue((prev) => (prev[0]?.id === r.id ? prev : [r, ...prev]));
    }
    return restored;
  }, []);

  const view = useMemo(() => {
    const [c = null, n = null, u = null] = queue;
    return { current: c, next: n, upcoming: u };
  }, [queue]);

  return {
    current: view.current,
    next: view.next,
    upcoming: view.upcoming,
    remaining: queue.length,
    canRewind: history.length > 0,
    isFetching,
    isExhausted: exhausted && queue.length === 0,
    hasError,
    advance,
    rewind,
    refill,
    retry,
  };
}
