'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Github, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/category/politics', label: 'Politics' },
  { href: '/category/business', label: 'Business' },
  { href: '/category/sports', label: 'Sports' },
  { href: '/category/tech', label: 'Tech' },
  { href: '/how-it-works', label: 'How It Works' },
] as const;

const REPO_URL = 'https://github.com/roshhellwett/projectsentinel';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Close drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

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
              ? 'bg-[rgba(10,10,10,0.75)] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
              : 'bg-[rgba(10,10,10,0.4)] backdrop-blur-md border-b border-transparent'
          }`}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-16 lg:h-[68px]">
              {/* Logo */}
              <Link
                href="/"
                aria-label="India Verified — home"
                className="flex items-center gap-2.5 group focus:outline-none"
              >
                <div className="relative w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center shadow-inner shadow-white/5 group-hover:border-accent/50 group-hover:shadow-glow-accent transition-all duration-300">
                  <span className="text-[13px] font-black text-white tracking-tight leading-none">IV</span>
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-white leading-none hidden sm:block">
                  India Verified
                </span>
              </Link>

              {/* Desktop Nav */}
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
                      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        active ? 'text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <motion.span
                          layoutId="navbar-active-dot"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={openSearch}
                  aria-label="Search articles"
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors duration-200"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>

                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.18] text-[13px] font-medium text-white transition-all duration-200"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setIsMobileOpen((v) => !v)}
                  aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMobileOpen}
                  className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors duration-200"
                >
                  {isMobileOpen ? <X className="w-[20px] h-[20px]" /> : <Menu className="w-[20px] h-[20px]" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer to offset fixed navbar */}
      <div className="h-16 lg:h-[68px] flex-shrink-0" aria-hidden="true" />

      {/* Mobile sliding drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              key="nav-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-[61] w-[78%] max-w-sm bg-[#0a0a0a] border-l border-white/[0.08] shadow-2xl flex flex-col"
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
                <span className="text-sm font-semibold text-white">Menu</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
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
                        className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                          active
                            ? 'bg-accent/15 text-white border border-accent/30'
                            : 'text-zinc-300 hover:bg-white/[0.05] border border-transparent'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              <div className="p-5 border-t border-white/[0.06]">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-sm font-medium text-white transition-all"
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
