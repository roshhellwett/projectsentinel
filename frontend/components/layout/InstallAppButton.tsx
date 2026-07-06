'use client';

import { Download } from 'lucide-react';
import { usePWAInstall } from '@/lib/hooks/usePWAInstall';

export function InstallAppButton() {
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWAInstall();

  if (isStandalone || (!isInstallable && !isIOS)) return null;

  const handleClick = () => {
    if (isInstallable) void promptInstall();
    else if (isIOS) alert('To install Zenith PWA on iPhone/iPad: Tap the Share button in Safari and select "Add to Home Screen".');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="tap-target min-h-[44px] inline-flex items-center gap-1.5 px-3 pt-[7px] pb-[9px] bg-ink text-[13px] font-semibold text-paper hover:bg-ink/90 transition-all hover-lift rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
      aria-label="Install App"
    >
      <Download className="w-3.5 h-3.5" />
      {isIOS ? 'Install PWA' : 'Install App'}
    </button>
  );
}
