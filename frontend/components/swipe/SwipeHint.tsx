'use client';

import { Z_INDEX } from '@/lib/theme/zIndex';
import { useEffect, useState } from 'react';
import { ArrowUp, Undo2, ArrowLeft, ArrowRight } from 'lucide-react';
import { isHintDismissed, dismissHint } from '@/lib/utils/swipeStats';

export function SwipeHint() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isHintDismissed()) return;
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const close = () => {
    dismissHint();
    setShow(false);
  };

  return (
    <>
      {show && (
        <div
          className={`animate-fade-in fixed inset-0 flex items-end sm:items-center justify-center px-4 pb-24 pt-10 ${Z_INDEX.prompts}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="swipe-hint-title"
        >
          <button
            type="button"
            onClick={close}
            className="absolute inset-0 bg-ink/65 cursor-pointer"
            aria-label="Dismiss tutorial"
          />

          <div className="animate-slide-up-in relative w-full max-w-sm bg-paper/80 backdrop-blur-xl border border-rule/50 rounded-md overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
                How to swipe
              </p>
              <h2 id="swipe-hint-title" className="font-display text-lg font-bold text-ink mb-4">
                Two ways to move
              </h2>

              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <div className="flex gap-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-accent text-accent rounded-md bg-paper shadow-sm">
                      <span className="animate-bounce-y"><ArrowUp className="w-3.5 h-3.5" /></span>
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-accent text-accent rounded-md bg-paper shadow-sm">
                      <span className="animate-bounce-x" style={{ animationDelay: '0.2s' }}><ArrowRight className="w-3.5 h-3.5" /></span>
                    </span>
                  </div>
                  <span className="flex flex-col mt-0.5 leading-tight">
                    <span className="text-[13px] font-bold text-ink tracking-[-0.01em]">Next story</span>
                    <span className="text-[12px] text-muted">Swipe Up or Right</span>
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex gap-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-rule-strong text-ink rounded-md bg-paper shadow-sm">
                      <span className="animate-bounce-y" style={{ animationDelay: '0.4s' }}><Undo2 className="w-3.5 h-3.5" /></span>
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-rule-strong text-ink rounded-md bg-paper shadow-sm">
                      <span className="animate-bounce-x" style={{ animationDelay: '0.6s' }}><ArrowLeft className="w-3.5 h-3.5" /></span>
                    </span>
                  </div>
                  <span className="flex flex-col mt-0.5 leading-tight">
                    <span className="text-[13px] font-bold text-ink tracking-[-0.01em]">Previous story</span>
                    <span className="text-[12px] text-muted">Swipe Down or Left</span>
                  </span>
                </li>
              </ul>

              <p className="text-[12px] text-muted mb-5 leading-relaxed">
                <span className="font-semibold text-ink">Made a mistake?</span> Tap the undo button that appears after each swipe, or swipe down to go back. Tap a card to read the full article.
              </p>

              <button
                type="button"
                onClick={close}
                className="w-full px-4 pt-[9px] pb-[11px] bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 hover-lift transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
