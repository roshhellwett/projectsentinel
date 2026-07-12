'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Globe, Newspaper } from 'lucide-react';
import { Source } from '@/types';
import { cn } from '@/lib/utils/cn';
import { getHostname } from '@/lib/utils/getHostname';
import { buttonVariants } from '@/components/ui/Button';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { useI18n } from '@/lib/i18n/context';

interface SourcePickerButtonProps {
  sources: Source[];
  label?: string | React.ReactNode;
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

const SourceIcon = memo(function SourceIcon({ url }: { url: string }) {
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
      sizes="20px"
      className="h-5 w-5 flex-shrink-0 rounded bg-paper border border-rule img-fade-in"
    />
  );
});

export function SourcePickerButton({
  sources,
  label = 'Read Full',
  placement = 'popover',
  className,
  buttonClassName,
  stopPropagation = true,
}: SourcePickerButtonProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, bottom: 0, width: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  
  const validSources = (sources ?? []).filter((source) => source.url);
  const disabled = validSources.length === 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      requestAnimationFrame(() => {
        const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
        if (firstItem) firstItem.focus();
        else menuRef.current?.focus();
      });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      buttonRef.current?.focus();
    }
  }, [open]);

  const tickingRef = useRef(false);

  const updateCoords = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          bottom: window.innerHeight - rect.top,
          width: rect.width,
        });
      }
      tickingRef.current = false;
    });
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    if (!open) return;
    
    updateCoords();
    window.addEventListener('resize', updateCoords, { passive: true });
    window.addEventListener('scroll', updateCoords, { passive: true, capture: true });

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
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open, updateCoords]);

  const toggle = useCallback((event: React.MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!disabled) setOpen((value) => !value);
  }, [disabled, stopPropagation]);

  const isSheet = placement === 'sheet';

  const popoverStyle = {
    position: 'fixed' as const,
    bottom: coords.bottom + 8,
    left: coords.left,
    width: 'min(18rem, calc(100vw - 2rem))',
  };

  const sheetStyle = isMobile ? {
    position: 'fixed' as const,
    bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
    left: '0.75rem',
    right: '0.75rem',
    width: 'auto',
  } : {
    position: 'fixed' as const,
    bottom: coords.bottom + 12,
    right: (coords.width > 0 ? document.documentElement.clientWidth - (coords.left + coords.width) : 0),
    width: 'min(22rem, calc(100vw - 2rem))',
  };

  const portalContent = (
    <>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className={`${Z_INDEX.popover} animate-scale-in rounded border border-rule-strong bg-paper p-2 shadow-paper-lift transform-gpu overflow-hidden`}
          style={((isSheet ? sheetStyle : popoverStyle) as React.CSSProperties)}
          onClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
        >
          <div className="mb-2 px-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            {t('source_picker.choose_source')}
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
                  aria-label={t('source_picker.aria_open', { name: sourceLabel })}
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
        </div>
      )}
    </>
  );

  if (validSources.length === 1) {
    return (
      <a
        href={validSources[0].url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event: React.MouseEvent) => {
          if (stopPropagation) event.stopPropagation();
        }}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'gap-2 font-semibold max-w-full hover:bg-ink hover:text-paper hover:border-ink active:scale-95 transition-all',
          placement === 'sheet' && 'w-full px-3 py-3',
          buttonClassName,
        )}
      >
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </a>
    );
  }

  const topFavicon = validSources[0]?.url;

  return (
    <div className={cn('relative min-w-0', placement === 'sheet' && 'w-full', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'gap-2 font-semibold max-w-full hover:bg-ink hover:text-paper hover:border-ink disabled:opacity-55 active:scale-95 transition-all',
          placement === 'sheet' && 'w-full px-3 py-3',
          buttonClassName,
        )}
      >
        {topFavicon ? (
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <Newspaper className="h-4 w-4" />
        )}
        <span className="truncate">{label}</span>
      </button>
      
      {mounted && typeof document !== 'undefined' ? createPortal(portalContent, document.body) : null}
    </div>
  );
}
