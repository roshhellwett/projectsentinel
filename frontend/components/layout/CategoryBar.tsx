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
    <div className="relative -mx-4 px-4" role="tablist" aria-label="News categories">

      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide py-2 -my-2">
        <div className="flex items-center gap-2 min-w-max rounded-full border border-slate-950/[0.08] bg-white/70 p-1.5 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}/`}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                className="touch-polish relative isolate group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <span
                  className={`relative z-10 inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'text-slate-950'
                      : 'text-slate-500 group-hover:text-slate-950'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 -z-10 rounded-full bg-white border border-slate-950/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-18px_rgba(139,127,240,0.55)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                    />
                  )}
                  {!isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-transparent group-hover:bg-slate-950/[0.04] group-hover:border group-hover:border-slate-950/[0.08] transition-colors duration-200"
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
