/**
 * Horizontal scrollable category pill tabs
 * Optimized: transition-colors only, Link components, proper tab semantics
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'politics', label: 'Politics' },
  { slug: 'business', label: 'Business' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'crime', label: 'Crime' },
  { slug: 'science', label: 'Science' },
  { slug: 'health', label: 'Health' },
  { slug: 'tech', label: 'Tech' },
  { slug: 'world', label: 'World' }
];

export function CategoryBar() {
  const pathname = usePathname();
  const currentCategory = pathname?.startsWith('/category/')
    ? pathname.split('/')[2]
    : 'all';

  return (
    <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide py-2" role="tablist" aria-label="News categories">
      <div className="flex gap-2 min-w-max p-1 bg-white rounded-full border border-slate-200 shadow-sm w-fit">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.slug;

          return (
            <Link
              key={cat.slug}
              href={cat.slug === 'all' ? '/' : `/category/${cat.slug}`}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300",
                isActive ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-slate-900 rounded-full shadow-md"
                  transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
