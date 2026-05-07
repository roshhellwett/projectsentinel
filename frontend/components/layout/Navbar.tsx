/**
 * Top navigation bar with logo, category links, and search
 * Optimized: Link components, mobile menu animation, aria attributes
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { motion, useScroll } from 'framer-motion';

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
  
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 20);
    });
  }, [scrollY]);

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
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}
    >
      <div className="container mx-auto px-4">
        <div className={`relative flex items-center justify-between transition-all duration-300 rounded-2xl border ${scrolled ? 'bg-white/80 backdrop-blur-lg border-slate-200 shadow-sm px-6 h-14' : 'bg-transparent border-transparent px-2 h-16'}`}>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-india-saffron to-accent flex items-center justify-center shadow-md shadow-accent/20">
              <span className="text-white font-bold text-lg leading-none">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sentinel
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={openSearch}
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Search articles"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-full left-4 right-4 mt-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl
            ${isMobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0 border-transparent'}
          `}
        >
          <nav className="flex flex-col px-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <SearchBar
        isOpen={isSearchOpen}
        onClose={closeSearch}
      />
    </motion.header>
  );
}
