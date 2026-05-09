'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { CATEGORIES } from '@/lib/constants/categories';

const ALL_CATEGORIES = [{ slug: 'all', label: 'All', emoji: '\uD83D\uDCF0' }, ...CATEGORIES];

export function CategoryBar() {
  const pathname = usePathname();
  const currentCategory: string = pathname?.startsWith('/category/')
    ? pathname.split('/')[2]
    : 'all';

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentCategory]);

  return (
    <div className="relative mb-8 -mx-4 px-4" role="tablist" aria-label="News categories">
      {/* Fade indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide py-2">
        <div className="flex gap-2 min-w-max p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm w-fit">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;

            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}`}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "relative px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1.5",
                  isActive 
                    ? "text-white" 
                    : "text-slate-600 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron hover:bg-india-saffron/5 dark:hover:bg-india-saffron/10"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-india-saffron to-saffron-dark rounded-xl shadow-saffron"
                    transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 text-xs">{cat.emoji}</span>
                <span className="relative z-10">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
