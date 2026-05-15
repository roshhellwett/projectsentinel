'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, ChevronRight } from 'lucide-react';
import { Post } from '@/types';
import { CredibilityBar } from './CredibilityBar';
import { CategoryTag } from './CategoryTag';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { useReadPosts } from '@/lib/utils/readPosts';

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  // Trending is now resolved server-side and passed in already in the
  // correct order. We only dedupe + cap defensively so this component
  // remains safe if a caller passes a raw list.
  const trending = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const seen = new Set<string>();
    const out: Post[] = [];
    for (const p of posts) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
      if (out.length === 5) break;
    }
    return out;
  }, [posts]);

  // Persistent localStorage read state — also rendered as dimming in the
  // home feed. Showing it here too means the user can scan trending and
  // immediately see which stories they've already opened.
  const { isRead } = useReadPosts();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/30">
          <Flame className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950 tracking-tight">Trending Now</h2>
          <p className="text-[11px] text-slate-500">Top stories by credibility</p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-950/10 to-transparent ml-3" />
      </div>

      <div className="premium-card rounded-[1.6rem] overflow-hidden">
        {trending.map((post, index) => {
          const read = hydrated && isRead(post.id);
          return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/news/${post.id}/`}
              data-read={read ? 'true' : 'false'}
              className={`touch-polish group relative z-10 flex items-center border-b border-slate-950/[0.07] last:border-b-0 hover:bg-slate-950/[0.035] active:bg-slate-950/[0.05] transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-inset ${read ? 'opacity-60' : ''}`}
              aria-label={read ? `${post.headline} (already read)` : post.headline}
            >
              {/* Category colour left bar */}
              <div
                className="w-[3px] self-stretch flex-shrink-0 opacity-60"
                style={{ backgroundColor: getCategoryTheme(post.category).hex }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-4 flex-1 min-w-0 px-4 sm:px-5 py-4">
                {/* Rank number */}
                <span
                  className="text-[28px] sm:text-[32px] font-black tracking-tighter text-slate-300 group-hover:text-accent transition-colors duration-200 leading-none w-10 sm:w-12 flex-shrink-0 tabular-nums"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-accent transition-colors duration-200">
                    {post.headline}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <CategoryTag category={post.category} />
                    {read && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[9px] font-bold uppercase tracking-wider"
                        title="You have read this story"
                      >
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        Read
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <CredibilityBar score={post.credibility_score} />
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
}
