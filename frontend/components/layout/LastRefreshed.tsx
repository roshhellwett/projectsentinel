'use client';

import { useEffect, useState } from 'react';
import { useLastFresh } from '@/lib/utils/freshSignal';

const STALE_AFTER_MS = 5 * 60 * 60 * 1000;

function relative(now: number, then: number): string {
  if (!then) return 'never';
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LastRefreshed() {
  const lastFresh = useLastFresh();
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => {
      setNow((prev) => {
        const current = Date.now();
        if (!lastFresh) return current;
        const diffPrev = Math.floor((prev - lastFresh) / 1000);
        const diffCurr = Math.floor((current - lastFresh) / 1000);
        if (diffPrev === diffCurr) return prev;
        if (diffPrev >= 60 && Math.floor(diffPrev / 60) === Math.floor(diffCurr / 60)) return prev;
        return current;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [lastFresh]);

  if (!now || !lastFresh) return null;

  const age = now - lastFresh;
  const stale = age >= STALE_AFTER_MS;
  const label = relative(now, lastFresh);

  if (stale) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 border border-rule/50 bg-paper/70 backdrop-blur-sm text-xs text-ink-soft"
      >
        <span className="font-body text-[10px] font-bold tracking-wider uppercase">Stale — {label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="off"
      className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 border border-rule/50 bg-paper/70 backdrop-blur-sm text-xs text-ink-soft"
    >
      <span className="font-body text-[10px] font-bold tracking-wider uppercase">Live · {label}</span>
    </div>
  );
}
