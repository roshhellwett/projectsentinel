'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { ArrowUpRight } from 'lucide-react';

interface DrawerRelatedProps {
  currentPost: Post;
  onSelect: (post: Post) => void;
}

export function DrawerRelated({ currentPost, onSelect }: DrawerRelatedProps) {
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      page: '1',
      limit: '8',
      category: currentPost.category || '',
    });
    fetch(`/api/posts/?${params.toString()}`, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch related'))))
      .then(async (payload: { posts: Post[] }) => {
        if (cancelled) return;
        let filtered = (payload.posts ?? [])
          .filter((p) => p.id !== currentPost.id);

        if (filtered.length < 3 && !cancelled) {
          try {
            const fallbackRes = await fetch('/api/posts/?limit=10', { signal: ctrl.signal, cache: 'no-store' });
            if (fallbackRes.ok) {
              const fallbackPayload = await fallbackRes.json();
              const more = (fallbackPayload.posts ?? []).filter(
                (p: Post) => p.id !== currentPost.id && !filtered.some((f) => f.id === p.id)
              );
              filtered = [...filtered, ...more];
            }
          } catch {
            // Ignore fallback errors
          }
        }

        if (cancelled) return;
        setRelated(filtered.slice(0, 3));
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [currentPost.id, currentPost.category]);

  if (!loading && related.length === 0 && !error) return null;

  return (
    <section className="mt-8 border-t border-rule pt-6">
      <div className="flex items-center gap-2 mb-4">
        <span aria-hidden="true" className="w-1 h-4 bg-accent" />
        <h3 className="font-display text-sm font-bold text-ink tracking-[-0.01em]">Keep reading</h3>
      </div>

      {loading ? (
        <div className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[68px] rounded border border-rule bg-paper-2 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-[13px] text-muted py-4 text-center">Could not load related stories.</p>
      ) : (
        <ul className="space-y-2.5">
          {related.map((post, i) => (
            <motion.li
              key={post.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => onSelect(post)}
                className="group flex w-full items-start gap-3 rounded border border-rule bg-paper px-3.5 py-3 text-left transition-all hover-lift hover:border-rule-strong hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <CategoryTag category={post.category} />
                    <CredibilityBadge score={post.credibility_score} compact />
                  </div>
                  <p className="font-display text-[14px] font-semibold text-ink line-clamp-2 text-balance break-words leading-snug group-hover:text-accent transition-colors">
                    {post.headline}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 flex-shrink-0 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
