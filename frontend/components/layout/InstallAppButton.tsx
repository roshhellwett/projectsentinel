'use client';

import { Download } from 'lucide-react';
import { usePWAInstall } from '@/lib/hooks/usePWAInstall';

export function InstallAppButton() {
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      className="tap-target min-h-[44px] inline-flex items-center gap-1.5 px-3 pt-[7px] pb-[9px] bg-ink text-[13px] font-semibold text-paper hover:bg-ink/90 transition-all hover-lift rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label="Install App"
    >
      <Download className="w-3.5 h-3.5" />
      Install App
    </button>
  );
}
