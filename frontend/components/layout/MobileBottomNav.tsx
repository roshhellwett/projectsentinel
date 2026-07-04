'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Home, Search, LayoutGrid, Bookmark, Layers } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants/categories';
import { OPEN_SEARCH_EVENT } from '@/components/ui/KeyboardShortcuts';
import { lockBodyScroll, unlockBodyScroll, subscribeBodyScrollLock, isBodyScrollLocked } from '@/lib/utils/bodyScrollLock';
import { cn } from '@/lib/utils/cn';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useDailyReadCount } from '@/lib/hooks/useDailyReadCount';
import { StreakBadge } from '@/components/ui/StreakBadge';

const TABS = [
  { id: 'home', href: '/', icon: Home, label: 'Home' },
  { id: 'swipe', href: '/swipe/', icon: Layers, label: 'Swipe' },
  { id: 'search', href: null, icon: Search, label: 'Search' },
  { id: 'topics', href: null, icon: LayoutGrid, label: 'Topics' },
  { id: 'saved', href: '/saved/', icon: Bookmark, label: 'Saved' },
] as const;

export function MobileBottomNav() {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { streak } = useDailyReadCount();
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  const closeTopics = useCallback(() => setTopicsOpen(false), []);
  const toggleTopics = useCallback(() => setTopicsOpen((v) => !v), []);

  useEffect(() => {
    if (!topicsOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [topicsOpen]);

  useEffect(() => {
    setScrollLocked(isBodyScrollLocked());
    return subscribeBodyScrollLock(setScrollLocked);
  }, []);

  const hideForOverlay = scrollLocked && !topicsOpen;

  const isActive = (id: string, href: string | null) => {
    if (id === 'topics') return topicsOpen || pathname.startsWith('/category/');
    if (href === '/') return pathname === '/';
    if (href) return pathname.startsWith(href);
    return false;
  };

  return (
    <>

      <AnimatePresence>
        {topicsOpen && (
          <motion.div
            key="topics-sheet"
            id="mobile-topics-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`md:hidden fixed inset-0 ${Z_INDEX.mobileNavOverlay}`}
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={closeTopics} />
            <motion.div
              key="topics-sheet-inner"
              initial={{ y: reducedMotion ? 0 : '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reducedMotion ? 0 : '100%', opacity: 0 }}
              transition={reducedMotion ? { duration: 0.18 } : { type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }}
              className="absolute left-3 right-3 rounded-2xl overflow-hidden bg-paper/95 backdrop-blur-xl border border-rule/60 shadow-card-lg will-change-transform transform-gpu"
              style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' }}
            >
            <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="p-4 pb-5">
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.18em] mb-3 px-1">
                Browse Topics
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const active = pathname === `/category/${cat.slug}/`;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}/`}
                      prefetch={true}
                      onClick={closeTopics}
                      className={`flex items-center justify-center px-3 py-3 rounded text-center text-[12px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        active
                          ? 'bg-ink text-paper border border-ink'
                          : 'bg-paper text-ink border border-rule hover:border-ink'
                      }`}
                    >
                      {cat.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={false}
        animate={{ y: hideForOverlay ? '100%' : '0%', opacity: hideForOverlay ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.8 }}
        className={`mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 ${Z_INDEX.mobileNav} will-change-transform will-change-opacity transform-gpu`}
        aria-hidden={hideForOverlay ? 'true' : 'false'}
        aria-label="Mobile navigation"
        style={{ pointerEvents: hideForOverlay ? 'none' : 'auto' }}
      >
        {streak > 0 && (
          <div className="absolute -top-11 right-3 z-20">
            <StreakBadge streak={streak} size="sm" className="shadow-card bg-paper backdrop-blur-md" />
          </div>
        )}
        <div
          className="relative border-t border-rule/40 bg-paper/80 backdrop-blur-xl backdrop-saturate-[1.3]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />
          <div className="flex items-center justify-around px-2 pt-1.5 pb-2">
            {TABS.map((tab) => {
              const active = isActive(tab.id, tab.href);
              const Icon = tab.icon;
              const isTopics = tab.id === 'topics';

              const inner = (
                <motion.div
                  whileTap={reducedMotion ? undefined : { scale: 0.84 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                  className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[52px]"
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute inset-x-1.5 bottom-1 top-1 rounded-xl bg-paper shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-rule/50"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`w-[22px] h-[22px] relative z-10 transition-colors duration-200 ${
                      active ? 'text-accent' : 'text-muted'
                    }`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span
                    className={`text-[10px] font-semibold relative z-10 transition-colors duration-200 leading-none ${
                      active ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              );

              if (isTopics) {
                return (
                  <button
                    key={tab.id}
                    onClick={toggleTopics}
                    className="touch-polish rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    aria-label="Browse topics"
                    aria-expanded={topicsOpen}
                    aria-controls="mobile-topics-sheet"
                  >
                    {inner}
                  </button>
                );
              }
              if (tab.id === 'search') {
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      closeTopics();
                      window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
                    }}
                    aria-label="Open search"
                    className="touch-polish rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    {inner}
                  </button>
                );
              }
              return (
                <Link
                  key={tab.id}
                  href={tab.href!}
                  prefetch={true}
                  onClick={closeTopics}
                  aria-label={tab.label}
                  className="touch-polish rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
