'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => {
    setIsScrolled(v > 20);
  });

  const navbarBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(250, 250, 250, 0)', 'rgba(250, 250, 250, 0.8)']
  );

  const navbarBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(20px)']
  );

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return (
    <>
      <motion.nav
        style={{
          backgroundColor: navbarBg,
          backdropFilter: navbarBlur,
          WebkitBackdropFilter: navbarBlur,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[border-color,box-shadow] duration-500 ${
          isScrolled ? 'border-b border-slate-200/60 shadow-sm' : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-900/20"
              >
                <span className="text-white text-sm font-black tracking-wider">IV</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">India Verified</h1>
                <p className="text-xs text-slate-500 font-medium">AI-Verified News</p>
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openSearch}
                className="p-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-slate-200/60 hover:bg-white transition-colors shadow-sm"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-slate-700" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <SearchBar isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
