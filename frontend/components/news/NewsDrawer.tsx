'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion, useDragControls, useMotionValue } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBar } from './CredibilityBar';
import { SourceLinks } from './SourceLinks';
import { CorrectionsNotice } from './CorrectionsNotice';
import { ShareButtons } from './ShareButtons';
import { BookmarkButton } from './BookmarkButton';
import { SourcePickerButton } from './SourcePickerButton';
import { formatDate } from '@/lib/utils/formatDate';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

interface NewsDrawerProps {
  post: Post | null;
  onClose: () => void;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

export function NewsDrawer({ post, onClose }: NewsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const sync = () => setCanDrag(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!post) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    lockBodyScroll();
    document.body.classList.add('article-overlay-open');
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove('article-overlay-open');
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
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-[3px] z-[60]"
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
            drag={canDrag ? 'y' : false}
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
            className="fixed z-[65] bg-white/96 backdrop-blur-2xl border-l border-slate-950/[0.10] shadow-[0_30px_120px_-52px_rgba(15,23,42,0.42)] lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:w-[min(520px,38vw)] 2xl:w-[min(540px,30vw)] bottom-0 left-0 right-0 h-[88dvh] max-h-[calc(100dvh-4.5rem)] rounded-t-[28px] lg:rounded-none overflow-hidden flex flex-col"
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
            <div className="relative z-10 flex items-center justify-between gap-3 rounded-t-[28px] bg-white/90 px-5 py-3.5 border-b border-slate-950/[0.08] flex-shrink-0 sm:px-6 lg:rounded-none lg:px-7">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryTag category={post.category} />
                <span className="text-xs text-zinc-500 truncate">{formatDate(post.published_at)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="touch-polish p-2 hover:bg-slate-950/[0.06] active:bg-slate-950/[0.08] rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 flex-shrink-0"
                aria-label="Close article"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            {/* Content */}
            <div className={`article-drawer-scroll relative z-10 flex-1 overflow-y-auto overscroll-contain bg-white/95 px-5 pb-6 pt-5 sm:px-7 sm:pb-8 sm:pt-6 lg:px-8 ${post.status === 'retracted' ? 'opacity-50' : ''}`}>
              {post.status === 'corrected' && (
                <CorrectionsNotice type="corrected" note={post.correction_note} />
              )}
              {post.status === 'retracted' && (
                <CorrectionsNotice type="retracted" note={post.correction_note} />
              )}

              <h2 className="text-[26px] sm:text-3xl lg:text-[32px] 2xl:text-[34px] font-bold text-slate-950 tracking-normal mb-5 leading-tight">
                {post.headline}
              </h2>

              {/* Score + source count */}
              <div className="mb-6 rounded-2xl border border-slate-950/[0.10] bg-white/75 p-4 lg:p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <CredibilityBar score={post.credibility_score} />
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-950/[0.06] pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Verified Sources
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-600">
                    {post.source_count} {post.source_count === 1 ? 'source' : 'sources'}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-[16px] leading-8 text-slate-600">
                  {post.summary}
                </p>
              </div>

              {/* Credibility Reasoning */}
              <div className="rounded-2xl border border-slate-950/[0.06] bg-slate-50/70 p-5 mb-6 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.35)]">
                <h3 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Why this score?
                </h3>
                <p className="text-sm text-slate-600 leading-7">
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
            <div className="relative z-20 flex-shrink-0 border-t border-slate-950/[0.08] bg-white/96 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-[0_-14px_44px_-38px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:px-3.5 sm:pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pt-3.5 lg:px-4 lg:py-3 lg:shadow-[0_-10px_32px_-30px_rgba(15,23,42,0.36)]">
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] gap-2 lg:gap-2.5">
                <BookmarkButton
                  postId={post.id}
                  variant="pill"
                  stopPropagation={false}
                  className="w-full justify-center rounded-xl px-2.5 py-2.5 text-xs sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm lg:rounded-xl lg:py-2.5"
                />
                <ShareButtons
                  headline={post.headline}
                  url={`${siteUrl}/news/${post.id}/`}
                  placement="sheet"
                  buttonClassName="rounded-xl px-2.5 py-2.5 text-xs sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm lg:rounded-xl lg:py-2.5"
                />
                <SourcePickerButton
                  sources={post.sources}
                  placement="sheet"
                  label="Read Full"
                  stopPropagation={false}
                  buttonClassName="rounded-xl border-accent bg-accent px-2.5 py-2.5 text-xs text-white shadow-glow-accent hover:bg-accent-hover hover:text-white sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm lg:rounded-xl lg:py-2.5"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
