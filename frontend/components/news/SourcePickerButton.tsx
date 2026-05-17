'use client';

// last edited 2026-05-17 by roshhellwett

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, Newspaper } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Source } from '@/types';
import { cn } from '@/lib/utils/cn';
import { getHostname } from '@/lib/utils/getHostname';

interface SourcePickerButtonProps {
  sources: Source[];
  label?: string;
  placement?: 'popover' | 'sheet';
  className?: string;
  buttonClassName?: string;
  stopPropagation?: boolean;
}

function getSourceLabel(source: Source): string {
  if (source.title?.trim()) return source.title.trim();
  if (source.name?.trim()) return source.name.trim();
  const host = getHostname(source.url);
  return host || 'Source';
}

function SourceIcon({ url }: { url: string }) {
  const [errored, setErrored] = useState(false);
  const host = getHostname(url);

  if (!host || errored) {
    return (
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-paper-2 border border-rule text-muted" aria-hidden="true">
        <Globe className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (

    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className="h-5 w-5 flex-shrink-0 rounded bg-paper border border-rule"
    />
  );
}

export function SourcePickerButton({
  sources,
  label = 'Read Full',
  placement = 'popover',
  className,
  buttonClassName,
  stopPropagation = true,
}: SourcePickerButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const validSources = (sources ?? []).filter((source) => source.url);
  const disabled = validSources.length === 0;

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const toggle = useCallback((event: React.MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!disabled) setOpen((value) => !value);
  }, [disabled, stopPropagation]);

  return (
    <div className={cn('relative min-w-0', placement === 'sheet' && 'w-full', className)}>
      <motion.button
        ref={buttonRef}
        type="button"
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex max-w-full items-center justify-center gap-2 rounded border border-rule-strong bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-55',
          placement === 'sheet' && 'w-full rounded px-3 py-3',
          buttonClassName,
        )}
      >
        <Newspaper className="h-4 w-4" />
        <span className="truncate">{label}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            className={cn(
              'z-[95] rounded border border-rule-strong bg-paper p-2 shadow-paper-lift',
              placement === 'popover' && 'absolute bottom-full left-0 mb-2 w-[min(18rem,calc(100vw-2rem))]',
              placement === 'sheet' && 'fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 w-auto sm:absolute sm:bottom-full sm:left-auto sm:right-0 sm:mb-3 sm:w-[min(22rem,calc(100vw-2rem))]',
            )}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
            onClick={(event) => {
              if (stopPropagation) event.stopPropagation();
            }}
          >
            <div className="mb-2 px-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              Choose source
            </div>
            <div className="max-h-[45vh] overflow-y-auto pr-1">
              {validSources.map((source, index) => {
                const sourceLabel = getSourceLabel(source);
                const host = getHostname(source.url);
                return (
                  <a
                    key={source.url || index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex min-w-0 items-center gap-3 rounded px-3 py-2.5 text-ink transition-colors hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Open ${sourceLabel} in a new tab`}
                  >
                    <SourceIcon url={source.url} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{sourceLabel}</span>
                      {host && <span className="block truncate text-[11px] font-medium text-subtle">{host}</span>}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-subtle" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
