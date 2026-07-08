'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-shared';
import { CATEGORIES } from '@/lib/constants/categories';

const ALL_CATEGORIES = [{ slug: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }))];

export function CategoryBar() {
  const pathname = usePathname();
  const { t } = useI18n();
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

    requestAnimationFrame(() => {
      container.scrollTo({ left: target, behavior: 'smooth' });
    });
  }, [currentCategory]);

  return (
    <nav
      className="relative -mx-4 px-4 bg-paper border-b border-rule select-none"
      role="tablist"
      aria-label={t('category.aria_label')}
    >
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x overscroll-x-contain">
        <div className="flex items-stretch min-w-max">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}/`}
                prefetch={true}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                className={`relative flex items-center px-4 py-3 text-xs font-body whitespace-nowrap transition-colors snap-center min-h-[44px] ${
                  isActive ? 'text-ink border-b-2 border-ink' : 'text-muted hover:text-ink'
                }`}
              >
                  {cat.slug === 'all' ? t('nav.all') : t(`nav.${cat.slug}`)}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
