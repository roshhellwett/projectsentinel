'use client';

// last edited 2026-05-17 by roshhellwett

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
  const [resultCount, setResultCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);







  useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setResultCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);
      fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error('search failed');
          return res.json();
        })
        .then((data: { posts?: Post[]; count?: number }) => {
          setResults(data.posts || []);
          setResultCount(typeof data.count === 'number' ? data.count : (data.posts?.length ?? 0));
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setError('Search failed');
          setIsLoading(false);
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    lockBodyScroll();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      unlockBodyScroll();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [isOpen]);




  useEffect(() => {
    if (isOpen) return;
    setQuery('');
    setResults([]);
    setResultCount(0);
    setError(null);
    setIsLoading(false);
  }, [isOpen]);

  const handleSelect = useCallback((post: Post) => {
    onClose();
    router.push(`/news/${post.id}/`);
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
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30, mass: 0.8 }}
            className="container mx-auto px-4 py-8 md:py-10"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="editorial-kicker mb-2">India Verified</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-slate-950 tracking-normal">Search</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="touch-polish p-2 hover:bg-slate-950/[0.06] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:bg-slate-950/[0.08]"
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


                onClose();
                router.push(`/search/?q=${encodeURIComponent(q)}`);
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
                className="w-full pl-12 pr-4 py-4 bg-white/82 backdrop-blur-2xl border border-slate-950/[0.12] rounded-2xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_22px_70px_-54px_rgba(139,127,240,0.45)]"


                aria-label="Search verified stories"
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
                <p className="text-center text-red-500 py-8">{error}</p>
              )}
              {query.trim() && !isLoading && !error && (
                <p className="text-sm text-slate-500 mb-4">
                  {resultCount === 0
                    ? <>No matches for &quot;<span className="text-slate-700 font-medium">{query}</span>&quot;. Press Enter to broaden.</>
                    : <><span className="text-slate-700 font-medium tabular-nums">{resultCount}</span> {resultCount === 1 ? 'match' : 'matches'} for &quot;<span className="text-slate-700 font-medium">{query}</span>&quot;{resultCount > results.length ? <> — showing top {results.length}</> : null}</>
                  }
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
