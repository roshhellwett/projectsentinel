'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';

interface LiveRefreshBannerProps {
  latestPublishedAt: string;
}

const POLL_INTERVAL_MS = 90_000;

export function LiveRefreshBanner({ latestPublishedAt }: LiveRefreshBannerProps) {
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const baselineRef = useRef(latestPublishedAt);

  const checkForNew = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?page=1&limit=1', { cache: 'no-store' });
      if (!res.ok) return;
      const { posts } = await res.json();
      if (!posts?.length) return;
      const latest = posts[0].published_at as string;
      if (new Date(latest) > new Date(baselineRef.current)) {
        const countRes = await fetch(
          `/api/posts?page=1&limit=50&since=${encodeURIComponent(baselineRef.current)}`,
          { cache: 'no-store' }
        );
        if (countRes.ok) {
          const { posts: newer } = await countRes.json();
          const count = newer?.filter((p: { published_at: string }) =>
            new Date(p.published_at) > new Date(baselineRef.current)
          ).length ?? 1;
          setNewCount(count);
        } else {
          setNewCount(1);
        }
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    const id = setInterval(checkForNew, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkForNew]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setNewCount(0);
    baselineRef.current = new Date().toISOString();
    router.refresh();
    setTimeout(() => setRefreshing(false), 1200);
  }, [router]);

  return (
    <AnimatePresence>
      {newCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-india-saffron text-white font-semibold text-sm shadow-saffron hover:shadow-saffron-lg hover:bg-saffron-dark transition-all duration-200 disabled:opacity-70"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {refreshing
              ? 'Refreshing…'
              : `${newCount} new ${newCount === 1 ? 'story' : 'stories'} — tap to load`}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
