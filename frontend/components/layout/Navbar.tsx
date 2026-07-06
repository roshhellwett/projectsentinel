'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { Search, Github, Menu, X, Bookmark } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { LiveClock } from '@/components/layout/LiveClock';

const SearchBar = dynamic(() => import('@/components/ui/SearchBar').then(m => m.SearchBar), { ssr: false });
import { ConnectionStatus } from '@/components/layout/ConnectionStatus';
import { LastRefreshed } from '@/components/layout/LastRefreshed';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageFilter } from '@/components/layout/LanguageFilter';
import { InstallAppButton } from '@/components/layout/InstallAppButton';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { OPEN_SEARCH_EVENT } from '@/components/ui/KeyboardShortcuts';
import { useI18n } from '@/lib/i18n/i18n-shared';
import { useDailyReadCount } from '@/lib/hooks/useDailyReadCount';
import { StreakBadge } from '@/components/ui/StreakBadge';

const NAV_LINKS = [
  { href: '/category/politics/',   labelKey: 'nav.politics' },
  { href: '/category/business/',   labelKey: 'nav.business' },
  { href: '/category/sports/',     labelKey: 'nav.sports' },
  { href: '/category/tech/',       labelKey: 'nav.tech' },
  { href: '/category/world/',      labelKey: 'nav.world' },
  { href: '/saved/',               labelKey: 'nav.saved' },
  { href: '/how-it-works/',        labelKey: 'nav.how_it_works' },
] as const;

const REPO_URL = 'https://github.com/roshhellwett/projectsentinel';

export function Navbar() {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { t } = useI18n();
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
        className={`sticky top-0 inset-x-0 ${Z_INDEX.stickyNav} bg-[#fcfaf7]/98 dark:bg-[#121218]/98 md:bg-paper/70 md:supports-[backdrop-filter]:bg-paper/30 md:backdrop-filter md:backdrop-blur-2xl md:backdrop-saturate-[1.4] border-b border-rule/60 transition-colors shadow-sm transform-gpu select-none`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />

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
                className="flex items-center justify-center w-9 h-9 bg-ink text-paper font-display font-bold text-[15px] tracking-[0.06em] shadow-sm group-hover:scale-105 transition-transform duration-200"
              >
                IV
              </span>
              <span className="flex flex-col leading-none whitespace-nowrap">
                <span className="font-display text-[17px] sm:text-[19px] font-bold text-ink tracking-[-0.02em] group-hover:text-accent transition-colors">
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
                    className={`relative inline-flex items-center px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg ${
                      active ? 'text-ink bg-paper-2/80 shadow-xs' : 'text-muted hover:text-ink hover:bg-paper-2/40'
                    }`}
                  >
                    {link.labelKey === 'nav.saved' && (
                      <Bookmark className="w-3.5 h-3.5 mr-1.5 -ml-0.5" strokeWidth={1.8} />
                    )}
                    {t(link.labelKey)}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-3 right-3 -bottom-[1px] h-[2.5px] bg-accent rounded-full shadow-glow-sm"
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
              <LanguageFilter />

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
              <div className="hidden lg:block">
                <InstallAppButton />
              </div>

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
              transition={reducedMotion ? { duration: 0.18 } : { type: 'spring', stiffness: 450, damping: 28, mass: 0.7 }}
              className={`lg:hidden fixed top-0 right-0 bottom-0 ${Z_INDEX.drawerPanel} w-[82%] max-w-sm bg-[#fcfaf7] dark:bg-[#121218] border-l border-rule shadow-paper-lift flex flex-col transform-gpu overflow-x-hidden`}
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
                        {link.labelKey === 'nav.saved' && <Bookmark className="w-4 h-4" strokeWidth={1.8} />}
                        {t(link.labelKey)}
                      </span>
                      <span aria-hidden="true" className={`transition-transform ${active ? 'text-accent' : 'text-subtle'}`}>→</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-rule flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.12em]">{t('nav.sections')}</span>
                  <LanguageFilter />
                </div>
                <LiveClock variant="menu" />
                <div className="w-full flex justify-center">
                  <InstallAppButton />
                </div>
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
