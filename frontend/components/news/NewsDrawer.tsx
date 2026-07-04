'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion, useDragControls, useMotionValue } from 'framer-motion';
import { Post } from '@/types';
import { CategoryTag } from './CategoryTag';
import { DrawerHeader } from './DrawerHeader';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { formatDate } from '@/lib/utils/formatDate';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { Z_INDEX } from '@/lib/theme/zIndex';

interface NewsDrawerProps {
  post: Post | null;
  onClose: () => void;
  onSelectRelated?: (post: Post) => void;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

export function NewsDrawer({ post, onClose, onSelectRelated }: NewsDrawerProps) {
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
    if (!isOpen) return;
    const t = window.setTimeout(() => drawerRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [postId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    lockBodyScroll();
    document.body.classList.add('article-overlay-open');
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onCloseRef.current();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('article-overlay-open');
      unlockBodyScroll();
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusableElements = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      // Filter out hidden elements
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
            className={`fixed inset-0 bg-ink/20 backdrop-filter backdrop-blur-md ${Z_INDEX.modalBackdrop} will-change-opacity`}
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
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
            dragElastic={{ top: 0, bottom: 0.3 }}
            style={{ y }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) {
                onClose();
              } else {
                y.set(0);
              }
            }}
            className={`fixed ${Z_INDEX.drawerPanel} bg-paper border-l border-rule shadow-paper-lift lg:left-auto lg:right-0 lg:top-0 lg:h-[100dvh] lg:max-h-none lg:w-[min(520px,38vw)] 2xl:w-[min(540px,30vw)] top-auto bottom-0 left-0 right-0 h-[85dvh] max-h-[calc(100dvh-5rem)] rounded-t-xl lg:rounded-none overflow-hidden flex flex-col will-change-transform transform-gpu`}
            initial={{ opacity: 0, y: canDrag ? '100%' : 0, x: canDrag ? 0 : '100%' }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: canDrag ? '100%' : 0, x: canDrag ? 0 : '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.8 }}
          >

            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent lg:h-full lg:w-[2px] lg:left-0 lg:right-auto lg:top-0 lg:bottom-0 lg:bg-gradient-to-b" />

            <div
              className="lg:hidden flex-shrink-0 flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-rule-strong" />
            </div>

            <DrawerHeader 
              category={post.category} 
              publishedAt={post.published_at} 
              onClose={onClose} 
            />

            <DrawerContent 
              post={post} 
              onSelectRelated={onSelectRelated} 
            />

            <DrawerFooter 
              post={post} 
              siteUrl={siteUrl} 
            />

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
