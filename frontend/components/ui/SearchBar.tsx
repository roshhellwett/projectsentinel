'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { Post } from '@/types';
import { NewsCard } from '@/components/news/NewsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { cachedFetch } from '@/lib/utils/fetchCache';

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

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
        cacheTtl: 30_000,
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
    }, 300);

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

    previousFocusRef.current = (document.activeElement as HTMLElement) || null;
    lockBodyScroll();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.clearTimeout(timer);
      unlockBodyScroll();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setResultCount(0);
      setError(null);
      setIsLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
      className="fixed inset-0 z-[100] overflow-y-auto bg-paper select-none overflow-x-hidden w-full max-w-full touch-manipulation"
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h2 className="font-display text-xl sm:text-3xl md:text-4xl text-ink">Search</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-paper-2 transition-colors tap-target"
            aria-label="Close search"
          >
            <CloseIcon />
          </button>
        </div>

        <form
          className="relative mb-6 sm:mb-8"
          onSubmit={(e) => {
            e.preventDefault();
          }}
          role="search"
        >
          <div className="relative flex items-center">
            <span className="absolute left-3 sm:left-4 text-muted pointer-events-none">
              <SearchIcon />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verified news, topics, keywords..."
              className="w-full pl-9 sm:pl-12 pr-9 sm:pr-12 py-3 sm:py-3.5 bg-paper-2 text-ink border border-rule focus:border-ink outline-none transition-all font-body placeholder:text-muted text-sm sm:text-base"
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
                className="absolute right-2 sm:right-3 p-1.5 text-muted hover:text-ink transition-colors"
                aria-label="Clear search query"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </form>

        <div id="search-results" className="max-w-3xl mx-auto" aria-live="polite">
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 border border-rule bg-paper-2">
                  <Skeleton className="h-4 w-1/4 mb-3 bg-rule" />
                  <Skeleton className="h-6 w-3/4 mb-2 bg-rule" />
                  <Skeleton className="h-4 w-full bg-rule" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 px-4 border border-rule bg-paper-2">
              <p className="font-body text-sm text-ink mb-2">{error}</p>
              <button
                type="button"
                onClick={() => setQuery((q) => q + ' ')}
                className="ink-btn text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-16 px-4">
              <p className="font-display text-lg text-ink mb-1">No verified stories found</p>
              <p className="font-body text-sm text-ink-soft">Try searching for different keywords or broader topics.</p>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div>
              <p className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft mb-4 px-1">
                Found {resultCount} verified {resultCount === 1 ? 'story' : 'stories'}
              </p>
              <div className="space-y-4">
                {results.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handleSelect(post)}
                    className="cursor-pointer transition-opacity duration-200 hover:opacity-80 touch-manipulation select-none"
                  >
                    <NewsCard post={post} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
