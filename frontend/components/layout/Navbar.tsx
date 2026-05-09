'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Moon, Sun } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ui/ThemeProvider';

const NAV_LINKS = [
  { href: '/category/politics', label: 'Politics' },
  { href: '/category/business', label: 'Business' },
  { href: '/category/sports', label: 'Sports' },
  { href: '/category/tech', label: 'Tech' },
  { href: '/how-it-works', label: 'How It Works' }
];

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-3'}`}
    >
      <div className="container mx-auto px-4">
        <div className={`relative flex items-center justify-between transition-all duration-500 rounded-2xl border ${
          scrolled 
            ? 'bg-white/70 backdrop-blur-xl border-slate-200/60 dark:bg-slate-900/70 dark:border-slate-700/60 shadow-lg shadow-black/[0.03] px-5 h-14' 
            : 'bg-white/40 backdrop-blur-sm border-transparent px-3 h-16'
        }`}>
          {/* Saffron accent line on top when scrolled */}
          {scrolled && (
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-india-saffron/60 to-transparent rounded-full" />
          )}

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity z-10 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-india-saffron via-orange-500 to-saffron-dark flex items-center justify-center shadow-saffron group-hover:shadow-saffron-lg transition-shadow duration-300">
              <span className="text-white font-extrabold text-base leading-none tracking-tight">IV</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                India <span className="text-india-saffron">Verified</span>
              </span>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-widest uppercase leading-none hidden sm:block">
                AI-Verified News
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-0.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-india-saffron dark:hover:text-india-saffron hover:bg-india-saffron/5 dark:hover:bg-india-saffron/10 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 z-10">
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron hover:bg-india-saffron/5 dark:hover:bg-india-saffron/10 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-india-saffron/50"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <button
              onClick={openSearch}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron hover:bg-india-saffron/5 dark:hover:bg-india-saffron/10 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-india-saffron/50"
              aria-label="Search articles"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron hover:bg-india-saffron/5 dark:hover:bg-india-saffron/10 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-india-saffron/50"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-[18px] h-[18px]" />
              ) : (
                <Menu className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with Backdrop */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="md:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-india-saffron via-accent to-india-green" />
                <nav className="flex flex-col p-3 pt-4">
                  {NAV_LINKS.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className="block py-3 px-4 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-india-saffron dark:hover:text-india-saffron hover:bg-india-saffron/5 rounded-xl transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <SearchBar
        isOpen={isSearchOpen}
        onClose={closeSearch}
      />
    </motion.header>
  );
}
