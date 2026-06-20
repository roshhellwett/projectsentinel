'use client';

import { useEffect, useState } from 'react';

interface LiveClockProps {
  variant?: 'navbar' | 'menu' | 'hero';
  className?: string;
}

const IST_TZ = 'Asia/Kolkata';

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  timeZone: IST_TZ,
});

const heroDateFmt = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: IST_TZ,
});

const timeFmt = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: IST_TZ,
});

function format(now: Date, longDate = false) {
  return {
    date: (longDate ? heroDateFmt : dateFmt).format(now),
    time: timeFmt.format(now),
  };
}

export function LiveClock({ variant = 'navbar', className = '' }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number;

    const tick = () => {
      const date = new Date();
      setNow(date);
      const msUntilNextSecond = 1000 - date.getMilliseconds();
      timeoutId = window.setTimeout(tick, msUntilNextSecond);
    };

    tick();
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!now) {
    if (variant === 'hero') {
      return <div aria-hidden="true" className={`h-[68px] w-[220px] bg-paper-2 border border-rule ${className}`} />;
    }
    return (
      <div
        aria-hidden="true"
        className={
          variant === 'menu'
            ? `h-9 w-full bg-paper-2 border border-rule ${className}`
            : `hidden 2xl:inline-flex h-7 w-[180px] bg-paper-2 border border-rule ${className}`
        }
      />
    );
  }

  const { date, time } = format(now, variant === 'hero');
  const isoLabel = now.toISOString();

  if (variant === 'menu') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 border border-rule bg-paper ${className}`}
        role="status"
        aria-label={`Current time ${time}, ${date}`}
      >
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" />
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            {date}
          </span>
          <time
            dateTime={isoLabel}
            className="text-[13px] font-semibold tabular-nums text-ink"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {time} IST
          </time>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={`relative inline-flex flex-col items-end gap-1 border border-rule bg-paper px-5 py-3 ${className}`}
        role="status"
        aria-live="off"
        aria-label={`Current time ${time}, ${date}`}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-accent" />
        <div className="flex items-center gap-2">
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
            Indian Standard Time
          </span>
        </div>
        <time
          dateTime={isoLabel}
          className="text-[26px] font-bold tabular-nums leading-none text-ink"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {time}
        </time>
        <span className="text-[11px] font-medium text-muted">
          {date}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`hidden 2xl:inline-flex items-center gap-2.5 px-3 py-1 border-l border-rule text-[12px] font-medium text-muted ${className}`}
      role="status"
      aria-live="off"
      aria-label={`Current time ${time}, ${date}`}
      title={`${date} · ${time}`}
    >
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-accent/55 animate-ping" />
      </span>
      <span className="text-[11.5px] font-medium text-muted">
        {date}
      </span>
      <span className="h-3 w-px bg-rule" aria-hidden="true" />
      <time
        dateTime={isoLabel}
        className="text-[12px] font-semibold tabular-nums text-ink"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {time}
      </time>
    </div>
  );
}
