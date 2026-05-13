'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Post, Source } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { truncateWords } from '@/lib/utils/truncate';
import { cn } from '@/lib/utils/cn';
import { BookmarkButton } from './BookmarkButton';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

// ─────────────────────────────────────────────────────────────────────────────
// Design system: ONE accent colour per category, used sparingly (small chip
// + hover left-edge bar + score-gauge ring tint). The card body stays neutral
// so the feed reads as a single cohesive surface, not a patchwork of pastels.
// Premium aesthetic reference: linear.app, vercel.com, apple.com/newsroom.
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { color: string; label: string }> = {
  politics:      { color: '#7c3aed', label: 'Politics' },
  business:      { color: '#059669', label: 'Business' },
  sports:        { color: '#ea580c', label: 'Sports' },
  tech:          { color: '#2563eb', label: 'Tech' },
  crime:         { color: '#dc2626', label: 'Crime' },
  science:       { color: '#0891b2', label: 'Science' },
  health:        { color: '#16a34a', label: 'Health' },
  world:         { color: '#db2777', label: 'World' },
  entertainment: { color: '#ca8a04', label: 'Entertainment' },
  education:     { color: '#9333ea', label: 'Education' },
};

const DEFAULT_META = { color: '#475569', label: 'News' };

// ─────────────────────────────────────────────────────────────────────────────
// CredibilityGauge — animated circular SVG arc. The HERO element of the card.
// On mount, the ring fills from 0 to the score over ~1.1s with an ease-out
// cubic so it lands in a way that draws the eye without being theatrical.
// Colour band: 85+ green (trustworthy), 70–84 amber (caveat), <70 red (low).
// ─────────────────────────────────────────────────────────────────────────────
function CredibilityGauge({ score }: { score: number }) {
  const size = 48;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);

  const color =
    clamped >= 85 ? '#10b981' :
    clamped >= 70 ? '#f59e0b' :
                    '#ef4444';

  return (
    <div
      className="relative inline-flex flex-shrink-0"
      style={{ width: size, height: size }}
      aria-label={`AI credibility score: ${score} out of 100`}
      role="img"
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center leading-none">
        <span
          className="text-[13px] font-semibold tabular-nums"
          style={{ color, fontFamily: 'var(--font-geist-mono)' }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SourceChip — single tappable pill with favicon + name. This is the TRUST
// MOAT: no other Indian news app shows sources inline on the card. Tap the
// chip and you go straight to the original article without dismissing the
// card itself (stopPropagation on the card-level onClick).
// ─────────────────────────────────────────────────────────────────────────────
function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

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
  const meta = CATEGORY_META[post.category] ?? DEFAULT_META;
  const topSources = (post.sources ?? []).slice(0, 3);
  const extraSources = Math.max(0, (post.source_count ?? 0) - topSources.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.article
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read article: ${post.headline}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      data-read={isRead ? 'true' : 'false'}
      className={cn(
        'news-card-premium group relative flex flex-col h-full cursor-pointer overflow-hidden',
        'rounded-3xl bg-white border border-slate-200/70',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_rgba(15,23,42,0.04)]',
        'transition-[border-color,box-shadow,transform] duration-200 ease-out',
        'hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isRead && 'opacity-70',
        isNew && 'flash-new-post',
      )}
      style={{ contain: 'layout paint' }}
    >
      {/* Left-edge accent bar — appears on hover, hue matches category */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: meta.color }}
      />

      <div className="relative z-10 flex flex-col flex-1 p-5 md:p-6">
        {/* ── Top row: category + breaking + timestamp · gauge ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: meta.color,
                backgroundColor: `${meta.color}14`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.label}
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
          </div>

          <CredibilityGauge score={post.credibility_score} />
        </div>

        {/* ── Headline (serif, the visual anchor of the card) ── */}
        <h3
          className="text-[19px] md:text-[21px] font-bold leading-[1.25] tracking-tight text-slate-950 line-clamp-3 mb-2.5 transition-colors"
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
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: meta.color }} />
            Read full story
            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </span>

          <div className="flex items-center gap-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.headline} — ${siteUrl}/news/${post.id}`)}`}
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
    </motion.article>
  );
};

export const NewsCard = memo(NewsCardComponent);
