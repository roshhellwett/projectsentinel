'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now || !lastFresh) return null;

  const age = now - lastFresh;
  const stale = age >= STALE_AFTER_MS;
  const label = relative(now, lastFresh);

  if (stale) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={`Feed appears stale — last refreshed ${label}`}
        title={`Feed appears stale — last refreshed ${label}`}
        className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50/85 border border-red-300/60 text-[10px] font-semibold tracking-normal text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_28px_-20px_rgba(239,68,68,0.45)]"
      >
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-red-500/55 animate-ping" />
        </span>
        <AlertTriangle className="w-2.5 h-2.5 text-red-600" aria-hidden="true" />
        <span className="uppercase tracking-[0.16em] text-[9px] text-red-700">Stale</span>
        <span className="w-px h-3 bg-red-300/60" aria-hidden="true" />
        <span className="tabular-nums text-red-700" suppressHydrationWarning>{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="off"
      aria-label={`Feed last refreshed ${label}`}
      className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-slate-950/[0.08] text-[10px] font-semibold tracking-normal text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-emerald-500/55 animate-ping" />
      </span>
      <span className="uppercase tracking-[0.16em] text-[9px] text-slate-500">Live</span>
      <span className="w-px h-3 bg-slate-950/10" aria-hidden="true" />
      <span className="tabular-nums text-slate-700" suppressHydrationWarning>{label}</span>
    </div>
  );
}
