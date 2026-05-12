'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Home, Search, LayoutGrid, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants/categories';
import { OPEN_SEARCH_EVENT } from '@/components/ui/KeyboardShortcuts';

const TABS = [
  { id: 'home', href: '/', icon: Home, label: 'Home' },
  // `search` has no href — it dispatches OPEN_SEARCH_EVENT so the proper
  // SearchBar overlay (with auto-focused keyboard) appears instead of
  // navigating to a near-empty /search page.
  { id: 'search', href: null, icon: Search, label: 'Search' },
  { id: 'topics', href: null, icon: LayoutGrid, label: 'Topics' },
  { id: 'saved', href: '/saved/', icon: Bookmark, label: 'Saved' },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [topicsOpen, setTopicsOpen] = useState(false);

  const closeTopics = useCallback(() => setTopicsOpen(false), []);
  const toggleTopics = useCallback(() => setTopicsOpen((v) => !v), []);

  const isActive = (id: string, href: string | null) => {
    if (id === 'topics') return topicsOpen || pathname.startsWith('/category/');
    if (href === '/') return pathname === '/';
    if (href) return pathname.startsWith(href);
    return false;
  };

  return (
    <>
      {/* Topics sheet backdrop */}
      <AnimatePresence>
        {topicsOpen && (
          <motion.div
            key="topics-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[55]"
            onClick={closeTopics}
          />
        )}
      </AnimatePresence>

      {/* Topics category sheet */}
      <AnimatePresence>
        {topicsOpen && (
          <motion.div
            key="topics-sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="md:hidden fixed left-3 right-3 z-[56] rounded-3xl overflow-hidden bg-white/92 backdrop-blur-2xl border border-slate-950/[0.10] shadow-2xl"
            style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="p-4 pb-5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-3 px-1">
                Browse Topics
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const active = pathname === `/category/${cat.slug}/`;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}/`}
                      onClick={closeTopics}
                      className={`touch-polish flex items-center justify-center px-3 py-3.5 rounded-2xl text-center text-[12px] font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                        active
                          ? 'bg-accent text-white shadow-glow-accent'
                          : 'bg-white/70 text-slate-700 border border-slate-950/[0.08] hover:bg-white hover:text-slate-950'
                      }`}
                    >
                      {cat.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[57]" aria-label="Mobile navigation">
        <div
          className="relative border-t border-slate-950/[0.08] bg-white/82 backdrop-blur-2xl shadow-[0_-18px_55px_-42px_rgba(15,23,42,0.24)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around px-2 pt-1.5 pb-2">
            {TABS.map((tab) => {
              const active = isActive(tab.id, tab.href);
              const Icon = tab.icon;
              const isTopics = tab.id === 'topics';

              const inner = (
                <motion.div
                  whileTap={{ scale: 0.84 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                  className="relative flex flex-col items-center gap-1 px-5 py-2 rounded-2xl min-w-[56px]"
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute inset-0 rounded-2xl bg-slate-950/[0.045] border border-slate-950/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`w-[22px] h-[22px] relative z-10 transition-colors duration-200 ${
                      active ? 'text-accent' : 'text-slate-500'
                    }`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span
                    className={`text-[10px] font-semibold relative z-10 transition-colors duration-200 leading-none ${
                      active ? 'text-accent' : 'text-slate-500'
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
      </nav>
    </>
  );
}
