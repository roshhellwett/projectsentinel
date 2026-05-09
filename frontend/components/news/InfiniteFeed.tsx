'use client';

/**
 * InfiniteFeed — silent auto-loading feed.
 *
 * Two simultaneous behaviors:
 *  1) Infinite scroll: an IntersectionObserver sentinel near the bottom triggers
 *     the next page request once it enters the viewport. New cards are appended
 *     with a soft fade/slide-in animation. No buttons. No reload.
 *  2) Live prepend: every 60s, polls /api/posts for stories newer than the most
 *     recent currently-rendered post. Newer posts are prepended with a brief
 *     accent flash so the reader sees them appear without disruption.
 *
 * All deduplication is by post.id. Reduced-motion is respected via the global
 * media query in globals.css (Framer Motion respects it automatically).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import { NewsCard } from './NewsCard';
import { NewsDrawer } from './NewsDrawer';

interface InfiniteFeedProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;
}

const POLL_INTERVAL_MS = 60_000;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 26 } },
};

export function InfiniteFeed({
  initialPosts,
  initialCount,
  category,
  pageSize = 20,
}: InfiniteFeedProps) {
  // Dedupe initial just in case
  const dedupedInitial = (() => {
    const seen = new Set<string>();
    return initialPosts.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  })();

  const [posts, setPosts] = useState<Post[]>(dedupedInitial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(initialPosts.length >= initialCount);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

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
        const incoming = data.posts.filter((p) => !existing.has(p.id));
        const merged = [...prev, ...incoming];
        if (merged.length >= data.count || incoming.length === 0) {
          setExhausted(true);
        }
        return merged;
      });
      setPage(next);
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

  // ── Live prepend: poll for newer posts every minute ──
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const params = new URLSearchParams({ page: '1', limit: '10' });
        if (category) params.set('category', category);
        const res = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: { posts: Post[] } = await res.json();
        if (cancelled) return;

        setPosts((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const fresh = data.posts.filter((p) => !existing.has(p.id));
          if (fresh.length === 0) return prev;

          // Mark as fresh for flash animation
          setFreshIds((curr) => {
            const next = new Set(curr);
            for (const f of fresh) next.add(f.id);
            return next;
          });
          // Clear flash after 3s
          window.setTimeout(() => {
            setFreshIds((curr) => {
              const next = new Set(curr);
              for (const f of fresh) next.delete(f.id);
              return next;
            });
          }, 3200);

          return [...fresh, ...prev];
        });
      } catch {
        /* silent */
      }
    };

    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [category]);

  // Close drawer if the post no longer exists in current list
  useEffect(() => {
    if (selectedPost && !posts.find((p) => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [posts, selectedPost]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
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
        <h3 className="text-lg font-semibold text-white mb-1.5">No verified news found</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          We couldn&apos;t find any articles. Try a different category or check back in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
      >
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95 }}
              variants={itemVariants}
              className="h-full"
            >
              <NewsCard
                post={post}
                onClick={() => setSelectedPost(post)}
                isNew={freshIds.has(post.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Sentinel for infinite scroll */}
      {!exhausted && (
        <div ref={sentinelRef} className="h-12 w-full mt-8" aria-hidden="true" />
      )}

      {/* Loading shimmer skeletons (subtle, no buttons) */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-shimmer"
            />
          ))}
        </div>
      )}

      {exhausted && posts.length > pageSize && (
        <p className="text-center text-xs text-zinc-600 mt-12">
          You&apos;ve reached the end — {posts.length} verified stories.
        </p>
      )}

      <NewsDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />
    </>
  );
}
