"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface LiveClockProps {
  variant?: "navbar" | "menu" | "hero";
  className?: string;
}

const IST_TZ = "Asia/Kolkata";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: IST_TZ,
});

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: IST_TZ,
});

function format(now: Date) {
  return {
    date: dateFmt.format(now),
    time: timeFmt.format(now),
  };
}

export function LiveClock({
  variant = "navbar",
  className = "",
}: LiveClockProps) {
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
    return (
      <div
        aria-hidden="true"
        className={`h-6 w-32 bg-paper-2 border border-rule ${className}`}
      />
    );
  }

  const { date, time } = format(now);
  const isoLabel = now.toISOString();

  if (variant === "menu") {
    return (
      <div
        className={`flex items-center gap-2 px-4 py-3 border border-rule/50 bg-paper/70 backdrop-blur-sm ${className}`}
        role="status"
      >
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft">
            {date}
          </span>
          <time
            dateTime={isoLabel}
            className="font-mono text-xs text-ink tabular-nums"
          >
            {time} IST
          </time>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 border border-rule/50 bg-paper/70 backdrop-blur-sm",
          className,
        )}
        role="status"
      >
        <span className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft">
          {date}
        </span>
        <span className="w-px h-3 bg-rule" aria-hidden="true" />
        <time
          dateTime={isoLabel}
          className="font-mono text-sm text-ink tabular-nums"
        >
          {time} IST
        </time>
      </div>
    );
  }

  return (
    <div
      className={`hidden 2xl:inline-flex items-center gap-2 px-3 py-1 border-l border-rule font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft ${className}`}
      role="status"
      title={`${date} · ${time}`}
    >
      <span>{date}</span>
      <time
        dateTime={isoLabel}
        className="font-mono text-xs text-ink tabular-nums"
      >
        {time}
      </time>
    </div>
  );
}
