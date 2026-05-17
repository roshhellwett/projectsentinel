'use client';

// last edited 2026-05-17 by roshhellwett

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




  const { isRead } = useReadPosts();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending stories" className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 shadow-[0_8px_22px_-14px_rgba(139,127,240,0.7)]">
          <Flame className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950 tracking-normal leading-none">Trending Now</h2>
          <p className="text-[11px] text-slate-500 mt-1">Top stories by credibility</p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-950/10 to-transparent ml-3" />
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-950/[0.08] bg-white/70 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Top {trending.length}
        </span>
      </div>

      <ol className="premium-card relative rounded-[1.6rem] overflow-hidden divide-y divide-slate-950/[0.06]">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        {trending.map((post, index) => {
          const read = hydrated && isRead(post.id);
          const rank = index + 1;
          const isTop = rank === 1;
          const themeHex = getCategoryTheme(post.category).hex;
          return (
            <motion.li
              key={post.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`relative ${isTop ? 'trending-top-shimmer overflow-hidden' : ''}`}
            >
              <Link
                href={`/news/${post.id}/`}
                data-read={read ? 'true' : 'false'}
                className={`touch-polish group relative z-10 flex items-stretch transition-all duration-200 hover:bg-slate-950/[0.025] active:bg-slate-950/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-inset ${read ? 'opacity-60' : ''}`}
                aria-label={read ? `${post.headline} (already read)` : post.headline}
              >
                <div
                  className="w-[3px] flex-shrink-0 transition-opacity duration-200 opacity-50 group-hover:opacity-100"
                  style={{ backgroundColor: themeHex }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-4 flex-1 min-w-0 pl-4 pr-5 py-[18px] sm:py-5">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 sm:w-12">
                    <span
                      className={`leading-none tabular-nums tracking-normal transition-colors duration-200 ${
                        isTop
                          ? 'text-[34px] sm:text-[38px] font-black text-accent'
                          : 'text-[28px] sm:text-[32px] font-black text-slate-300 group-hover:text-slate-500'
                      }`}
                      style={{ fontFamily: 'var(--font-newsreader)' }}
                      aria-hidden="true"
                    >
                      {String(rank).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[14.5px] line-clamp-2 leading-snug transition-colors duration-200 group-hover:text-accent ${
                      isTop ? 'font-bold text-slate-950' : 'font-semibold text-slate-900'
                    }`}>
                      {post.headline}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

                  <div className="hidden min-[360px]:flex flex-shrink-0 w-24 sm:w-28 items-center">
                    <CredibilityBar score={post.credibility_score} compact />
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
