'use client';

/**
 * InfiniteFeed — silent auto-loading feed.
 *
 * Three simultaneous behaviors:
 *  1) Infinite scroll: an IntersectionObserver sentinel near the bottom triggers
 *     the next page request once it enters the viewport. New cards are appended
 *     with a soft fade/slide-in animation. No buttons. No reload.
 *  2) Live prepend (at top): when the user is at/near the top of the page,
 *     newly-arrived stories are prepended immediately with a brief accent flash.
 *  3) iOS Dynamic Island queue (when scrolled): if the user has scrolled past
 *     the queue threshold, new posts are held in a `pendingNew` queue and a
 *     compact island pill appears at the top of the viewport showing the
 *     count + latest headline. Tapping it flushes the queue and smooth-scrolls
 *     to the top — preserving the user's reading rhythm.
 *
 * All deduplication is by post.id. Reduced-motion is respected via the global
 * media query in globals.css (Framer Motion respects it automatically).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';
import { LiveUpdateIsland } from './LiveUpdateIsland';
import { Skeleton } from '@/components/ui/Skeleton';
import { useReadPosts } from '@/lib/utils/readPosts';
import { subscribeToPosts } from '@/lib/supabase/client';

interface InfiniteFeedProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;
  /** IDs to always exclude (e.g. hero + trending on homepage) */
  excludeIds?: Set<string>;
}

const POLL_INTERVAL_MS = 30_000;
/**
 * If the user has scrolled past this many pixels when fresh posts arrive,
 * defer the prepend behind the LiveUpdateIsland instead of yanking the
 * viewport. Below this threshold we prepend immediately because the user
 * is right next to the top of the feed and will see the soft entry anim.
 */
const QUEUE_THRESHOLD_PX = 220;

/**
 * When the user scrolls back into this zone with pending posts queued,
 * we auto-flush them so the feed silently refreshes — no tap, no hard
 * reload required. Tuned slightly under QUEUE_THRESHOLD_PX so the
 * transition feels coordinated with the LiveUpdateIsland fade-out.
 */
const AUTO_FLUSH_AT_SCROLL_Y = 140;

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 360, damping: 30, mass: 0.6 } },
};

/**
 * Dedupe an array of posts by `id` in place. In dev, logs removed titles.
 */
function dedupeById(posts: Post[]): Post[] {
  const seen = new Set<string>();
  const dupes: string[] = [];
  const result = posts.filter((p) => {
    if (seen.has(p.id)) {
      dupes.push(p.headline);
      return false;
    }
    seen.add(p.id);
    return true;
  });
  if (dupes.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `[InfiniteFeed dedupe] Removed ${dupes.length} duplicate(s):`,
      dupes,
    );
  }
  return result;
}

export function InfiniteFeed({
  initialPosts,
  initialCount,
  category,
  pageSize = 20,
  excludeIds,
}: InfiniteFeedProps) {
  // Dedupe initial just in case
  const dedupedInitial = dedupeById(initialPosts);

  const [posts, setPosts] = useState<Post[]>(dedupedInitial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(initialPosts.length >= initialCount);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Persistent read/unread tracking via localStorage. We memo the membership
  // test by post.id so individual NewsCard memo()s only re-render when their
  // own read state changes — not on every poll tick.
  const { readIds, markRead } = useReadPosts();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  // Keep a stable reference to excludeIds for callbacks
  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  // ── Infinite scroll: load next page when sentinel intersects ──
  const loadMore = useCallback(async () => {
    if (loadingRef.current || exhausted) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const next = page + 1;
      const params = new URLSearchParams({ page: String(next), limit: String(pageSize) });
      if (category) params.set('category', category);
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load posts');
      const data: { posts: Post[]; count: number } = await res.json();

      setPosts((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const excluded = excludeIdsRef.current;
        const incoming = data.posts.filter(
          (p) => !existing.has(p.id) && !(excluded?.has(p.id)),
        );
        return dedupeById([...prev, ...incoming]);
      });
      setPage(next);
      // Exhaust when the server returned fewer items than requested — that
      // means we have reached the end of the dataset. Using `< pageSize`
      // is reliable even on the home page where `excludeIds` causes
      // `merged.length` to always stay below `data.count`.
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

  // ── Pending queue surfaced via the Dynamic Island ──
  const [pendingNew, setPendingNew] = useState<Post[]>([]);
  const pendingRef = useRef(pendingNew);
  pendingRef.current = pendingNew;

  // Session-scoped set of post IDs the user has already been notified about
  // via the LiveUpdateIsland. Without this set, the polling tick would keep
  // re-detecting the same post as "fresh" every 30 s as soon as it left the
  // pending queue (e.g. after auto-flush or after the user navigated away
  // and back). Persisted to sessionStorage so it survives drawer opens,
  // soft route changes, and accidental tab refreshes within the same
  // session — but resets cleanly when the tab closes.
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

  /** Cap the dismissed set so it cannot grow unbounded across a long session. */
  const markDismissed = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const next = dismissedRef.current;
    for (const id of ids) next.add(id);
    // FIFO trim — keep the last 200 dismissed IDs.
    if (next.size > 200) {
      const arr = Array.from(next);
      dismissedRef.current = new Set(arr.slice(arr.length - 200));
    }
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(dismissedRef.current)));
    } catch { /* quota/private-mode — non-fatal */ }
  }, []);

  /** Flash a freshly-revealed batch of post IDs so the user can spot them. */
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

  /**
   * Tap-handler from <LiveUpdateIsland>: drop pending into the feed and rise.
   * Also reused internally by the auto-flush scroll watcher so behaviour
   * stays identical whether the user taps or scrolls.
   */
  const flushPending = useCallback((opts: { scroll?: boolean } = { scroll: true }) => {
    const queued = pendingRef.current;
    if (queued.length === 0) return;
    setPendingNew([]);
    setPosts((prev) => dedupeById([...queued, ...prev]));
    const ids = queued.map((p) => p.id);
    flashFresh(ids);
    markDismissed(ids);
    if (opts.scroll && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [flashFresh, markDismissed]);

  /**
   * Tap-handler from <LiveUpdateIsland>: open the newest queued post in the
   * drawer (matching the iOS-Dynamic-Island "tap the notification → jump to
   * the thing" mental model). All other queued posts are silently merged
   * into the feed and every acknowledged ID is recorded as dismissed so
   * the same story can never bubble back up on the next poll tick.
   */
  const openFromIsland = useCallback((newest: Post) => {
    const queued = pendingRef.current;
    setPendingNew([]);
    setPosts((prev) => dedupeById([newest, ...queued.filter((p) => p.id !== newest.id), ...prev]));
    flashFresh(queued.map((p) => p.id));
    markDismissed(queued.map((p) => p.id));
    markRead(newest.id);
    setSelectedPost(newest);
  }, [flashFresh, markDismissed, markRead]);

  // ── Auto-flush: when the user voluntarily scrolls back near the top,
  // surface any queued posts silently instead of leaving them stuck behind
  // the (now-hidden) Dynamic Island. This is the root-cause fix for the
  // “had to hard refresh to see new news” bug.
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

  // ── Shared incoming-post pipeline ──
  // Both the realtime subscription and the 30s polling fallback feed
  // through this single function so dedup, category-filter, and the
  // "prepend vs queue" decision are identical regardless of source.
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
        // Realtime pushes ALL published posts; the polling endpoint already
        // filters by category server-side. Apply the same filter here so
        // realtime events can't slip a wrong-category post into a category
        // page's feed.
        (!category || p.category === category),
    );
    if (fresh.length === 0) return;

    // Decide: prepend immediately (user near top) vs. queue behind the
    // Dynamic Island (user reading further down).
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const userIsReading = scrollY > QUEUE_THRESHOLD_PX;

    if (userIsReading) {
      setPendingNew((curr) => dedupeById([...fresh, ...curr]));
    } else {
      flashFresh(fresh.map((p) => p.id));
      setPosts((prev) => dedupeById([...fresh, ...prev]));
    }
  }, [category, flashFresh]);

  // ── Realtime push: sub-second delivery for new posts ──
  // Falls back silently to the polling tick below if Supabase realtime
  // is unavailable (env vars missing, channel error, network drop).
  useEffect(() => {
    let subscription: ReturnType<typeof subscribeToPosts> | null = null;
    try {
      subscription = subscribeToPosts((post) => {
        processIncomingPosts([post]);
      });
    } catch {
      // anon-key not configured or browser client unavailable — the
      // 30s poll loop below still keeps the feed fresh.
    }
    return () => {
      if (subscription) {
        try { subscription.unsubscribe(); } catch { /* non-fatal */ }
      }
    };
  }, [processIncomingPosts]);

  // ── Polling fallback: catches anything realtime missed (channel drops,
  // events delivered while tab was hidden, etc.). Runs every 30s. ──
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const params = new URLSearchParams({ page: '1', limit: '10', _t: String(Date.now()) });
        if (category) params.set('category', category);
        const res = await fetch(`/api/posts?${params.toString()}`);
        if (!res.ok) return;
        const data: { posts: Post[] } = await res.json();
        if (cancelled) return;
        processIncomingPosts(data.posts);
      } catch {
        /* silent */
      }
    };

    let id: number | null = null;

    const start = () => {
      if (id !== null) return;
      id = window.setInterval(tick, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        // Tab regained focus — fetch immediately so the user never sees
        // stale headlines after coming back from another app/tab.
        tick();
        start();
      }
    };

    // Refetch the moment the device comes back online.
    const onOnline = () => { tick(); start(); };

    // Refetch when the window regains focus (covers desktop-tab-switching
    // where visibilitychange may not fire on every browser).
    const onFocus = () => { tick(); };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('focus', onFocus);
    start();

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('focus', onFocus);
    };
  }, [category, processIncomingPosts]);

  // Close drawer if the post no longer exists in current list
  useEffect(() => {
    if (selectedPost && !posts.find((p) => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [posts, selectedPost]);

  /** Open a post (drawer) and mark it as read for this device. */
  const handleOpen = useCallback((post: Post) => {
    markRead(post.id);
    setSelectedPost(post);
  }, [markRead]);

  // Pre-compute the read flag per post id so framer-motion doesn't have to
  // re-create transition objects on every render.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout="position"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
              variants={itemVariants}
              className="h-full"
              style={{ contentVisibility: 'auto', containIntrinsicSize: '260px' } as React.CSSProperties}
            >
              <NewsCard
                post={post}
                onClick={() => handleOpen(post)}
                isNew={freshIds.has(post.id)}
                isRead={readMap.has(post.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sentinel for infinite scroll */}
      {!exhausted && (
        <div ref={sentinelRef} className="h-12 w-full mt-8" aria-hidden="true" />
      )}

      {/* Loading shimmer skeletons (subtle, no buttons) */}
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

      <NewsDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />

      {/* iOS Dynamic Island — surfaces queued live posts while the user is
          reading further down the feed. The component renders nothing when
          pendingNew is empty, so it has zero visual cost at rest. */}
      <LiveUpdateIsland pending={pendingNew} onTap={openFromIsland} />
    </>
  );
}
