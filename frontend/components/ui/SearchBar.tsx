/**
 * Full-screen search overlay
 * Optimized: fetches limited posts, loading/error states, animations, router navigation
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Post } from '@/types';
import { NewsCard } from '@/components/news/NewsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || hasFetched) {
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch('/api/posts?page=1&limit=50', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setAllPosts(data.posts || []);
        setHasFetched(true);
        setIsLoading(false);
      })
      .catch((fetchError) => {
        if (fetchError.name === 'AbortError') return;
        setError('Failed to load articles');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [hasFetched, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && allPosts.length > 0) {
        const q = query.toLowerCase();
        const filtered = allPosts.filter(post =>
          post.headline.toLowerCase().includes(q) ||
          post.summary.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q)
        );
        setResults(filtered.slice(0, 10));
      } else {
        setResults([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, allPosts]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      lockBodyScroll();

      return () => {
        document.removeEventListener('keydown', handleEscape);
        unlockBodyScroll();
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const handleSelect = useCallback((post: Post) => {
    onClose();
    router.push(`/news/${post.id}`);
  }, [onClose, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search articles"
          className="fixed inset-0 z-[100] overflow-y-auto bg-background/94 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="container mx-auto px-4 py-8 md:py-10"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="editorial-kicker mb-2">India Verified</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-slate-950 tracking-tighter">Search</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="touch-polish p-2 hover:bg-slate-950/[0.06] rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent active:bg-slate-950/[0.08]"
                aria-label="Close search"
              >
                <X className="w-6 h-6 text-slate-500" />
              </motion.button>
            </div>

            <form
              className="relative max-w-3xl mx-auto mb-8"
              onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                if (!q) return;
                // Enter escapes the in-memory quick filter and hits the proper
                // /search page (server-side FTS over the whole archive).
                onClose();
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                ref={inputRef}
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verified stories... (press Enter for full search)"
                className="w-full pl-12 pr-4 py-4 bg-white/82 backdrop-blur-2xl border border-slate-950/[0.12] rounded-2xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_22px_70px_-54px_rgba(10,132,255,0.45)]"
                autoFocus
              />
            </form>

            <div className="max-w-4xl mx-auto">
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[190px] rounded-[1.65rem]" />
                  ))}
                </div>
              )}
              {error && (
                <p className="text-center text-cred-low py-8">{error}</p>
              )}
              {query.trim() && !isLoading && (
                <p className="text-sm text-slate-500 mb-4">
                  {results.length} results for &quot;{query}&quot;
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((post) => (
                  <NewsCard
                    key={post.id}
                    post={post}
                    onClick={() => handleSelect(post)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
