'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useState } from 'react';

interface LiveClockProps {
  variant?: 'navbar' | 'menu';
  className?: string;
}

function format(now: Date) {
  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(now);

  const time = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  return { date, time };
}

export function LiveClock({ variant = 'navbar', className = '' }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div
        aria-hidden="true"
        className={
          variant === 'menu'
            ? `h-9 w-full rounded-xl bg-slate-950/[0.04] ${className}`
            : `hidden lg:inline-flex h-8 w-[210px] rounded-full bg-slate-950/[0.04] ${className}`
        }
      />
    );
  }

  const { date, time } = format(now);
  const isoLabel = now.toISOString();

  if (variant === 'menu') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-950/[0.08] bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${className}`}
        role="status"
        aria-label={`Current time ${time}, ${date}`}
      >
        <span className="relative inline-flex w-2 h-2 rounded-full bg-accent flex-shrink-0" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" />
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {date}
          </span>
          <time
            dateTime={isoLabel}
            className="text-[13px] font-semibold tabular-nums text-slate-950"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {time} IST
          </time>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hidden lg:inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-slate-950/[0.10] bg-white/72 backdrop-blur-md text-[12px] font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-white hover:border-slate-950/[0.18] transition-colors duration-200 ${className}`}
      role="status"
      aria-live="off"
      aria-label={`Current time ${time}, ${date}`}
      title={`${date} · ${time}`}
    >
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" />
      </span>
      <span className="text-[11.5px] font-semibold tracking-normal text-slate-700">
        {date}
      </span>
      <span className="h-3 w-px bg-slate-950/15" aria-hidden="true" />
      <time
        dateTime={isoLabel}
        className="text-[12px] font-semibold tabular-nums text-slate-950"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        {time}
      </time>
    </div>
  );
}
