'use client';

import { useState, useCallback } from 'react';
import { Post } from '@/types';
import { NewsGrid } from './NewsGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { RefreshCw } from 'lucide-react';

interface LoadMoreGridProps {
  initialPosts: Post[];
  initialCount: number;
  category?: string;
  pageSize?: number;
}

export function LoadMoreGrid({ initialPosts, initialCount, category, pageSize = 20 }: LoadMoreGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = posts.length < initialCount;

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({ page: String(nextPage), limit: String(pageSize) });
      if (category) params.set('category', category);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load more stories');

      const data: { posts: Post[]; count: number } = await res.json();
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = data.posts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setPage(nextPage);
    } catch (err) {
      setError('Could not load more stories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, category, pageSize]);

  return (
    <>
      <NewsGrid posts={posts} />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-2xl animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-red-500 mt-4">{error}</p>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:bg-india-saffron/5 hover:border-india-saffron/40 hover:text-india-saffron transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Load More Stories
          </button>
        </div>
      )}

      {!hasMore && posts.length > pageSize && (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8">
          You&apos;ve reached the end — {posts.length} stories loaded.
        </p>
      )}
    </>
  );
}
