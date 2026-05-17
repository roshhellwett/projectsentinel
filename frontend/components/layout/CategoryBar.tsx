'use client';

// last edited 2026-05-17 by roshhellwett

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
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;






    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const offsetWithin =
      activeRect.left - containerRect.left + container.scrollLeft;
    const target = Math.max(
      0,
      offsetWithin - container.clientWidth / 2 + activeRect.width / 2,
    );



    if (Math.abs(container.scrollLeft - target) < 4) return;

    container.scrollTo({ left: target, behavior: 'smooth' });
  }, [currentCategory]);

  return (
    <nav
      className="relative -mx-4 px-4 border-y border-rule"
      role="tablist"
      aria-label="News categories"
    >
      {/* Edge fades to hint scrollability */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex items-stretch min-w-max">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}/`}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                className={`relative inline-flex items-center px-4 py-3 text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {cat.label}
                {isActive && (
                  <motion.span
                    layoutId="activeCategoryRule"
                    className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
