"use client";

import { useEffect, useRef, useState } from "react";
import { usePWAInstall } from "@/lib/hooks/usePWAInstall";
import { useI18n } from "@/lib/i18n/i18n-shared";

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M4 21h16" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block align-[-2px]"
    >
      <path d="M12 16V4" />
      <polyline points="8 8 12 4 16 8" />
      <path d="M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
    </svg>
  );
}

export function InstallAppButton() {
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const { t } = useI18n();
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showIOSHelp) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setShowIOSHelp(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowIOSHelp(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showIOSHelp]);

  if (isStandalone) return null;

  const label = t("footer.install_app");
  const showHelp = !isInstallable && showIOSHelp;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() =>
          isInstallable ? promptInstall() : setShowIOSHelp((v) => !v)
        }
        aria-expanded={!isInstallable ? showIOSHelp : undefined}
        className="inline-flex items-center gap-fluid-3xs px-fluid-xs py-fluid-2xs border border-ink bg-ink text-paper text-fluid-2xs hover:bg-ink-soft transition-colors duration-base rounded-token-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        <DownloadIcon />
        {label}
      </button>

      {showHelp && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-[min(19rem,80vw)] border border-rule bg-paper text-ink shadow-lg rounded-token-sm p-fluid-xs"
        >
          {isIOS ? (
            <p className="text-fluid-2xs leading-relaxed text-ink-soft">
              On iPhone or iPad, tap <ShareIcon /> <strong>Share</strong> in
              Safari, then choose <strong>Add to Home Screen</strong>.
            </p>
          ) : (
            <p className="text-fluid-2xs leading-relaxed text-ink-soft">
              Open this site in your browser (not an embedded preview), then use
              the browser menu and choose <strong>Install app</strong> or{" "}
              <strong>Add to Home Screen</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

