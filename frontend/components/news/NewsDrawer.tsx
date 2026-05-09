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
import { formatDate } from '@/lib/utils/formatDate';

interface NewsDrawerProps {
  post: Post | null;
  onClose: () => void;
}

let overflowCount = 0;

function lockBody() {
  overflowCount++;
  document.body.style.overflow = 'hidden';
}

function unlockBody() {
  overflowCount--;
  if (overflowCount <= 0) {
    overflowCount = 0;
    document.body.style.overflow = '';
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

export function NewsDrawer({ post, onClose }: NewsDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  useEffect(() => {
    if (!post) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    lockBody();
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      unlockBody();
      previousFocusRef.current?.focus();
    };
  }, [post]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (post) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [post, onClose]);

  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusable = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
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
            className="fixed z-50 bg-[#0a0a0a] border-l border-white/[0.08] shadow-2xl lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:w-[520px] bottom-0 left-0 right-0 h-[92vh] rounded-t-[28px] lg:rounded-none overflow-hidden flex flex-col"
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
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryTag category={post.category} />
                <span className="text-xs text-zinc-500 truncate">{formatDate(post.published_at)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/60 flex-shrink-0"
                aria-label="Close article"
              >
                <X className="w-5 h-5 text-zinc-400" />
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

              <h2 className="text-2xl font-bold text-white tracking-tight mb-5 leading-snug">
                {post.headline}
              </h2>

              {/* Score + sources row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <CredibilityBadge score={post.credibility_score} showTooltip />
                <span className="text-sm text-zinc-500">{post.source_count} sources</span>
                <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}`} />
              </div>

              {/* Summary */}
              <div className="mb-8">
                <p className="text-zinc-300 leading-relaxed text-base">
                  {post.summary}
                </p>
              </div>

              {/* Credibility Reasoning */}
              <div className="bg-accent/[0.06] rounded-2xl p-5 mb-6 border border-accent/[0.18]">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Why this score?
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {post.credibility_reason}
                </p>
              </div>

              {/* Sources */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-accent" />
                  Original Sources
                </h3>
                <SourceLinks sources={post.sources} />
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex-shrink-0 p-4 border-t border-white/[0.06] bg-white/[0.02]"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); router.push(`/news/${post.id}`); }}
                className="block w-full text-center py-3.5 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-2xl transition-all duration-300 shadow-glow-accent hover:shadow-glow-accent-lg text-sm"
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
