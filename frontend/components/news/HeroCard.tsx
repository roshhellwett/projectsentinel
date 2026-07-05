'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck, Flame, Radio } from 'lucide-react';
import { Post } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { getHostname } from '@/lib/utils/getHostname';
import { ScoreRing } from './ScoreRing';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { CategoryIcon } from './CategoryIcon';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

interface HeroCardProps {
  post: Post;
  badge?: 'breaking' | 'trending' | null;
}

export function HeroCard({ post, badge = 'trending' }: HeroCardProps) {
  const reducedMotion = useReducedMotion();
  const haptic = useHapticFeedback();
  const theme = getCategoryTheme(post.category);

  const firstSource = (post.sources ?? [])[0];
  const firstHost = firstSource ? getHostname(firstSource.url) : '';
  const otherSourceCount = Math.max(0, (post.source_count ?? (post.sources?.length ?? 0)) - 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: reducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group [perspective:1200px]"
    >
      <Link
        href={`/news/${post.id}/`}
        onClick={() => haptic.medium()}
        className="block relative overflow-hidden rounded-2xl border border-rule/60 shadow-hero hover:shadow-[0_16px_48px_rgb(var(--c-accent)/0.15)] transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group/hero bg-paper/70 backdrop-blur-2xl backdrop-saturate-[1.4]"
      >
        {/* Category accent gradient bar — thicker, more prominent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-20 transition-all duration-500 group-hover/hero:h-1.5"
          style={{ background: theme.cssGradient }}
          aria-hidden="true"
        />

        {/* Immersive ambient backdrop — dual radial gradient */}
        <div 
          className="absolute inset-0 opacity-[0.12] dark:opacity-[0.20] transition-opacity duration-700 group-hover/hero:opacity-[0.22] dark:group-hover/hero:opacity-[0.32]"
          style={{ 
            background: `radial-gradient(ellipse at 75% 15%, ${theme.gradientFrom}, transparent 65%), radial-gradient(ellipse at 25% 85%, ${theme.gradientTo}, transparent 65%)` 
          }}
          aria-hidden="true"
        />

        {/* Subtle ambient gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:to-black/20 pointer-events-none z-10"
          aria-hidden="true"
        />

        <div className="relative z-10 p-7 sm:p-9 md:p-11 lg:p-14 flex flex-col justify-between min-h-[360px] sm:min-h-[400px] lg:min-h-[440px]">
          {/* Top Header Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Category Pill */}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] rounded-full border backdrop-blur-md"
                style={theme.pill}
              >
                <CategoryIcon name={theme.icon} className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
                {theme.label}
              </span>

              {/* Live / Breaking Badge */}
              {badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-like text-white text-[11px] font-extrabold uppercase tracking-[0.12em] rounded-full shadow-glow-like animate-pulse">
                  <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {badge === 'breaking' ? 'Breaking Story' : 'Top Trending'}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted bg-paper/80 px-2.5 py-1 rounded-full border border-rule/50 backdrop-blur-md shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
              </span>
            </div>

            {/* Prominent Score Ring */}
            <div className="flex items-center gap-2.5 bg-paper/85 backdrop-blur-md px-3.5 py-2 rounded-full border border-rule/50 shadow-glass">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted hidden sm:inline">Credibility</span>
              <ScoreRing score={post.credibility_score} size={40} strokeWidth={3.5} compact />
            </div>
          </div>

          {/* Center Content Row */}
          <div className="my-8 max-w-4xl">
            <h2 className="font-display font-bold text-ink leading-[1.06] tracking-[-0.03em] mb-5 text-[clamp(1.85rem,4vw,3.5rem)] group-hover/hero:text-accent transition-colors duration-300">
              {post.headline}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-ink-soft leading-[1.7] line-clamp-3 max-w-3xl mb-7">
              {post.summary}
            </p>

            {firstHost && (
              <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted bg-paper/80 border border-rule/50 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-sm">
                <Radio className="w-3.5 h-3.5 text-accent" />
                <span className="font-bold uppercase tracking-[0.15em] text-accent">First reported by</span>
                <span className="font-bold text-ink">{firstHost}</span>
                {otherSourceCount > 0 && (
                  <>
                    <span className="text-rule-strong">&middot;</span>
                    <span>
                      verified by <span className="font-bold text-ink">{otherSourceCount}</span> other publications
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom Call to Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-rule/40">
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <ShieldCheck className="w-4 h-4 text-cred-high" />
              <span>Cross-referenced &amp; AI fact-checked across <strong className="text-ink">{post.source_count || 1}</strong> sources</span>
            </div>

            <span className="inline-flex items-center gap-2.5 px-6 py-3 bg-accent text-paper text-sm font-bold tracking-wide rounded-xl shadow-md transition-all duration-400 group-hover/hero:bg-accent-hover group-hover/hero:gap-3.5 group-hover/hero:shadow-card-glow group-hover/hero:scale-[1.02]">
              <span>Read Full Story</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-400 group-hover/hero:translate-x-1.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
