'use client';

// last edited 2026-05-17 by roshhellwett

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import { dedupe } from '@/lib/utils/dedupe';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';
import { LiveUpdateIsland } from './LiveUpdateIsland';
import { Skeleton } from '@/components/ui/Skeleton';
import { useReadPosts } from '@/lib/utils/readPosts';
import { subscribeToPosts } from '@/lib/supabase/client';
import { markFresh } from '@/lib/utils/freshSignal';
import {
  POLL_INTERVAL_MS,
  BACKGROUND_POLL_INTERVAL_MS,
  QUEUE_THRESHOLD_PX,
  AUTO_FLUSH_AT_SCROLL_Y,
  DEFAULT_PAGE_SIZE,
} from '@/lib/config/constants';

interface InfiniteFeedProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;

  excludeIds?: string[];
}

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 28, mass: 0.55 },
  },
};

export function InfiniteFeed({
  initialPosts,
  initialCount,
  category,
  pageSize = DEFAULT_PAGE_SIZE,
  excludeIds,
}: InfiniteFeedProps) {

  const excludeKey = excludeIds ? excludeIds.join(',') : '';
  const excludeSet = useMemo(
    () => (excludeKey ? new Set(excludeKey.split(',')) : undefined),
    [excludeKey],
  );


  const dedupedInitial = dedupe(initialPosts);

  const [posts, setPosts] = useState<Post[]>(dedupedInitial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(initialPosts.length >= initialCount);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastOpenedId) return;
    const t = window.setTimeout(() => setLastOpenedId(null), 1100);
    return () => window.clearTimeout(t);
  }, [lastOpenedId]);




  const { readIds, markRead } = useReadPosts();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const postsRef = useRef(posts);
  postsRef.current = posts;


  const excludeIdsRef = useRef(excludeSet);
  excludeIdsRef.current = excludeSet;


  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhausted) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const next = page + 1;
      const params = new URLSearchParams({ page: String(next), limit: String(pageSize) });
      if (category) params.set('category', category);
      const res = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data: { posts: Post[]; count: number } = await res.json();

      setPosts((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const excluded = excludeIdsRef.current;
        const incoming = data.posts.filter(
          (p) => !existing.has(p.id) && !(excluded?.has(p.id)),
        );
        return dedupe([...prev, ...incoming]);
      });
      setPage(next);




      if (data.posts.length === 0 || data.posts.length < pageSize) {
        setExhausted(true);
      }
    } catch {
      // Soft-fail: leave UI as-is. Next intersection will retry.
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, pageSize, category, exhausted]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore();
            break;
          }
        }
      },
      { rootMargin: '600px 0px' }, // fire well before bottom for seamless feel
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);


  const [pendingNew, setPendingNew] = useState<Post[]>([]);
  const pendingRef = useRef(pendingNew);
  pendingRef.current = pendingNew;








  const DISMISSED_KEY = 'iv:liveDismissedIds';
  const dismissedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dismissedRef.current = new Set(parsed.filter((x) => typeof x === 'string'));
      }
    } catch { /* corrupt JSON — start fresh */ }
  }, []);


  const markDismissed = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const next = dismissedRef.current;
    for (const id of ids) next.add(id);

    if (next.size > 200) {
      const arr = Array.from(next);
      dismissedRef.current = new Set(arr.slice(arr.length - 200));
    }
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(dismissedRef.current)));
    } catch { /* quota/private-mode — non-fatal */ }
  }, []);


  const flashFresh = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setFreshIds((curr) => {
      const next = new Set(curr);
      for (const id of ids) next.add(id);
      return next;
    });
    window.setTimeout(() => {
      setFreshIds((curr) => {
        const next = new Set(curr);
        for (const id of ids) next.delete(id);
        return next;
      });
    }, 3200);
  }, []);


  const flushPending = useCallback((opts: { scroll?: boolean } = { scroll: true }) => {
    const queued = pendingRef.current;
    if (queued.length === 0) return;
    setPendingNew([]);
    setPosts((prev) => dedupe([...queued, ...prev]));
    const ids = queued.map((p) => p.id);
    flashFresh(ids);
    markDismissed(ids);
    if (opts.scroll && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [flashFresh, markDismissed]);


  const openFromIsland = useCallback((newest: Post) => {
    const queued = pendingRef.current;
    setPendingNew([]);
    setPosts((prev) => dedupe([newest, ...queued.filter((p) => p.id !== newest.id), ...prev]));
    flashFresh(queued.map((p) => p.id));
    markDismissed(queued.map((p) => p.id));
    markRead(newest.id);
    setSelectedPost(newest);
  }, [flashFresh, markDismissed, markRead]);





  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        if (window.scrollY < AUTO_FLUSH_AT_SCROLL_Y && pendingRef.current.length > 0) {
          flushPending({ scroll: false });
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [flushPending]);





  const processIncomingPosts = useCallback((incoming: Post[]) => {
    if (incoming.length === 0) return;
    const existing = new Set(postsRef.current.map((p) => p.id));
    const queuedIds = new Set(pendingRef.current.map((p) => p.id));
    const dismissed = dismissedRef.current;
    const excluded = excludeIdsRef.current;
    const fresh = incoming.filter(
      (p) =>
        !existing.has(p.id) &&
        !queuedIds.has(p.id) &&
        !dismissed.has(p.id) &&
        !(excluded?.has(p.id)) &&




        (!category || p.category === category),
    );
    if (fresh.length === 0) return;



    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const userIsReading = scrollY > QUEUE_THRESHOLD_PX;

    if (userIsReading) {
      setPendingNew((curr) => dedupe([...fresh, ...curr]));
    } else {
      flashFresh(fresh.map((p) => p.id));
      setPosts((prev) => dedupe([...fresh, ...prev]));
    }
  }, [category, flashFresh]);






  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;

    const connect = () => {

      if (sub) {
        try { sub.unsubscribe(); } catch { /* non-fatal */ }
        sub = null;
      }
      try {
        sub = subscribeToPosts((post) => {
          processIncomingPosts([post]);
        });
      } catch {
        // anon-key not configured or browser client unavailable — the
        // poll loop below still keeps the feed fresh.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') connect();
    };

    connect();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (sub) {
        try { sub.unsubscribe(); } catch { /* non-fatal */ }
      }
    };
  }, [processIncomingPosts]);









  useEffect(() => {
    let cancelled = false;

    const FOREGROUND_MS = POLL_INTERVAL_MS;
    const BACKGROUND_MS = BACKGROUND_POLL_INTERVAL_MS;

    const tick = async () => {
      if (cancelled) return;
      try {
        const params = new URLSearchParams({ page: '1', limit: '10', _t: String(Date.now()) });
        if (category) params.set('category', category);
        const res = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data: { posts: Post[] } = await res.json();
        if (cancelled) return;
        processIncomingPosts(data.posts);
        markFresh();
      } catch {
        /* silent */
      }
    };

    let timerId: ReturnType<typeof setTimeout> | null = null;


    const scheduleNext = (ms: number) => {
      if (timerId !== null) clearTimeout(timerId);
      timerId = setTimeout(async () => {
        await tick();
        if (!cancelled) {

          const interval = document.visibilityState === 'hidden' ? BACKGROUND_MS : FOREGROUND_MS;
          scheduleNext(interval);
        }
      }, ms);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {

        tick();
        scheduleNext(FOREGROUND_MS);
      } else {

        scheduleNext(BACKGROUND_MS);
      }
    };


    const onOnline = () => { tick(); scheduleNext(FOREGROUND_MS); };



    const onFocus = () => { tick(); };



    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) tick();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);


    tick();
    scheduleNext(FOREGROUND_MS);

    return () => {
      cancelled = true;
      if (timerId !== null) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [category, processIncomingPosts]);


  useEffect(() => {
    if (selectedPost && !posts.find((p) => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [posts, selectedPost]);


  const handleOpen = useCallback((post: Post) => {
    markRead(post.id);
    setSelectedPost(post);
  }, [markRead]);



  const readMap = useMemo(() => readIds, [readIds]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white/70 border border-slate-950/[0.10] flex items-center justify-center mb-5">
          <svg
            className="w-7 h-7 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-950 mb-1.5">No verified news found</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          We couldn&apos;t find any articles. Try a different category or check back in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="feed-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout="position"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
              variants={itemVariants}
              className="feed-card-shell h-full"
            >
              <NewsCard
                post={post}
                onClick={() => handleOpen(post)}
                isNew={freshIds.has(post.id)}
                isRead={readMap.has(post.id)}
                wasRecentlyOpened={lastOpenedId === post.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {!exhausted && (
        <div ref={sentinelRef} className="h-12 w-full mt-8" aria-hidden="true" />
      )}


      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[218px] rounded-[1.65rem]"
            />
          ))}
        </div>
      )}

      {exhausted && posts.length > pageSize && (
        <p className="text-center text-xs text-slate-500 mt-12">
          You&apos;ve reached the end — {posts.length} verified stories.
        </p>
      )}

      <NewsDrawer
        post={selectedPost}
        onClose={() => {
          if (selectedPost) setLastOpenedId(selectedPost.id);
          setSelectedPost(null);
        }}
        onSelectRelated={(next) => {
          markRead(next.id);
          setPosts((prev) => (prev.some((p) => p.id === next.id) ? prev : dedupe([next, ...prev])));
          setSelectedPost(next);
        }}
      />


      <LiveUpdateIsland pending={pendingNew} onTap={openFromIsland} />
    </>
  );
}
