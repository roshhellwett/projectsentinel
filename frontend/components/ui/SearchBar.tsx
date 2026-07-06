'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Post } from '@/types';
import { NewsCard } from '@/components/news/NewsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { cachedFetch } from '@/lib/utils/fetchCache';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const reducedMotion = useReducedMotion();
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
    if (!q || q.length < 2) {
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
      cachedFetch<{ posts?: Post[]; count?: number }>(`/api/search/?q=${encodeURIComponent(q)}&limit=10`, {
        signal: controller.signal,
        cacheTtl: 30_000, // 30s client memory TTL for search queries
      })
        .then((payload) => {
          if (controller.signal.aborted) return;
          setResults(payload.posts || []);
          setResultCount(typeof payload.count === 'number' ? payload.count : (payload.posts?.length ?? 0));
          setIsLoading(false);
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          setError('Search failed. Check connection.');
          setIsLoading(false);
        });
    }, 300); // 300ms debounce

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
      if (e.key === 'Escape' && !e.defaultPrevented) onClose();
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

  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).visibility !== 'hidden');

    if (focusableElements.length === 0) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const cards = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('#search-results [role="article"]') || []);
      const idx = cards.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowDown') {
        if (idx === -1 && cards.length > 0 && document.activeElement === inputRef.current) {
          e.preventDefault();
          cards[0].focus();
        } else if (idx !== -1 && idx < cards.length - 1) {
          e.preventDefault();
          cards[idx + 1].focus();
        }
      } else if (e.key === 'ArrowUp' && idx !== -1) {
        e.preventDefault();
        if (idx > 0) cards[idx - 1].focus();
        else inputRef.current?.focus();
      }
    }
    handleTabKey(e);
  }, [handleTabKey]);

  const handleSelect = useCallback((post: Post) => {
    onClose();
    router.push(`/news/${post.id}/`);
  }, [onClose, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Search articles"
          className={`fixed inset-0 ${Z_INDEX.popover} overflow-y-auto bg-[#fcfaf7] dark:bg-[#121218] md:bg-paper/80 md:dark:bg-black/80 md:backdrop-blur-2xl md:backdrop-saturate-[1.3] transform-gpu select-none overflow-x-hidden w-full max-w-full touch-action-manipulation`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : -20, scale: reducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -10, scale: reducedMotion ? 1 : 0.98 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 400, damping: 32, mass: 0.8 }}
            className="container mx-auto px-4 py-8 md:py-10 transform-gpu"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="editorial-kicker mb-2">India Verified</p>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-[-0.03em]">Search</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="tap-target p-2 hover:bg-paper-2 rounded transition-[background-color,transform] duration-150 transform-gpu touch-action-manipulation select-none hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close search"
              >
                <X className="w-6 h-6 text-muted" />
              </motion.button>
            </div>

            <form
              className="relative max-w-3xl mx-auto mb-8"
              onSubmit={(e) => {
                e.preventDefault();
              }}
              role="search"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted pointer-events-none" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search verified news, topics, keywords..."
                  className="w-full pl-12 pr-12 py-4 bg-paper-2 text-ink rounded-xl border border-rule focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base font-medium shadow-inner placeholder:text-muted"
                  aria-label="Search query"
                  aria-controls="search-results"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 p-1.5 text-muted hover:text-ink rounded-full transition-colors touch-action-manipulation"
                    aria-label="Clear search query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <div id="search-results" className="max-w-3xl mx-auto" aria-live="polite">
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-4 border border-rule rounded-xl bg-paper">
                      <Skeleton className="h-4 w-1/4 mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="text-center py-12 px-4 border border-red-500/20 bg-red-500/5 rounded-xl">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">{error}</p>
                  <button
                    type="button"
                    onClick={() => setQuery((q) => q + ' ')}
                    className="px-4 py-2 bg-ink text-paper text-xs font-bold rounded-lg shadow-sm touch-action-manipulation"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !error && query.trim().length >= 2 && results.length === 0 && (
                <div className="text-center py-16 px-4">
                  <p className="text-base font-semibold text-ink mb-1">No verified stories found</p>
                  <p className="text-sm text-muted">Try searching for different keywords or broader topics.</p>
                </div>
              )}

              {!isLoading && !error && results.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4 px-1">
                    Found {resultCount} verified {resultCount === 1 ? 'story' : 'stories'}
                  </p>
                  <div className="space-y-4">
                    {results.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleSelect(post)}
                        className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 transform-gpu touch-action-manipulation select-none"
                      >
                        <NewsCard post={post} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
