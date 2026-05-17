// last edited 2026-05-17 by roshhellwett

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-[12px] text-slate-500 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-x-1.5 gap-y-1 min-w-0">
        <li className="flex items-center flex-shrink-0">
          <Link
            href="/"
            aria-label="Home"
            className="touch-polish inline-flex items-center justify-center w-6 h-6 rounded-full text-slate-500 hover:text-slate-950 hover:bg-slate-950/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <Home className="w-3 h-3" />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="touch-polish rounded px-1 py-0.5 text-slate-500 hover:text-slate-950 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`truncate px-1 py-0.5 ${isLast ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
