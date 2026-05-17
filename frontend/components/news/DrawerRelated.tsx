'use client';

// last edited 2026-05-17 by roshhellwett

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      page: '1',
      limit: '8',
      category: currentPost.category,
    });
    fetch(`/api/posts?${params.toString()}`, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { posts: Post[] }) => {
        if (cancelled) return;
        const filtered = (data.posts ?? [])
          .filter((p) => p.id !== currentPost.id)
          .slice(0, 3);
        setRelated(filtered);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [currentPost.id, currentPost.category]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-8 border-t border-slate-950/[0.07] pt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 rounded-full bg-accent shadow-[0_0_8px_rgba(139,127,240,0.7)]" />
        <h3 className="text-sm font-bold text-slate-950 tracking-normal">Keep reading</h3>
      </div>

      {loading ? (
        <div className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[68px] rounded-2xl bg-slate-100/80 animate-pulse"
            />
          ))}
        </div>
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
                className="touch-polish group flex w-full items-start gap-3 rounded-2xl border border-slate-950/[0.07] bg-white/70 px-3.5 py-3 text-left transition-all hover:border-accent/35 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <CategoryTag category={post.category} />
                    <CredibilityBadge score={post.credibility_score} compact />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-950 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                    {post.headline}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
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
