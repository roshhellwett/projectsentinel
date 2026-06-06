'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

interface TickerItem {
  id: string;
  headline: string;
  category?: string;
}

const REFRESH_MS = 2 * 60 * 1000;

export function BreakingTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/posts?page=1&limit=8', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const trimmed: TickerItem[] = (data?.posts ?? [])
          .slice(0, 8)
          .map((p: { id: string; headline: string; category?: string }) => ({
            id: p.id,
            headline: p.headline,
            category: p.category,
          }));
        setItems(trimmed);
      } catch {
        /* the rail is non-critical — fail silent */
      }
    }

    load();
    const t = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  if (items.length === 0) {

    return <div aria-hidden="true" className="h-7 border-b border-rule bg-paper" />;
  }

  const loop = [...items, ...items];

  return (
    <div
      className="breaking-rail border-y border-ink/10 flex items-stretch h-7"
      aria-label="Breaking news ticker"
      role="region"
    >
      <span className="breaking-rail__label inline-flex items-center gap-1.5 flex-shrink-0">
        <Radio className="w-3 h-3" strokeWidth={2.4} />
        Breaking
      </span>
      <div className="breaking-rail__viewport flex items-center">
        <div className="breaking-rail__track">
          {loop.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href={`/news/${item.id}/`}
              className="inline-flex items-center gap-2 hover:underline underline-offset-4 decoration-paper/40 focus:outline-none focus-visible:underline"
            >
              {item.category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-paper/55">
                  {item.category}
                </span>
              )}
              <span className="text-paper/95">{item.headline}</span>
              <span className="text-paper/30" aria-hidden="true">·</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
