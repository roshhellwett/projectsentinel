'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, X, Check } from 'lucide-react';
import { Z_INDEX } from '@/lib/theme/zIndex';
import { cn } from '@/lib/utils/cn';
import { showToast } from '@/lib/utils/toast';
import { useHapticFeedback } from '@/lib/hooks/useHapticFeedback';

interface ShareButtonsProps {
  headline: string;
  url: string;
  placement?: 'popover' | 'inline' | 'sheet';
  className?: string;
  buttonClassName?: string;
}

const SHARE_PLATFORMS = [
  {
    name: 'WhatsApp',
    getUrl: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: 'Twitter / X',
    getUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',

    getUrl: (url: string, _text: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',

    getUrl: (url: string, _text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    getUrl: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

export function ShareButtons({
  headline,
  url,
  placement = 'popover',
  className,
  buttonClassName,
}: ShareButtonsProps) {
  const haptic = useHapticFeedback();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isInline = placement === 'inline';
  const isSheet = placement === 'sheet';

  useEffect(() => () => {
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
  }, []);

  useEffect(() => {
    if (!showMenu) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowMenu(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setShowMenu(false);
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showMenu]);

  const copyLink = useCallback(async () => {
    haptic.success();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied to clipboard', 'success');
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      try {
        textArea.focus();
        textArea.setSelectionRange(0, textArea.value.length);
        document.execCommand('copy');
        setCopied(true);
        showToast('Link copied to clipboard', 'success');
        if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
      } catch {
        showToast('Could not copy link. Try manually selecting the URL.', 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }, [url, haptic]);

  const handleShareClick = useCallback(async () => {
    haptic.medium();
    if (typeof navigator !== 'undefined' && navigator.share && (isInline || isSheet || window.innerWidth < 768)) {
      const shareData = { title: headline, text: headline, url };
      if (!navigator.canShare || navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return;
        }
      }
    }
    setShowMenu((v) => !v);
  }, [headline, url, isInline, isSheet, haptic]);

  return (
    <div className={cn('relative min-w-0', (isInline || isSheet) && 'w-full', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleShareClick}
        className={cn(
          'tap-target inline-flex items-center gap-2 px-3.5 py-2 rounded bg-paper border border-rule text-muted hover:text-ink hover:border-ink transition-all hover-lift active:scale-95 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          (isInline || isSheet) && 'w-full justify-center',
          buttonClassName,
        )}
        aria-label="Share this article"
        aria-expanded={showMenu}
        aria-controls="share-menu"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          id="share-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Share article options"
          className={cn(
            `${Z_INDEX.shareMenu} rounded border border-rule-strong bg-paper p-2 shadow-paper-lift`,
            'animate-scale-in will-change-transform transform-gpu',
            placement === 'popover' && 'absolute right-0 top-full mt-2',
            placement === 'inline' && 'relative mt-3 w-full max-w-none shadow-paper-lift',
            placement === 'sheet' && 'fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 w-auto max-w-none shadow-[0_16px_40px_-12px_rgba(0,0,0,0.24)] sm:absolute sm:bottom-full sm:left-auto sm:right-0 sm:mb-3 sm:w-[min(21rem,calc(100vw-2rem))]',
          )}
          style={{ width: placement === 'popover' ? 'min(21rem,calc(100vw-2rem))' : undefined }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-1.5 mb-2 pb-2 border-b border-rule">
            {SHARE_PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={platform.getUrl(url, headline)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { haptic.light(); setShowMenu(false); }}
                className="tap-target flex min-w-0 items-center gap-2.5 rounded px-3 py-2.5 text-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
                title={platform.name}
              >
                {platform.name === 'WhatsApp' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                ) : platform.name === 'Facebook' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                ) : platform.name === 'LinkedIn' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                ) : platform.name === 'Telegram' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                )}
                <span className="min-w-0 truncate text-[12px] font-semibold leading-tight">{platform.name === 'Twitter / X' ? 'X / Twitter' : platform.name}</span>
              </a>
            ))}
          </div>

          <button
            onClick={copyLink}
            className="tap-target flex w-full items-center gap-2 rounded px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
          >
            {copied ? (
              <Check className="w-4 h-4 text-cred-high" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}
