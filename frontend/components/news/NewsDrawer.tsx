'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion, useDragControls, useMotionValue } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { SourceLinks } from './SourceLinks';
import { CorrectionsNotice } from './CorrectionsNotice';
import { ShareButtons } from './ShareButtons';
import { BookmarkButton } from './BookmarkButton';
import { formatDate } from '@/lib/utils/formatDate';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

interface NewsDrawerProps {
  post: Post | null;
  onClose: () => void;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

export function NewsDrawer({ post, onClose }: NewsDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  useEffect(() => {
    if (!post) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    lockBodyScroll();
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      unlockBodyScroll();
      previousFocusRef.current?.focus();
    };
  }, [post]);

  useEffect(() => {
    if (!post) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [post]);

  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusable = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {post && (
        <>
          {/* Backdrop */}
          <motion.div
            // z-[60] — above the fixed Navbar (z-50) so the page chrome is
            // dimmed while reading and the drawer's close button is never
            // hidden behind the navbar's safe-area chrome on iOS.
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-md z-[60]"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Article: ${post.headline}`}
            tabIndex={-1}
            onKeyDown={handleTabKey}
            key={post.id}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            style={{ y }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) {
                onClose();
              } else {
                y.set(0);
              }
            }}
            className="fixed z-[65] bg-white/95 backdrop-blur-2xl border-l border-slate-950/[0.10] shadow-[0_30px_120px_-52px_rgba(15,23,42,0.46)] lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:w-[540px] bottom-0 left-0 right-0 h-[92vh] rounded-t-[28px] lg:rounded-none overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
          >
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent lg:h-full lg:w-[2px] lg:left-0 lg:right-auto lg:top-0 lg:bottom-0 lg:bg-gradient-to-b" />

            {/* Drag handle — mobile only */}
            <div
              className="lg:hidden flex-shrink-0 flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-slate-950/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-950/[0.08] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryTag category={post.category} />
                <span className="text-xs text-zinc-500 truncate">{formatDate(post.published_at)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="touch-polish p-2 hover:bg-slate-950/[0.06] active:bg-slate-950/[0.08] rounded-xl transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 flex-shrink-0"
                aria-label="Close article"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto overscroll-contain p-6 ${post.status === 'retracted' ? 'opacity-50' : ''}`}>
              {post.status === 'corrected' && (
                <CorrectionsNotice type="corrected" note={post.correction_note} />
              )}
              {post.status === 'retracted' && (
                <CorrectionsNotice type="retracted" note={post.correction_note} />
              )}

              <h2 className="text-3xl font-bold text-slate-950 tracking-tighter mb-5 leading-tight">
                {post.headline}
              </h2>

              {/* Score + sources row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <CredibilityBadge score={post.credibility_score} showTooltip />
                <span className="text-sm text-zinc-500">{post.source_count} sources</span>
                <BookmarkButton postId={post.id} variant="pill" stopPropagation={false} />
                <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}/`} />
              </div>

              {/* Summary */}
              <div className="mb-8">
                <p className="text-slate-600 leading-relaxed text-base">
                  {post.summary}
                </p>
              </div>

              {/* Credibility Reasoning */}
              <div className="premium-card rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-slate-950 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Why this score?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {post.credibility_reason}
                </p>
              </div>

              {/* Sources */}
              <div>
                <h3 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-accent" />
                  Original Sources
                </h3>
                <SourceLinks sources={post.sources} />
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex-shrink-0 p-4 border-t border-slate-950/[0.08] bg-white/75 backdrop-blur-2xl flex gap-3"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <motion.a
                whileTap={{ scale: 0.95 }}
                href={`https://wa.me/?text=${encodeURIComponent(`${post.headline} — ${siteUrl}/news/${post.id}/`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-polish flex items-center justify-center gap-2 px-4 py-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366]/50 text-[#25D366] font-semibold rounded-2xl transition-all duration-200 ease-smooth text-sm flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="hidden sm:inline">Share</span>
              </motion.a>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); router.push(`/news/${post.id}/`); }}
                className="touch-polish flex-1 text-center py-3.5 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-2xl transition-all duration-250 ease-smooth shadow-glow-accent hover:shadow-glow-accent-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Read Full Article →
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
