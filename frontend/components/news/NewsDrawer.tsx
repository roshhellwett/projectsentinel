'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion, animate } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { DrawerHeader } from './DrawerHeader';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { formatDate } from '@/lib/utils/formatDate';
import { lockBodyScroll, unlockBodyScroll, forceUnlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { IOS_SPRING } from '@/lib/theme/animations';

interface NewsDrawerProps {
  post: Post | null;
  onClose: () => void;
  onSelectRelated?: (post: Post) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithopensourceprojects.vercel.app';

export function NewsDrawer({ post, onClose, onSelectRelated, onNext, onPrev }: NewsDrawerProps) {
  const reducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const sync = () => setCanDrag(query.matches);
    sync();
    if (query.addEventListener) {
      query.addEventListener('change', sync);
      return () => query.removeEventListener('change', sync);
    } else if (query.addListener) {
      query.addListener(sync);
      return () => query.removeListener(sync);
    }
    return () => {};
  }, []);

  const isOpen = post !== null;
  const postId = post?.id;

  useEffect(() => {
    if (!isOpen) {
      forceUnlockBodyScroll();
      document.body.classList.remove('article-overlay-open');
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    lockBodyScroll();
    document.body.classList.add('article-overlay-open');
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.clearTimeout(focusTimer);
      document.body.classList.remove('article-overlay-open');
      unlockBodyScroll();
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen, postId]);

  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusableElements = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      return el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).visibility !== 'hidden';
    });

    if (focusableElements.length === 0) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {post && (
        <>
          <motion.div
            className={`fixed inset-0 bg-ink/60 dark:bg-black/70 backdrop-blur-sm ${Z_INDEX.modalBackdrop} transform-gpu`}
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2, ease: 'easeOut' }}
          />

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
            dragElastic={{ top: 0, bottom: 0.55 }}
            style={{ y, paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 600) {
                onClose();
              } else {
                animate(y, 0, IOS_SPRING.sheet);
              }
            }}
            className={`pointer-events-none fixed ${Z_INDEX.drawerPanel} bg-[#fcfaf7] dark:bg-[#121218] md:bg-white/85 md:dark:bg-black/85 md:backdrop-blur-[24px] border-l border-rule shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] lg:left-auto lg:right-0 lg:top-0 lg:h-dynamic lg:max-h-none lg:w-[min(520px,38vw)] 2xl:w-[min(540px,30vw)] top-0 bottom-0 left-0 right-0 h-dynamic max-h-none rounded-none overflow-hidden flex flex-col transform-gpu will-change-transform`}
            initial={{ opacity: 0, y: reducedMotion ? 0 : (canDrag ? '100%' : 0), x: reducedMotion ? 0 : (canDrag ? 0 : '100%') }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : (canDrag ? '100%' : 0), x: reducedMotion ? 0 : (canDrag ? 0 : '100%') }}
            transition={reducedMotion ? { duration: 0.15 } : IOS_SPRING.sheet}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent lg:h-full lg:w-[2px] lg:left-0 lg:right-auto lg:top-0 lg:bottom-0 lg:bg-gradient-to-b" />

            <div
              className="pointer-events-auto lg:hidden flex-shrink-0 flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-rule-strong" />
            </div>

            <DrawerHeader 
              category={post.category} 
              publishedAt={post.published_at} 
              onClose={onClose} 
              score={post.credibility_score}
              onNext={onNext}
              onPrev={onPrev}
            />

            <div className="pointer-events-auto min-h-0 flex-1 flex flex-col">
              <DrawerContent
                post={post}
                onSelectRelated={onSelectRelated}
              />
            </div>

            <div className="pointer-events-auto">
              <DrawerFooter
                post={post}
                siteUrl={siteUrl}
              />
            </div>
          </motion.div>

          <button
            type="button"
            onClick={onClose}
            style={{ zIndex: 9999 }}
            className="fixed right-4 top-4 tap-target min-w-[44px] min-h-[44px] p-2 bg-[#fcfaf7]/90 dark:bg-[#121218]/90 hover:bg-paper-2 rounded-xl border border-transparent hover:border-rule transition-[background-color,border-color,transform] duration-150 transform-gpu touch-action-manipulation select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center"
            aria-label="Close article"
          >
            <X className="w-5 h-5 text-muted hover:text-ink transition-colors" />
          </button>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
