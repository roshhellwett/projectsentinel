'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { Post, Source } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { cn } from '@/lib/utils/cn';
import { getHostname } from '@/lib/utils/getHostname';
import { BookmarkButton } from './BookmarkButton';
import { CredibilityBar } from './CredibilityBar';
import { SourcePickerButton } from './SourcePickerButton';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

// ─────────────────────────────────────────────────────────────────────────────
// Design system: ONE accent colour per category, used sparingly (small chip
// + hover left-edge bar + score bar detail). The card body stays neutral
// so the feed reads as a single cohesive surface, not a patchwork of pastels.
// Premium aesthetic reference: linear.app, vercel.com, apple.com/newsroom.
//
// Colour is resolved through `lib/theme/categoryTheme` so this card, the
// trending list, the badge pill, and the hero placeholder all share the
// same hue for a given category. Score tier comes from `scoreColor.ts` so
// every credibility bar agrees on borderline scores.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SourceChip — single tappable pill with favicon + name. This is the TRUST
// MOAT: no other Indian news app shows sources inline on the card. Tap the
// chip and you go straight to the original article without dismissing the
// card itself (stopPropagation on the card-level onClick).
// ─────────────────────────────────────────────────────────────────────────────
function getSourceLabel(source: Source): string {
  if (source.title?.trim()) return source.title.trim();
  if (source.name?.trim())  return source.name.trim();
  const host = getHostname(source.url);
  return host || 'Source';
}

function SourceChip({ source }: { source: Source }) {
  const host = getHostname(source.url);
  const label = getSourceLabel(source);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950 hover:bg-white transition-all duration-150 max-w-[140px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      aria-label={`Source: ${label} (opens in new tab)`}
    >
      {host && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(host)}`}
          alt=""
          width={12}
          height={12}
          loading="lazy"
          decoding="async"
          className="w-3 h-3 rounded-sm flex-shrink-0"
        />
      )}
      <span className="truncate">{label}</span>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NewsCard — premium light-theme card.
// Drop-in replacement for the previous pastel-tinted card: same props, same
// export name, so InfiniteFeed, search results, related stories, etc. all
// pick it up without any change at the call site.
// ─────────────────────────────────────────────────────────────────────────────
interface NewsCardProps {
  post: Post;
  onClick?: () => void;
  isNew?: boolean;
  /** When true, dim the card and hide the unread dot — user has already opened this story. */
  isRead?: boolean;
}

function isBreaking(post: Post): boolean {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  return ageMs < 90 * 60 * 1000 && post.credibility_score >= 80;
}

const NewsCardComponent = ({ post, onClick, isNew = false, isRead = false }: NewsCardProps) => {
  const breaking = isBreaking(post);
  const theme = getCategoryTheme(post.category);
  const topSources = (post.sources ?? []).slice(0, 3);
  const extraSources = Math.max(0, (post.source_count ?? 0) - topSources.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read article: ${post.headline}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.975, transition: { duration: 0.1 } }}
      data-read={isRead ? 'true' : 'false'}
      className={cn(
        'news-card-premium group relative isolate flex flex-col h-full cursor-pointer overflow-visible',
        'rounded-3xl bg-white border border-slate-200/70',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_rgba(15,23,42,0.04)]',
        'smooth-shadow',
        'hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isRead && 'opacity-70',
        isNew && 'flash-new-post',
      )}
      style={{ contain: 'layout' }}
    >
      {/* Left-edge accent bar — appears on hover, hue matches category */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: theme.hex }}
      />

      <div className="relative z-10 flex flex-col flex-1 p-5 md:p-6">
        {/* ── Top row: category + breaking + timestamp + score ── */}
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: theme.hex,
                backgroundColor: `${theme.hex}14`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.hex }} />
              {theme.label}
            </span>

            {breaking && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(239,68,68,0.25)]"
                suppressHydrationWarning
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            )}

            <span
              className="text-[10px] text-slate-500 font-medium tabular-nums"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
              suppressHydrationWarning
            >
              {formatTimeAgo(post.published_at)}
            </span>

            {isRead && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[9px] font-bold uppercase tracking-wider"
                aria-label="You have read this story"
                title="You have read this story"
              >
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                Read
              </span>
            )}
          </div>

          <CredibilityBar score={post.credibility_score} compact className="sm:w-32" />
        </div>

        {/* ── Headline (serif, the visual anchor of the card) ── */}
        <h3
          className="text-[19px] md:text-[21px] font-bold leading-[1.25] tracking-normal text-slate-950 line-clamp-3 mb-2.5 transition-colors"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          {post.headline}
        </h3>

        {/* ── Summary ── */}
        <p className="text-[14px] text-slate-600 leading-relaxed line-clamp-2 mb-auto">
          {truncateWords(post.summary, 24)}
        </p>

        {/* ── Source chips (trust moat) ── */}
        {topSources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mr-1">
              Sources
            </span>
            {topSources.map((src, i) => (
              <SourceChip key={src.url || i} source={src} />
            ))}
            {extraSources > 0 && (
              <span className="text-[10px] text-slate-500 font-medium">
                +{extraSources} more
              </span>
            )}
          </div>
        )}

        {/* ── Bottom action row ── */}
        <div className="relative z-20 flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <SourcePickerButton
            sources={post.sources}
            label="Read full"
            className="max-w-[58%]"
            buttonClassName="px-3 py-1.5 text-[10px] font-semibold"
          />

          <div className="flex items-center gap-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.headline} — ${siteUrl}/news/${post.id}/`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 -m-1 rounded-full text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60"
              aria-label="Share on WhatsApp"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <BookmarkButton postId={post.id} variant="icon" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NewsCard = memo(NewsCardComponent);
