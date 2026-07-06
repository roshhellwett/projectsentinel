'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { loadSeenWithinDays, unmarkSeen } from '@/lib/utils/seenSet';
import { cachedFetch } from '@/lib/utils/fetchCache';
import { safeRead, safeWrite } from '@/lib/utils/safeStorage';

const READ_KEY = 'iv:readPosts:v1';
const SWIPE_PAGE_SIZE = 25;
const PREFETCH_THRESHOLD = 10;
const HISTORY_MAX = 25;
const SEEN_PREFIX = 'iv:swipe:seen:';
const MAX_REFILL_FAILURES = 3;
const REFILL_BACKOFF_MS = [1500, 4000, 10000] as const;

function loadReadIdsSync(): Set<string> {
  try {
    const raw = safeRead(READ_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const ids = parsed.filter((x) => typeof x === 'string');
    // If over 500 read items, trim oldest half to prevent quota inflation
    if (ids.length > 500) {
      const trimmed = ids.slice(ids.length - 250);
      try { safeWrite(READ_KEY, JSON.stringify(trimmed)); } catch {}
      return new Set(trimmed);
    }
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export interface HistoryEntry {
  post: Post;
  direction: 'up' | 'left' | 'right';
  wasSaved: boolean;
}

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
  advance: (post: Post, direction: 'up' | 'left' | 'right', wasSaved: boolean) => void;
  rewind: () => HistoryEntry | null;
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [exhausted, setExhausted] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchingRef = useRef(false);
  const failureCountRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageRef = useRef(page);
  const exhaustedRef = useRef(exhausted);
  const filterIdsRef = useRef<(posts: Post[]) => Post[]>(() => []);
  const historyRef = useRef(history);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const refreshSeenFromDisk = useCallback(() => {
    seenRef.current = loadSeenWithinDays(2);
    setQueue((prev) => prev.filter((p) => !seenRef.current.has(p.id)));
  }, []);

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

  useEffect(() => {
    filterIdsRef.current = filterIds;
    pageRef.current = page;
    exhaustedRef.current = exhausted;
    historyRef.current = history;
  }, [filterIds, page, exhausted, history]);

  useEffect(() => {
    seenRef.current = loadSeenWithinDays(2);
    const seen = seenRef.current;
    const readNow = hideRead ? loadReadIdsSync() : new Set<string>();
    const cleaned = dedupe(
      initialPosts.filter((p) => p?.id && !seen.has(p.id) && !readNow.has(p.id)),
    );

    cleaned.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    setQueue(cleaned);
    setHydrated(true);
  }, [hideRead, initialPosts]);

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

  const refill = useCallback(async () => {
    if (fetchingRef.current || exhaustedRef.current || !mountedRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const nextPage = pageRef.current + 1;
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(SWIPE_PAGE_SIZE),
      });
      
      const timeoutId = setTimeout(() => controller.abort(), 12_000);
      let payload: { posts: Post[]; count?: number };
      try {
        payload = await cachedFetch<{ posts: Post[]; count?: number }>(
          `/api/posts/?${params.toString()}`,
          { signal: controller.signal, cacheTtl: 10_000 },
        );
      } finally {
        clearTimeout(timeoutId);
      }

      if (mountedRef.current && !controller.signal.aborted) {
        const incoming = filterIdsRef.current(payload.posts ?? []);
        setQueue((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const toAppend = incoming.filter((p) => !existing.has(p.id));
          return dedupe([...prev, ...toAppend]);
        });
        setPage(nextPage);
        if ((payload.posts?.length ?? 0) < SWIPE_PAGE_SIZE) setExhausted(true);
        failureCountRef.current = 0;
        setHasError(false);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      failureCountRef.current += 1;
      if (failureCountRef.current >= MAX_REFILL_FAILURES) {
        if (mountedRef.current) setHasError(true);
      } else {
        const delay = REFILL_BACKOFF_MS[Math.min(failureCountRef.current - 1, REFILL_BACKOFF_MS.length - 1)];

        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          fetchingRef.current = false;
          if (mountedRef.current) {
            setIsFetching(false);
            void refill();
          }
        }, delay);
        return;
      }
    } finally {
      if (!retryTimerRef.current && mountedRef.current && abortControllerRef.current === controller) {
        setIsFetching(false);
        fetchingRef.current = false;
        abortControllerRef.current = null;
      }
    }
  }, []);

  const retry = useCallback(async () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    failureCountRef.current = 0;
    setHasError(false);
    fetchingRef.current = false;
    await refill();
  }, [refill]);

  const queueLenRef = useRef(queue.length);
  queueLenRef.current = queue.length;

  useEffect(() => {
    if (!hydrated) return;
    if (exhaustedRef.current) return;
    if (queueLenRef.current <= PREFETCH_THRESHOLD) {
      void refill();
    }
  }, [hydrated, queue.length, refill]);

  const advance = useCallback((post: Post, direction: 'up' | 'left' | 'right', wasSaved: boolean) => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const front = prev[0];
      if (front.id !== post.id) return prev;
      return prev.slice(1);
    });
    setHistory((prev) => {
      const entry: HistoryEntry = { post, direction, wasSaved };
      const next = [entry, ...prev];
      return next.length > HISTORY_MAX ? next.slice(0, HISTORY_MAX) : next;
    });
  }, []);

  const rewind = useCallback((): HistoryEntry | null => {
    const hist = historyRef.current;
    if (hist.length === 0) return null;

    const entry = hist[0];
    setHistory((prev) => prev.slice(1));
    unmarkSeen(entry.post.id);
    setQueue((prev) => {
      if (prev.length === 0 || prev[0]?.id !== entry.post.id) {
        return [entry.post, ...prev];
      }
      return prev;
    });

    return entry;
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
