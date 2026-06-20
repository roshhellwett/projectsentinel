'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, useAnimation, useReducedMotion, type PanInfo } from 'framer-motion';
import { ShieldCheck, BookOpen, Globe, AlertTriangle } from 'lucide-react';
import type { Post, Source } from '@/types';
import { formatTimeAgo } from '@/lib/utils/formatDate';
import { summaryToBullets } from '@/lib/utils/summaryToBullets';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { getHostname } from '@/lib/utils/getHostname';
import { CredibilityBar } from '@/components/news/CredibilityBar';
import { SourcePickerButton } from '@/components/news/SourcePickerButton';
import { BookmarkButton } from '@/components/news/BookmarkButton';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

const SWIPE_DIST = 100;
const SWIPE_VEL = 600;

function decideDirection(info: PanInfo): SwipeDirection | null {
  const { offset, velocity } = info;
  const ax = Math.abs(offset.x);
  const ay = Math.abs(offset.y);
  const avx = Math.abs(velocity.x);
  const avy = Math.abs(velocity.y);
  const horizontalDominant = Math.max(ax, avx * 0.25) > Math.max(ay, avy * 0.25);
  if (horizontalDominant) {
    if (offset.x >  SWIPE_DIST || velocity.x >  SWIPE_VEL) return 'right';
    if (offset.x < -SWIPE_DIST || velocity.x < -SWIPE_VEL) return 'left';
    return null;
  }
  if (offset.y < -SWIPE_DIST || velocity.y < -SWIPE_VEL) return 'up';
  if (offset.y >  SWIPE_DIST || velocity.y >  SWIPE_VEL) return 'down';
  return null;
}

function haptic(pattern: number | number[] = 12) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch { /* non-fatal — some browsers block vibrate */ }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

function estimateReadMinutes(text: string | null | undefined): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function ageDotClass(ageMs: number): string {
  if (ageMs < 60 * 60 * 1000) return 'bg-accent';
  if (ageMs < 6 * 60 * 60 * 1000) return 'bg-ink';
  return 'bg-rule-strong';
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
  const [faviconErrored, setFaviconErrored] = useState(false);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-paper-2 border border-rule text-[10px] font-medium text-muted hover:border-ink hover:text-ink transition-colors max-w-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      aria-label={`Source: ${label} (opens in new tab)`}
    >
      {host && !faviconErrored ? (
        <Image
          src={`https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(host)}`}
          alt=""
          width={12}
          height={12}
          loading="lazy"
          decoding="async"
          onError={() => setFaviconErrored(true)}
          className="w-3 h-3 flex-shrink-0"
        />
      ) : host ? (
        <Globe className="w-3 h-3 text-subtle flex-shrink-0" aria-hidden="true" />
      ) : null}
      <span className="truncate">{label}</span>
    </a>
  );
}

function isBreaking(post: Post): boolean {
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  return ageMs < 90 * 60 * 1000 && post.credibility_score >= 80;
}

interface SwipeCardProps {
  post: Post;
  depth?: 0 | 1 | 2;
  interactive?: boolean;
  canRewind?: boolean;
  onSwipe?: (direction: SwipeDirection, post: Post) => void;
  onTap?: (post: Post) => void;
  onDragProgress?: (progress: { x: number; y: number }) => void;
}

const DEPTH_STYLES: Record<0 | 1 | 2, { scale: number; translateY: number; opacity: number; z: number }> = {
  0: { scale: 1,    translateY: 0,  opacity: 1,    z: 30 },
  1: { scale: 0.96, translateY: 10, opacity: 0.7,  z: 20 },
  2: { scale: 0.92, translateY: 20, opacity: 0.4,  z: 10 },
};

export function SwipeCard({
  post,
  depth = 0,
  interactive = false,
  canRewind = true,
  onSwipe,
  onTap,
  onDragProgress,
}: SwipeCardProps) {
  const theme = getCategoryTheme(post.category);

  const bullets = summaryToBullets(post.summary, 2);
  const topSources = (post.sources ?? []).slice(0, 3);
  const sourcesTotal = post.source_count ?? topSources.length;
  const extraSources = Math.max(0, sourcesTotal - topSources.length);
  const ageMs = Date.now() - new Date(post.published_at).getTime();
  const ageDot = ageDotClass(ageMs);
  const readMinutes = estimateReadMinutes(post.summary);
  const breaking = isBreaking(post);
  const flagsCount = post.fact_check_flags?.length ?? 0;
  const uniqueHostCount = new Set(
    (post.sources ?? []).map((s) => getHostname(s.url)).filter(Boolean),
  ).size;
  const sourcesNoun = uniqueHostCount > 1 && uniqueHostCount === sourcesTotal
    ? (sourcesTotal === 1 ? 'publication' : 'publications')
    : (sourcesTotal === 1 ? 'source' : 'sources');
  const style = DEPTH_STYLES[depth];

  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);
  const controls = useAnimation();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!interactive) {
      setExiting(false);
      x.set(0);
      y.set(0);
      controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      return;
    }
    const unsubX = x.on('change', (xv) => onDragProgress?.({ x: xv, y: y.get() }));
    const unsubY = y.on('change', (yv) => onDragProgress?.({ x: x.get(), y: yv }));
    return () => { unsubX(); unsubY(); };
  }, [interactive, onDragProgress, x, y, controls]);

  const handleDragEnd = async (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    let dir = decideDirection(info);
    if ((dir === 'down' || dir === 'left') && !canRewind) dir = null;
    if (!dir || !interactive) {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 360, damping: 32 } });
      onDragProgress?.({ x: 0, y: 0 });
      return;
    }


    haptic(dir === 'right' ? [8, 40, 8] : 10);

    setExiting(true);
    const target =
      dir === 'up'    ? { y: -window.innerHeight, opacity: 0 } :
      dir === 'down'  ? { y:  window.innerHeight, opacity: 0 } :
      dir === 'left'  ? { x: -window.innerWidth,  opacity: 0, rotate: -18 } :
                        { x:  window.innerWidth,  opacity: 0, rotate:  18 };
    await controls.start(target, { duration: reducedMotion ? 0 : 0.28, ease: [0.4, 0, 1, 1] });
    onSwipe?.(dir, post);
  };

  const wrapperStyle = interactive
    ? {
        zIndex: style.z,
        transformOrigin: 'top center' as const,
      }
    : {
        zIndex: style.z,
        transform: `translateY(${style.translateY}px) scale(${style.scale})`,
        opacity: style.opacity,
        transformOrigin: 'top center' as const,
        transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease',
        pointerEvents: 'none' as const,
      };

  return (
    <motion.div
      className="w-full touch-none select-none"
      style={interactive ? { ...wrapperStyle, x, y, rotate } : wrapperStyle}
      animate={interactive ? controls : undefined}
      drag={interactive && !exiting}
      dragElastic={0.65}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      aria-hidden={depth !== 0}
      data-swipe-depth={depth}
    >
      <article
        className="relative w-full premium-card overflow-hidden"
        role="article"
        aria-labelledby={`swipe-card-headline-${post.id}`}
      >
        <div
          className={`p-5 ${interactive ? 'cursor-pointer' : ''}`}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? `Read article: ${post.headline}` : undefined}
          onClick={(e) => {
            if (!interactive) return;
            if ((e.target as HTMLElement).closest('[data-swipe-actions]')) return;
            if (Math.abs(x.get()) > 6 || Math.abs(y.get()) > 6) return;
            haptic(6);
            onTap?.(post);
          }}
          onKeyDown={(e) => {
            if (!interactive) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTap?.(post);
            }
          }}
        >

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              {theme.label}
            </span>

            {breaking && (
              <span
                className="label-tag bg-accent text-paper border-accent"
                suppressHydrationWarning
              >
                <span className="w-1.5 h-1.5 rounded-full bg-paper animate-pulse" />
                Live
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted font-medium">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${ageDot}`}
                aria-hidden="true"
                suppressHydrationWarning
              />
              <span suppressHydrationWarning>{formatTimeAgo(post.published_at)}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] text-muted font-medium">
              <BookOpen className="w-2.5 h-2.5" aria-hidden="true" />
              <span className="tabular-nums">{readMinutes}</span>
              <span>min</span>
            </span>
          </div>


          <h2
            id={`swipe-card-headline-${post.id}`}
            className="font-display text-[22px] sm:text-[24px] font-bold leading-[1.18] tracking-tight text-ink mb-4"
          >
            {post.headline}
          </h2>


          {bullets.length > 0 && (
            <ul className="space-y-2 mb-4">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-[1.5] text-ink/90">
                  <span
                    aria-hidden="true"
                    className="mt-[7px] inline-block w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}


          {flagsCount > 0 && (
            <div className="mb-3 inline-flex items-start gap-2 px-2.5 py-1.5 bg-paper-2 border border-rule rounded text-[11px] text-muted">
              <AlertTriangle className="w-3 h-3 text-accent mt-[1px] flex-shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">{flagsCount}</span>{' '}
                fact-check {flagsCount === 1 ? 'flag' : 'flags'}
              </span>
            </div>
          )}


          {topSources.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-4">
              {topSources.map((src, i) => (
                <SourceChip key={src.url || i} source={src} />
              ))}
              {extraSources > 0 && (
                <span className="text-[10px] text-muted font-medium">
                  +{extraSources} more
                </span>
              )}
            </div>
          )}


          <div className="pt-3 border-t border-rule">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="flex-1 min-w-0">
                <CredibilityBar score={post.credibility_score} compact />
              </div>
              {sourcesTotal > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted flex-shrink-0"
                  aria-label={`Verified by ${sourcesTotal} ${sourcesNoun}`}
                  title={`Verified by ${sourcesTotal} ${sourcesNoun}`}
                >
                  <ShieldCheck className="w-3 h-3 text-cred-high" aria-hidden="true" />
                  <span className="tabular-nums text-ink">{sourcesTotal}</span>
                  <span>{sourcesNoun}</span>
                </span>
              )}
            </div>

            <div
              data-swipe-actions="true"
              className="relative z-20 flex items-center justify-between gap-2"
              onPointerDownCapture={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
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
                  className="group relative p-1.5 -m-1 rounded text-subtle hover:text-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-ink px-2 py-1 text-[10px] font-semibold text-paper opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100 scale-95 group-hover:scale-100 z-50 shadow-paper-lift">
                    Share WhatsApp
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
                  </span>
                </a>
                <BookmarkButton postId={post.id} variant="icon" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
