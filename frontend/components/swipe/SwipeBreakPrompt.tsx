'use client';

import { Z_INDEX } from '@/lib/theme/zIndex';
import { useEffect, useRef } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

interface SwipeBreakPromptProps {
  cardsThisSession: number;
  onSnooze: () => void;
  onContinue: () => void;
}

export function SwipeBreakPrompt({ cardsThisSession, onSnooze, onContinue }: SwipeBreakPromptProps) {
  const autoTimerRef = useRef<number | null>(null);
  const onSnoozeRef = useRef(onSnooze);
  const onContinueRef = useRef(onContinue);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  onSnoozeRef.current = onSnooze;
  onContinueRef.current = onContinue;

  useEffect(() => {
    lockBodyScroll();
    const focusTimer = window.setTimeout(() => primaryBtnRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
        onContinueRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    autoTimerRef.current = window.setTimeout(() => {
      onSnoozeRef.current();
    }, 60000);

    return () => {
      if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 ${Z_INDEX.prompts} flex items-center justify-center px-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="swipe-break-title"
    >
      <button
        type="button"
        onClick={() => {
          if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
          onContinue();
        }}
        className="absolute inset-0 bg-ink/75 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Dismiss break prompt"
      />
      <div className="relative w-full max-w-sm np-card glass-card overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
            Pause for a moment
          </p>
          <h2 id="swipe-break-title" className="font-display text-xl font-bold text-ink leading-tight mb-3">
            You&apos;ve read {cardsThisSession} stories in a row.
          </h2>
          <p className="text-[13.5px] text-muted leading-relaxed mb-6">
            The headlines will still be here in ten minutes. Take a breath, stretch, look out a window — your brain will thank you.
          </p>
          <div className="flex flex-col gap-2">
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={() => {
                if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
                onSnooze();
              }}
              className="w-full px-4 pt-[9px] pb-[11px] bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Take a break
            </button>
            <button
              type="button"
              onClick={() => {
                if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
                onContinue();
              }}
              className="w-full px-4 pt-[7px] pb-[9px] text-[12px] font-medium text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Keep reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
