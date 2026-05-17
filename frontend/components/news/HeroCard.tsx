'use client';

// last edited 2026-05-17 by roshhellwett

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Database, Flame, ShieldCheck } from 'lucide-react';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CategoryPlaceholder } from './CategoryPlaceholder';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { getScoreHex, getScoreLabel } from '@/lib/utils/scoreColor';

interface HeroCardProps {
  post: Post;
  badge?: 'breaking' | 'trending' | null;
}

export function HeroCard({ post, badge = 'trending' }: HeroCardProps) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(post.credibility_score ?? 0)));
  const scoreLabel = getScoreLabel(clampedScore);
  const scoreHex = getScoreHex(clampedScore);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative group [perspective:1200px]"
    >
      <Link
        href={`/news/${post.id}/`}
        className="touch-polish premium-card premium-card-hover hover-lift block relative overflow-hidden rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >

        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="relative grid grid-cols-1 lg:grid-cols-5 min-h-[340px] lg:min-h-[420px]">

          <div className="relative lg:col-span-2 min-h-[180px] lg:min-h-full overflow-hidden">
            <CategoryPlaceholder category={post.category} />

            <div
              className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-white/80 pointer-events-none"
              aria-hidden="true"
            />

            {badge && (
              <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 backdrop-blur-xl border border-slate-950/[0.10] text-[10px] font-bold uppercase tracking-wider text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_14px_42px_-28px_rgba(139,127,240,0.75)]">
                <Flame className="w-3 h-3 text-accent" />
                {badge === 'breaking' ? 'Breaking' : 'Trending'}
              </div>
            )}
          </div>


          <div className="relative lg:col-span-3 p-7 md:p-10 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <CategoryTag category={post.category} />
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500"
                suppressHydrationWarning
              >
                <Clock className="w-3 h-3" />
                {formatTimeAgo(post.published_at)}
              </span>
            </div>

            <h2 className="text-[28px] md:text-[38px] lg:text-[46px] font-bold text-slate-950 tracking-normal leading-[1.06] mb-5">
              {post.headline}
            </h2>

            <p className="text-base md:text-lg text-slate-600 leading-8 line-clamp-3 max-w-2xl mb-7">
              {post.summary}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="inline-flex items-center gap-3.5 rounded-full border border-slate-950/[0.10] bg-white/80 px-4 py-2.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_50px_-32px_rgba(139,127,240,0.45)]">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${scoreHex}1F`, color: scoreHex }}
                  aria-hidden="true"
                >
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[18px] font-black tabular-nums leading-none text-slate-950">
                    {clampedScore}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {scoreLabel}
                  </span>
                </div>
                <div className="h-5 w-px bg-slate-950/[0.12]" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <Database className="h-3 w-3 text-accent" />
                  <span className="tabular-nums text-slate-950">{post.source_count}</span>
                  <span className="font-medium text-slate-500">
                    {post.source_count === 1 ? 'source verified' : 'sources verified'}
                  </span>
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition-all duration-300 group-hover:gap-2.5">
                Read full story
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
