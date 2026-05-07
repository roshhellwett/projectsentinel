/**
 * Slide-in drawer for full article view
 * Fixed: smooth transitions, focus trap, proper dialog semantics
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
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
    if (post) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      lockBody();
      drawerRef.current?.focus();
    } else {
      unlockBody();
      previousFocusRef.current?.focus();
    }

    return () => {
      unlockBody();
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

  if (!post) return null;

  const isCorrected = post.status === 'corrected';
  const isRetracted = post.status === 'retracted';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Article: ${post.headline}`}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        key={post.id}
        className="fixed z-50 bg-surface border-l border-gray-800 lg:right-0 lg:top-0 lg:h-full lg:w-[480px] bottom-0 left-0 right-0 h-[85vh] rounded-t-xl lg:rounded-none overflow-hidden flex flex-col animate-slide-in-bottom lg:animate-slide-in-right"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <CategoryTag category={post.category} />
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close article"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 ${isRetracted ? 'opacity-50' : ''}`}>
          {isCorrected && (
            <CorrectionsNotice type="corrected" note={post.correction_note} />
          )}
          {isRetracted && (
            <CorrectionsNotice type="retracted" note={post.correction_note} />
          )}

          <h2 className="text-2xl font-medium text-white mb-4 leading-snug">
            {post.headline}
          </h2>

          <div className="flex items-center gap-4 mb-6 text-sm">
            <CredibilityBadge score={post.credibility_score} showTooltip />
            <span className="text-muted">{post.source_count} sources</span>
            <span className="text-muted">{formatDate(post.published_at)}</span>
          </div>

          <div className="mb-8">
            <p className="text-gray-300 leading-relaxed text-base">
              {post.summary}
            </p>
          </div>

          <div className="bg-surface-hover rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-white mb-2">
              Why this score?
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {post.credibility_reason}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3">
              Original Sources
            </h3>
            <SourceLinks sources={post.sources} />
          </div>
        </div>
      </div>
    </>
  );
}
