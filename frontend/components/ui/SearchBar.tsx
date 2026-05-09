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
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
          className="fixed inset-0 z-[100] bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-white tracking-tight">Search</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Close search"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                ref={inputRef}
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-12 pr-4 py-4 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all duration-200"
                autoFocus
              />
            </div>

            <div className="max-w-4xl mx-auto">
              {isLoading && (
                <p className="text-center text-zinc-500 py-8 animate-pulse">Loading articles...</p>
              )}
              {error && (
                <p className="text-center text-cred-low py-8">{error}</p>
              )}
              {query.trim() && !isLoading && (
                <p className="text-sm text-zinc-500 mb-4">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
