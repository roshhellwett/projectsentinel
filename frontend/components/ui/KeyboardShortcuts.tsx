'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { X, Keyboard } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

const SHORTCUTS: Array<{ keys: string[]; description: string }> = [
  { keys: ['/'], description: 'Focus search' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['g', 'h'], description: 'Go to home' },
  { keys: ['g', 's'], description: 'Go to saved stories' },
  { keys: ['Esc'], description: 'Close any open dialog' },
];

export const OPEN_SEARCH_EVENT = 'iv:open-search';

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const bufferRef = useRef<string>('');
  const bufferTimerRef = useRef<number | null>(null);

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!helpOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    lockBodyScroll();
    const id = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(id);
      unlockBodyScroll();
    };
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

      if (isEditableTarget(e.target)) return;

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Escape') {
        if (helpOpen) {
          e.preventDefault();
          setHelpOpen(false);
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
        resetBuffer();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setHelpOpen((v) => !v);
        resetBuffer();
        return;
      }

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
    <>
      {helpOpen && (
        <>
          <div
            className={`animate-fade-in fixed inset-0 bg-ink/50 ${Z_INDEX.shortcutBackdrop}`}
            onClick={closeHelp}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className={`animate-scale-in fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-6 ${Z_INDEX.shortcutWidget}`}
            style={{ width: 'min(calc(100vw-2rem),22rem)' }}
          >
            <div className="card rounded-2xl p-6 shadow-paper-lift">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-base font-semibold text-ink tracking-normal">
                    Keyboard shortcuts
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeHelp}
                  aria-label="Close shortcuts"
                  className="touch-polish p-1.5 rounded-lg text-subtle hover:text-ink hover:bg-ink/[0.06] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
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
                    <span className="text-muted">{description}</span>
                    <span className="inline-flex items-center gap-1.5">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="inline-flex items-center justify-center min-w-[1.65rem] h-7 px-2 rounded-md bg-paper border border-rule text-[11px] font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] text-subtle leading-relaxed">
                Shortcuts are disabled while you&apos;re typing in a search or text
                field.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
