'use client';

import { useState, useEffect, useRef } from 'react';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';

function WifiOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.56 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

export function ConnectionStatus() {
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowReconnected(false);
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline]);

  return (
    <div className="flex-shrink-0 relative" aria-live="polite">
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-rule/50 bg-paper/70 backdrop-blur-sm"
          title="You are currently offline. Showing cached content."
        >
          <WifiOffIcon />
          <span className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft whitespace-nowrap">
            Offline
          </span>
        </div>
      )}

      {isOnline && showReconnected && (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-rule/50 bg-paper/70 backdrop-blur-sm"
        >
          <WifiIcon />
          <span className="font-body text-[10px] font-bold tracking-wider uppercase text-ink-soft">
            Back online
          </span>
        </div>
      )}
    </div>
  );
}
