'use client';

/**
 * KeyboardShortcuts — global hotkey layer with a help overlay.
 *
 * Mounted once at the layout root. Listens on `keydown` and:
 *   • `/`           — open the in-app search (dispatches a custom event;
 *                     the Navbar listens and opens its SearchBar overlay).
 *   • `?`           — toggle this help modal.
 *   • `g h`         — go home.
 *   • `g s`         — go to /saved.
 *   • `Esc`         — close the help modal (other overlays handle Esc
 *                     themselves).
 *
 * The handler ignores keys when the user is typing in an input/textarea
 * or a contenteditable element. Live regions announce the modal opening.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

const SHORTCUTS: Array<{ keys: string[]; description: string }> = [
  { keys: ['/'], description: 'Focus search' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['g', 'h'], description: 'Go to home' },
  { keys: ['g', 's'], description: 'Go to saved stories' },
  { keys: ['Esc'], description: 'Close any open dialog' },
];

/** Custom event the Navbar listens for to open the SearchBar overlay. */
export const OPEN_SEARCH_EVENT = 'iv:open-search';

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  // Buffer for two-key sequences like `g h`. We reset it after 800 ms of
  // inactivity so a stale `g` doesn't hijack a much later `h`.
  const bufferRef = useRef<string>('');
  const bufferTimerRef = useRef<number | null>(null);

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  // Lock body scroll while help is open.
  useEffect(() => {
    if (!helpOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [helpOpen]);

  useEffect(() => {
    const resetBuffer = () => {
      bufferRef.current = '';
      if (bufferTimerRef.current !== null) {
        window.clearTimeout(bufferTimerRef.current);
        bufferTimerRef.current = null;
      }
    };

    const isEditableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Never hijack when the user is typing.
      if (isEditableTarget(e.target)) return;
      // Never hijack when modifier keys are pressed (browser shortcuts).
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Escape — only close our help (other overlays own their own Esc).
      if (e.key === 'Escape') {
        if (helpOpen) {
          e.preventDefault();
          setHelpOpen(false);
        }
        return;
      }

      // "/" focuses the search overlay.
      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
        resetBuffer();
        return;
      }

      // "?" toggles help.
      if (e.key === '?') {
        e.preventDefault();
        setHelpOpen((v) => !v);
        resetBuffer();
        return;
      }

      // Two-key sequences starting with `g`.
      if (bufferRef.current === 'g') {
        if (e.key === 'h') {
          e.preventDefault();
          router.push('/');
          resetBuffer();
          return;
        }
        if (e.key === 's') {
          e.preventDefault();
          router.push('/saved/');
          resetBuffer();
          return;
        }
        resetBuffer();
      }

      if (e.key === 'g') {
        bufferRef.current = 'g';
        if (bufferTimerRef.current !== null) {
          window.clearTimeout(bufferTimerRef.current);
        }
        bufferTimerRef.current = window.setTimeout(resetBuffer, 800);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      resetBuffer();
    };
  }, [helpOpen, router]);

  return (
    <AnimatePresence>
      {helpOpen && (
        <>
          <motion.div
            key="kb-backdrop"
            className="fixed inset-0 z-[110] bg-slate-950/30 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeHelp}
            aria-hidden="true"
          />
          <motion.div
            key="kb-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="fixed left-1/2 top-1/2 z-[111] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="premium-card rounded-2xl p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-950 tracking-tight">
                    Keyboard shortcuts
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeHelp}
                  aria-label="Close shortcuts"
                  className="touch-polish p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-950/[0.06] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2.5">
                {SHORTCUTS.map(({ keys, description }) => (
                  <li
                    key={description}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-slate-600">{description}</span>
                    <span className="inline-flex items-center gap-1.5">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="inline-flex items-center justify-center min-w-[1.65rem] h-7 px-2 rounded-md bg-white border border-slate-950/[0.12] text-[11px] font-semibold text-slate-700 shadow-[inset_0_-1px_0_rgba(15,23,42,0.08)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
                Shortcuts are disabled while you&apos;re typing in a search or text
                field.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
