'use client';

// last edited 2026-05-17 by roshhellwett

import { useEffect, useState } from 'react';
import { ArrowUp, Undo2, ArrowLeft, ArrowRight } from 'lucide-react';
import { isHintDismissed, dismissHint } from '@/lib/utils/swipeStats';

export function SwipeHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isHintDismissed()) setShow(true);
  }, []);

  if (!show) return null;

  const close = () => {
    dismissHint();
    setShow(false);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center px-4 pb-24 pt-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="swipe-hint-title"
    >
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px] cursor-pointer"
        aria-label="Dismiss tutorial"
      />

      <div className="relative w-full max-w-sm bg-paper border border-rule-strong rounded-md shadow-paper-lift overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
            How to swipe
          </p>
          <h2 id="swipe-hint-title" className="font-display text-lg font-bold text-ink mb-4">
            Four ways to move
          </h2>

          <ul className="space-y-3 mb-5">
            <Item icon={<ArrowUp className="w-4 h-4" />} title="Swipe up" desc="Skip to next story" />
            <Item icon={<Undo2 className="w-4 h-4" />} title="Swipe down" desc="Go back one story" />
            <Item icon={<ArrowRight className="w-4 h-4" />} title="Swipe right" desc="Save for later" tone="cred" />
            <Item icon={<ArrowLeft className="w-4 h-4" />} title="Swipe left" desc="Dismiss for today" />
          </ul>

          <p className="text-[12px] text-muted mb-5 leading-relaxed">
            <span className="font-semibold text-ink">Made a mistake?</span> Tap the undo button that appears after each swipe, or swipe down to go back. Tap a card to read the full article.
          </p>

          <button
            type="button"
            onClick={close}
            className="w-full px-4 py-2.5 bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function Item({
  icon,
  title,
  desc,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone?: 'cred';
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`inline-flex items-center justify-center w-9 h-9 border rounded-md ${
          tone === 'cred' ? 'border-cred-high text-cred-high' : 'border-rule-strong text-ink'
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        <span className="text-[12px] text-muted">{desc}</span>
      </span>
    </li>
  );
}
