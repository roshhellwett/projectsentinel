'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsDrawer } from '@/components/news/NewsDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { useReadPosts, useSavedPosts } from '@/lib/utils/readPosts';

export default function SavedPage() {
  const { savedIds, clearSaved } = useSavedPosts();
  const { readIds, markRead } = useReadPosts();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Post | null>(null);

  const idKey = useMemo(() => JSON.stringify([...savedIds]), [savedIds]);
  const idList = useMemo(() => {
    if (!idKey) return [];
    const parsed = JSON.parse(idKey);
    return Array.isArray(parsed) ? parsed.reverse() : [];
  }, [idKey]);

  useEffect(() => {
    if (idList.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch('/api/posts/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idList }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load saved');
        return res.json();
      })
      .then((data: { posts: Post[] }) => {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError('Could not load your saved stories.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [idList]);

  const handleOpen = (post: Post) => {
    markRead(post.id);
    setSelected(post);
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 pt-10 pb-14 max-w-6xl">
      <Link
        href="/"
        className="touch-polish inline-flex items-center gap-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-950 mb-6 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 group"
      >
        <div className="p-1.5 rounded-full bg-white/70 border border-slate-950/[0.10] group-hover:bg-accent/15 group-hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to all news
      </Link>

      <section className="premium-card relative mb-9 rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="editorial-kicker mb-3">Your reading list</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-normal text-slate-950 mb-3">
              Saved stories
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl leading-7">
              Bookmarks are stored on this device only — private and synced
              instantly across tabs.
            </p>
          </div>
          {idList.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.confirm('Clear all saved stories?')) clearSaved();
              }}
              className="touch-polish inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-950/[0.10] text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              aria-label="Clear all saved stories"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </motion.button>
          )}
        </div>
      </section>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[218px] rounded-[1.65rem]" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 py-12">{error}</p>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/70 border border-slate-950/[0.10] flex items-center justify-center mb-5">
            <Bookmark className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-950 mb-1.5">
            No saved stories yet
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Tap the bookmark icon on any story to save it for later. Your
            reading list stays on this device.
          </p>
          <Link
            href="/"
            className="touch-polish inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all active:scale-95 shadow-glow-accent hover:shadow-glow-accent-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse latest news
          </Link>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              onClick={() => handleOpen(post)}
              isRead={readIds.has(post.id)}
            />
          ))}
        </div>
      )}

      <NewsDrawer
        post={selected}
        onClose={() => setSelected(null)}
        onSelectRelated={(next) => {
          markRead(next.id);
          setSelected(next);
        }}
      />
    </div>
  );
}
