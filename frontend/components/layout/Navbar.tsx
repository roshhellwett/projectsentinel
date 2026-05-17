'use client';

// last edited 2026-05-17 by roshhellwett

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Github, Menu, X, Bookmark } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { OPEN_SEARCH_EVENT } from '@/components/ui/KeyboardShortcuts';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/category/politics/', label: 'Politics' },
  { href: '/category/business/', label: 'Business' },
  { href: '/category/sports/', label: 'Sports' },
  { href: '/category/tech/', label: 'Tech' },
  { href: '/saved/', label: 'Saved' },
  { href: '/how-it-works/', label: 'How It Works' },
] as const;

const REPO_URL = 'https://github.com/roshhellwett/projectsentinel';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));




  useEffect(() => {
    if (!isMobileOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
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
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed top-0 inset-x-0 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div
          className={`w-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/78 backdrop-blur-2xl border-b border-slate-950/[0.08] shadow-[0_18px_55px_-42px_rgba(15,23,42,0.28)]'
              : 'bg-white/58 backdrop-blur-xl border-b border-slate-950/[0.04]'
          }`}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-16 lg:h-[68px]">

              <Link
                href="/"
                aria-label="India Verified — home"
                className="touch-polish flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/30 rounded-2xl"
              >
                <div
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, #111111, #0a0a0a)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 24px -8px rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="text-[12px] font-light text-white/90 tracking-[0.15em] leading-none" style={{ letterSpacing: '0.15em' }}>IV</span>
                </div>
                <span className="hidden sm:flex flex-col leading-none">
                  <span className="text-[15px] font-semibold tracking-normal text-slate-950">India Verified</span>
                </span>
              </Link>


              <nav
                aria-label="Main navigation"
                className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
              >
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                        active ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-950/[0.035]'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <motion.span
                          layoutId="navbar-active-dot"
                          className="absolute inset-0 -z-10 rounded-full bg-white/80 border border-slate-950/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_30px_-20px_rgba(139,127,240,0.55)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>


              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={openSearch}
                  aria-label="Search articles"
                  className="touch-polish p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-950/[0.06] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={2} />
                </motion.button>

                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-polish hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-slate-950/[0.10] hover:border-slate-950/[0.18] text-[13px] font-medium text-slate-700 hover:text-slate-950 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_30px_-24px_rgba(139,127,240,0.55)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>


                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileOpen((v) => !v)}
                  aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMobileOpen}
                  className="touch-polish lg:hidden p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-950/[0.06] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  {isMobileOpen ? <X className="w-[20px] h-[20px]" /> : <Menu className="w-[20px] h-[20px]" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>


      <div
        className="h-16 lg:h-[68px] flex-shrink-0"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        aria-hidden="true"
      />


      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-[60] bg-slate-950/20 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              key="nav-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-[61] w-[78%] max-w-sm bg-white/92 backdrop-blur-2xl border-l border-slate-950/[0.10] shadow-2xl flex flex-col"
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-slate-950/[0.08]">
                <span className="text-sm font-semibold text-slate-950">Menu</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                  className="touch-polish p-2 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-950/[0.06] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`touch-polish block px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                          active
                            ? 'bg-slate-950/[0.055] text-slate-950 border border-slate-950/[0.10]'
                            : 'text-slate-600 hover:bg-slate-950/[0.04] border border-transparent'
                        }`}
                      >
                        {link.label === 'Saved' ? (
                          <span className="inline-flex items-center gap-2">
                            <Bookmark className="w-3.5 h-3.5" />
                            {link.label}
                          </span>
                        ) : (
                          link.label
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              <div className="p-5 border-t border-slate-950/[0.08]">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-polish flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-950/[0.055] hover:bg-slate-950/[0.08] border border-slate-950/[0.10] text-sm font-medium text-slate-800 transition-all active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
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
