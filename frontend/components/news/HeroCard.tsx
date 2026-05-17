'use client';

// last edited 2026-05-17 by roshhellwett

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock, Database, Flame, ShieldCheck, Radio } from 'lucide-react';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CategoryPlaceholder } from './CategoryPlaceholder';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { getHostname } from '@/lib/utils/getHostname';
import { getScoreHex, getScoreLabel } from '@/lib/utils/scoreColor';

interface HeroCardProps {
  post: Post;
  badge?: 'breaking' | 'trending' | null;
}

export function HeroCard({ post, badge = 'trending' }: HeroCardProps) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(post.credibility_score ?? 0)));
  const scoreLabel = getScoreLabel(clampedScore);
  const scoreHex = getScoreHex(clampedScore);

  const firstSource = (post.sources ?? [])[0];
  const firstHost = firstSource ? getHostname(firstSource.url) : '';
  const otherSourceCount = Math.max(0, (post.source_count ?? (post.sources?.length ?? 0)) - 1);

  // Subtle parallax kept on the placeholder image but the lavender orb
  // is gone — editorial layout, no decorative glow.
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 600], [0, 30]);

  return (
    <motion.div
      initial={{ y: 18 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative group [perspective:1200px]"
    >
      <Link
        href={`/news/${post.id}/`}
        className="block relative overflow-hidden rounded-md bg-paper border border-rule transition-[border-color,box-shadow] duration-200 hover:border-rule-strong hover:shadow-paper-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {/* Crimson hairline at the very top — the only chrome flourish. */}
        <span aria-hidden="true" className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />

        <div className="relative grid grid-cols-1 lg:grid-cols-5 min-h-[320px] lg:min-h-[420px]">
          {/* Image / placeholder column */}
          <motion.div
            className="relative lg:col-span-2 min-h-[200px] lg:min-h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-rule"
            style={{ y: imgY }}
          >
            <CategoryPlaceholder category={post.category} />

            {badge && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent text-paper text-[10px] font-bold uppercase tracking-[0.18em]">
                <Flame className="w-3 h-3" strokeWidth={2.2} />
                {badge === 'breaking' ? 'Breaking' : 'Trending'}
              </span>
            )}
          </motion.div>

          {/* Editorial column */}
          <div className="relative lg:col-span-3 p-7 md:p-10 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <CategoryTag category={post.category} />
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted"
                suppressHydrationWarning
              >
                <Clock className="w-3 h-3" />
                {formatTimeAgo(post.published_at)}
              </span>
            </div>

            <h2 className="font-display font-bold text-ink leading-[1.06] tracking-tight mb-5 text-[clamp(1.875rem,3.4vw,3rem)]">
              {post.headline}
            </h2>

            <p className="text-[15px] md:text-base text-ink-soft leading-relaxed line-clamp-3 max-w-2xl mb-5">
              {post.summary}
            </p>

            {firstHost && (
              <p className="mb-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                <Radio className="w-3 h-3 text-accent" aria-hidden="true" />
                <span className="font-bold uppercase tracking-[0.18em] text-accent">First by</span>
                <span className="font-semibold text-ink truncate max-w-[180px]">{firstHost}</span>
                {otherSourceCount > 0 && (
                  <>
                    <span aria-hidden="true" className="text-subtle">·</span>
                    <span>
                      cross-verified by{' '}
                      <span className="font-semibold text-ink tabular-nums">{otherSourceCount}</span>{' '}
                      {otherSourceCount === 1 ? 'other' : 'other publications'}
                    </span>
                  </>
                )}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-5 border-t border-rule">
              <div className="inline-flex items-center gap-3.5">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current"
                  style={{ color: scoreHex }}
                  aria-hidden="true"
                >
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[20px] font-bold tabular-nums leading-none text-ink">
                    {clampedScore}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                    {scoreLabel}
                  </span>
                </div>
                <span className="h-4 w-px bg-rule" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                  <Database className="h-3 w-3 text-accent" />
                  <span className="tabular-nums font-semibold text-ink">{post.source_count}</span>
                  <span>
                    {post.source_count === 1 ? 'source verified' : 'sources verified'}
                  </span>
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-wide text-accent transition-all duration-300 group-hover:gap-2.5">
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
