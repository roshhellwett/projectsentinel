'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { getHostname } from '@/lib/utils/getHostname';
import { VerificationStamp } from '@/components/ui/VerificationStamp';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M10 9l6 4-6 4z" />
    </svg>
  );
}

interface HeroCardProps {
  post: Post;
  badge?: 'breaking' | 'trending' | null;
}

export const HeroCard = memo(function HeroCard({ post, badge = 'trending' }: HeroCardProps) {
  const haptic = useHapticFeedback();
  const isVideo = post.content_type === 'video';

  const firstSource = (post.sources ?? [])[0];
  const firstHost = firstSource ? getHostname(firstSource.url) : '';
  const otherSourceCount = Math.max(0, (post.source_count ?? (post.sources?.length ?? 0)) - 1);

  return (
    <div className="w-full max-w-full border border-rule/50 bg-paper-2/65 backdrop-blur-md rounded-[8px] p-3 sm:p-6 md:p-8 relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 300px' }}>
      <Link
        href={`/news/${post.id}/`}
        onClick={() => haptic.medium()}
        className="block group"
      >
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="font-body text-[9px] sm:text-[11px] font-bold tracking-wider uppercase text-ink-soft">
              {post.category}
            </span>
            <span className="w-px h-2.5 sm:h-3 bg-rule flex-shrink-0" />
            <span className="font-mono text-[9px] sm:text-[11px] text-ink-soft" suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
            {isVideo && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-ink/15 text-ink-soft font-body text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                <YoutubeIcon />
                Video
              </span>
            )}
          </div>
          <VerificationStamp score={post.credibility_score} compact />
        </div>

        {badge && (
          <span className="inline-block font-body text-[10px] sm:text-xs font-bold tracking-wider uppercase text-ink mb-2 sm:mb-4">
            {badge === 'breaking' ? 'Breaking Story' : 'Top Story'}
          </span>
        )}

        <h2 className="font-body font-[800] text-ink leading-[1.08] tracking-[-0.02em] mb-1.5 sm:mb-3 text-[clamp(1.15rem,4vw,2.2rem)]">
          {post.headline}
        </h2>

        <p className="font-body text-[12px] sm:text-[14px] text-ink-soft leading-[1.5] sm:leading-[1.6] line-clamp-3 max-w-3xl mb-2 sm:mb-4">
          {post.summary}
        </p>

        {firstHost && (
          <p className="font-body text-[10px] sm:text-[12px] text-ink-soft mb-2 sm:mb-4">
            First reported by <span className="font-semibold text-ink">{firstHost}</span>
            {otherSourceCount > 0 && <> · verified by {otherSourceCount} other sources</>}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-rule">
          <span className="font-body text-[9px] sm:text-[11px] text-ink-soft flex items-center gap-1 sm:gap-1.5">
            <ShieldIcon />
            {post.source_count || 1} sources
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-ink-soft group-hover:text-ink transition-colors font-body font-semibold">
            Read article <ArrowRight />
          </span>
        </div>
      </Link>
    </div>
  );
});
