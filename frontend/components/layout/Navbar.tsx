'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { Search, Github, Menu, X, Bookmark } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';
import { LiveClock } from '@/components/layout/LiveClock';
import { ConnectionStatus } from '@/components/layout/ConnectionStatus';
import { LastRefreshed } from '@/components/layout/LastRefreshed';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { OPEN_SEARCH_EVENT } from '@/components/ui/KeyboardShortcuts';
import { useDailyReadCount } from '@/lib/hooks/useDailyReadCount';
import { StreakBadge } from '@/components/ui/StreakBadge';

const NAV_LINKS = [
  { href: '/category/politics/',   label: 'Politics' },
  { href: '/category/business/',   label: 'Business' },
  { href: '/category/sports/',     label: 'Sports' },
  { href: '/category/tech/',       label: 'Tech' },
  { href: '/category/world/',      label: 'World' },
  { href: '/saved/',               label: 'Saved' },
  { href: '/how-it-works/',        label: 'How It Works' },
] as const;

const REPO_URL = 'https://github.com/roshhellwett/projectsentinel';

export function Navbar() {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { streak } = useDailyReadCount();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;
    lockBodyScroll();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    const normalize = (p: string) => (p.endsWith('/') ? p.slice(0, -1) : p) || '/';
    const a = normalize(href);
    const b = normalize(pathname);
    if (a === '/') return b === '/';
    return b === a || b.startsWith(a + '/');
  };

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  useEffect(() => {
    const handler = () => setIsSearchOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, handler);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, handler);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 inset-x-0 ${Z_INDEX.stickyNav} bg-paper/85 supports-[backdrop-filter]:bg-paper/55 backdrop-filter backdrop-blur-xl backdrop-saturate-[1.3] border-b border-rule/60 transition-colors`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Premium gradient edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4 h-14 lg:h-16">
            <Link
              href="/"
              prefetch={true}
              aria-label="India Verified — home"
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-9 h-9 bg-ink text-paper font-display font-bold text-[15px] tracking-[0.06em]"
              >
                IV
              </span>
              <span className="flex flex-col leading-none whitespace-nowrap">
                <span className="font-display text-[17px] sm:text-[19px] font-bold text-ink tracking-[-0.02em]">
                  India Verified
                </span>
                <span className="hidden md:inline text-[10px] font-semibold tracking-[0.18em] uppercase text-accent mt-0.5">
                  AI-verified Indian news
                </span>
              </span>
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-1"
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex items-center px-3 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${
                      active ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {link.label === 'Saved' && (
                      <Bookmark className="w-3.5 h-3.5 mr-1.5 -ml-0.5" strokeWidth={1.8} />
                    )}
                    {link.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-accent rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <StreakBadge streak={streak} size="sm" className="hidden sm:inline-flex mr-1" />
              <LastRefreshed />
              <ConnectionStatus />

              <button
                type="button"
                onClick={openSearch}
                aria-label="Search articles (press /)"
                title="Search · press /"
                className="tap-target inline-flex items-center gap-1.5 px-2 text-muted hover:text-ink hover-lift rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <kbd
                  aria-hidden="true"
                  className="hidden xl:inline-flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-sm border border-rule-strong text-[9px] font-semibold text-muted"
                >
                  /
                </kbd>
              </button>

              <ThemeToggle />

              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Source code on GitHub"
                className="tap-target min-h-[36px] hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-muted hover:text-ink hover-lift rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>

              <button
                type="button"
                onClick={() => setIsMobileOpen((v) => !v)}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-nav-drawer"
                className="tap-target lg:hidden text-muted hover:text-ink hover-lift rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {isMobileOpen ? <X className="w-[20px] h-[20px]" /> : <Menu className="w-[20px] h-[20px]" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={`lg:hidden fixed inset-0 ${Z_INDEX.modalBackdrop} bg-ink/40 backdrop-blur-[2px]`}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              key="nav-drawer"
              id="mobile-nav-drawer"
              initial={{ x: reducedMotion ? 0 : '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reducedMotion ? 0 : '100%', opacity: 0 }}
              transition={reducedMotion ? { duration: 0.18 } : { type: 'spring', stiffness: 400, damping: 32, mass: 0.8 }}
              className={`lg:hidden fixed top-0 right-0 bottom-0 ${Z_INDEX.drawerPanel} w-[82%] max-w-sm bg-paper/95 backdrop-blur-xl border-l border-rule shadow-paper-lift flex flex-col will-change-transform transform-gpu`}
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-rule">
                <span className="editorial-kicker">
                  <span>Sections</span>
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                  className="tap-target text-muted hover:text-ink rounded transition-all hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-2 py-2">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between px-3 py-3.5 border-b border-rule font-display text-[17px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${
                        active ? 'text-accent' : 'text-ink hover:text-accent'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {link.label === 'Saved' && <Bookmark className="w-4 h-4" strokeWidth={1.8} />}
                        {link.label}
                      </span>
                      <span aria-hidden="true" className={`transition-transform ${active ? 'text-accent' : 'text-subtle'}`}>→</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-rule flex flex-col gap-3">
                <LiveClock variant="menu" />
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target min-h-[44px] flex items-center justify-center gap-2 w-full px-4 py-3 border border-rule-strong text-sm font-medium text-ink hover:bg-paper-2 transition-all hover-lift rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Github className="w-4 h-4" />
                  View source on GitHub
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchBar isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
