'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'iv-cookie-consent';

type Decision = 'accepted' | 'rejected';

function readDecision(): Decision | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

function writeDecision(d: Decision) {
  try {
    window.localStorage.setItem(STORAGE_KEY, d);
  } catch {
    /* ignore quota / private mode */
  }
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readDecision() !== null) return;

    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const accept = useCallback(() => {
    writeDecision('accepted');
    setOpen(false);
  }, []);

  const reject = useCallback(() => {
    writeDecision('rejected');
    setOpen(false);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cookie-consent"
          role="dialog"
          aria-label="Cookie preferences"
          aria-modal="false"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed left-3 right-3 bottom-3 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[58]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="relative glass border border-rule-strong rounded-lg shadow-paper-lift px-5 py-4 md:px-6 md:py-5">
            <button
              type="button"
              onClick={reject}
              aria-label="Dismiss without accepting"
              className="tap-target absolute top-1.5 right-1.5 text-subtle hover:text-ink rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
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
                className="tap-target px-4 py-2 text-sm font-medium text-ink border border-rule-strong rounded hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Decline non-essential
              </button>
              <button
                type="button"
                onClick={accept}
                className="tap-target px-4 py-2 text-sm font-semibold text-paper bg-ink rounded hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Accept &amp; continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
