'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            className="fixed z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:w-[520px] bottom-0 left-0 right-0 h-[88vh] rounded-t-3xl lg:rounded-none overflow-hidden flex flex-col"
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 30, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            {/* Saffron accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-india-saffron via-accent to-india-green lg:h-full lg:w-[2px] lg:left-0 lg:right-auto lg:top-0 lg:bottom-0 lg:bg-gradient-to-b" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <CategoryTag category={post.category} />
                <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(post.published_at)}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-india-saffron/50"
                aria-label="Close article"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto p-6 ${post.status === 'retracted' ? 'opacity-50' : ''}`}>
              {post.status === 'corrected' && (
                <CorrectionsNotice type="corrected" note={post.correction_note} />
              )}
              {post.status === 'retracted' && (
                <CorrectionsNotice type="retracted" note={post.correction_note} />
              )}

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 leading-snug">
                {post.headline}
              </h2>

              {/* Score + sources row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <CredibilityBadge score={post.credibility_score} showTooltip />
                <span className="text-sm text-slate-500 dark:text-slate-400">{post.source_count} sources</span>
                <ShareButtons headline={post.headline} url={`${siteUrl}/news/${post.id}`} />
              </div>

              {/* Summary */}
              <div className="mb-8">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                  {post.summary}
                </p>
              </div>

              {/* Credibility Reasoning */}
              <div className="bg-saffron-light/50 dark:bg-india-saffron/5 rounded-2xl p-5 mb-6 border border-india-saffron/10 dark:border-india-saffron/10">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-india-saffron" />
                  Why this score?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {post.credibility_reason}
                </p>
              </div>

              {/* Sources */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-india-saffron" />
                  Original Sources
                </h3>
                <SourceLinks sources={post.sources} />
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => { onClose(); router.push(`/news/${post.id}`); }}
                className="block w-full text-center py-3 px-4 bg-gradient-to-r from-india-saffron to-saffron-dark hover:from-saffron-dark hover:to-india-saffron text-white font-semibold rounded-xl transition-all duration-300 shadow-saffron hover:shadow-saffron-lg text-sm"
              >
                Read Full Article →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
