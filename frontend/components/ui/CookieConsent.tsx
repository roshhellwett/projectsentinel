'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Info, X } from 'lucide-react';
import { Z_INDEX } from '@/lib/theme/zIndex';

import { safeRead, safeWrite } from '@/lib/utils/safeStorage';

const STORAGE_KEY = 'iv-cookie-consent';

type Decision = 'accepted' | 'rejected';

function readDecision(): Decision | null {
  const v = safeRead(STORAGE_KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

function writeDecision(d: Decision) {
  safeWrite(STORAGE_KEY, d);
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const consentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readDecision() !== null) return;

    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open || !consentRef.current) return;
    const firstFocusable = consentRef.current.querySelector<HTMLElement>('button, a, input, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
  }, [open]);

  const accept = useCallback(() => {
    writeDecision('accepted');
    setOpen(false);
  }, []);

  const reject = useCallback(() => {
    writeDecision('rejected');
    setOpen(false);
  }, []);

  return (
    <>
      {open && (
        <div
          ref={consentRef}
          role="dialog"
          aria-label="Cookie preferences"
          aria-modal="false"
          className={`animate-slide-up-fade fixed left-3 right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:left-auto md:right-6 md:bottom-6 md:max-w-md ${Z_INDEX.cookieConsent} transform-gpu`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="card border border-rule-strong rounded-lg shadow-paper-lift px-5 py-4 md:px-6 md:py-5">
            <button
              type="button"
              onClick={reject}
              aria-label="Dismiss without accepting"
              className="tap-target absolute top-1 right-1 text-subtle hover:text-ink rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-accent mb-2">
              Cookies &amp; privacy
            </p>
            <h2 className="font-display text-lg font-bold text-ink mb-2 leading-snug">
              We use minimal cookies to keep this site working.
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              No advertising or third-party tracking. We store your reading
              preferences (theme, saved stories, search history) on this
              device only. See our{' '}
              <Link href="/privacy/" className="text-ink underline decoration-rule-strong hover:decoration-accent underline-offset-2">
                Privacy Policy
              </Link>
              {' '}for full details.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center">
              <button
                type="button"
                onClick={reject}
                className="tap-target min-h-[48px] px-4 py-2.5 sm:py-2 text-sm font-medium text-ink border border-rule-strong rounded hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={accept}
                className="tap-target min-h-[48px] px-4 py-2.5 sm:py-2 text-sm font-semibold text-paper bg-ink rounded hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Accept &amp; continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
