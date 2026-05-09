'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants/categories';

const ALL_CATEGORIES = [{ slug: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }))];

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
    <div className="relative -mx-4 px-4" role="tablist" aria-label="News categories">
      {/* Edge fade indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide py-2 -my-2">
        <div className="flex items-center gap-2 min-w-max">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}`}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                className="relative isolate"
              >
                <span
                  className={`relative z-10 inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 -z-10 rounded-full bg-accent shadow-glow-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {!isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.04] border border-white/[0.08]"
                    />
                  )}
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
