'use client';

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
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink mb-6 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded border border-rule bg-paper group-hover:border-ink transition-all hover-lift">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        Back to all news
      </Link>

      <header className="mb-10 pb-8 border-b border-rule flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <span aria-hidden="true" className="block w-12 h-[2px] bg-accent mb-5" />
          <p className="editorial-kicker mb-3">Your reading list</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink mb-3 leading-[1.05]">
            Saved stories
          </h1>
          <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-rule-strong text-sm font-medium text-ink hover:border-ink hover:bg-paper-2 transition-all hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Clear all saved stories"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </motion.button>
        )}
      </header>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[218px] rounded-md" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 py-12">{error}</p>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-paper border border-rule flex items-center justify-center mb-5">
            <Bookmark className="w-7 h-7 text-muted" />
          </div>
          <h2 className="font-display text-lg font-bold text-ink mb-1.5">
            No saved stories yet
          </h2>
          <p className="text-sm text-muted max-w-sm mb-6">
            Tap the bookmark icon on any story to save it for later. Your
            reading list stays on this device.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-ink bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-all hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
