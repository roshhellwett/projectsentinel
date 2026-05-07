/**
 * Slide-in drawer for full article view
 * Fixed: smooth transitions, focus trap, proper dialog semantics
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { CredibilityBadge } from './CredibilityBadge';
import { SourceLinks } from './SourceLinks';
import { CorrectionsNotice } from './CorrectionsNotice';
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

export function NewsDrawer({ post, onClose }: NewsDrawerProps) {
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
          <motion.div
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Article: ${post.headline}`}
            tabIndex={-1}
            onKeyDown={handleTabKey}
            key={post.id}
            className="fixed z-50 bg-white border-l border-slate-200 shadow-2xl lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:w-[500px] bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl lg:rounded-none overflow-hidden flex flex-col"
            initial={{ opacity: 0, x: 32, y: 24 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <CategoryTag category={post.category} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Close article"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 ${post.status === 'retracted' ? 'opacity-50' : ''}`}>
              {post.status === 'corrected' && (
                <CorrectionsNotice type="corrected" note={post.correction_note} />
              )}
              {post.status === 'retracted' && (
                <CorrectionsNotice type="retracted" note={post.correction_note} />
              )}

              <h2 className="text-2xl font-semibold text-slate-950 mb-4 leading-snug">
                {post.headline}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <CredibilityBadge score={post.credibility_score} showTooltip />
                <span className="text-slate-500">{post.source_count} sources</span>
                <span className="text-slate-500">{formatDate(post.published_at)}</span>
              </div>

              <div className="mb-8">
                <p className="text-slate-700 leading-relaxed text-base">
                  {post.summary}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-950 mb-2">
                  Why this score?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {post.credibility_reason}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-950 mb-3">
                  Original Sources
                </h3>
                <SourceLinks sources={post.sources} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
