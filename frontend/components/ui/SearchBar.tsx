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
      fetch(`/api/search/?q=${encodeURIComponent(q)}&limit=10`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error('search failed');
          return res.json();
        })
        .then((payload: { posts?: Post[]; count?: number }) => {
          setResults(payload.posts || []);
          setResultCount(typeof payload.count === 'number' ? payload.count : (payload.posts?.length ?? 0));
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setError('Search failed');
          setIsLoading(false);
        });
    }, 350);

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
           className={`fixed inset-0 ${Z_INDEX.popover} overflow-y-auto bg-paper/70 backdrop-blur-2xl backdrop-saturate-[1.3] will-change-opacity`}
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
            className="container mx-auto px-4 py-8 md:py-10 will-change-transform transform-gpu"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="editorial-kicker mb-2">India Verified</p>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-[-0.03em]">Search</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="tap-target p-2 hover:bg-paper-2 rounded transition-all hover-lift duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close search"
              >
                <X className="w-6 h-6 text-muted" />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              <input
                ref={inputRef}
                id="search-input"
                type="search"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-autocomplete="list"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verified stories... (press Enter for full search)"
                className="w-full pl-12 pr-12 py-3.5 bg-paper/50 border-2 border-rule-strong rounded-xl text-ink placeholder-subtle focus:outline-none focus:border-accent focus:bg-paper transition-all duration-300 shadow-sm"
                aria-label="Search verified stories"
              />
              <AnimatePresence>
                {query.length > 0 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="tap-target min-w-[44px] min-h-[44px] absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink hover:bg-paper-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>

            <div className="max-w-4xl mx-auto">
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[190px] rounded-md" />
                  ))}
                </div>
              )}
              {error && (
                <p className="text-center text-red-500 py-8">{error}</p>
              )}
              {query.trim() && !isLoading && !error && (
                <p className="text-sm text-muted mb-4">
                  {resultCount === 0
                    ? <>No matches for &quot;<span className="text-ink font-medium">{query}</span>&quot;. Press Enter to broaden.</>
                    : <><span className="text-ink font-medium tabular-nums">{resultCount}</span> {resultCount === 1 ? 'match' : 'matches'} for &quot;<span className="text-ink font-medium">{query}</span>&quot;{resultCount > results.length ? <> — showing top {results.length}</> : null}</>
                  }
                </p>
              )}

              <div id="search-results" role="list" aria-label="Search results" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
