"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Z_INDEX } from "@/lib/theme/zIndex";

import { useI18n } from "@/lib/i18n/context";
import { safeRead, safeWrite } from "@/lib/utils/safeStorage";

const STORAGE_KEY = "iv-cookie-consent";

type Decision = "accepted" | "rejected";

function readDecision(): Decision | null {
  const v = safeRead(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

function writeDecision(d: Decision) {
  safeWrite(STORAGE_KEY, d);
}

export function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readDecision() !== null) return;

    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, []);


  const accept = useCallback(() => {
    writeDecision("accepted");
    setOpen(false);
  }, []);

  const reject = useCallback(() => {
    writeDecision("rejected");
    setOpen(false);
  }, []);

  return (
    <>
      {open && (
        <div
          role="region"
          aria-label={t("cookie.aria_preferences")}
          className={`frosted-panel rounded-[22px] shadow-[0_8px_40px_rgb(var(--c-shadow)/0.1)] animate-slide-up-fade fixed left-3 right-3 bottom-[calc(5.8rem+env(safe-area-inset-bottom,0px))] md:right-auto md:left-6 md:bottom-6 md:w-[360px] ${Z_INDEX.cookieConsent} transform-gpu`}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="border border-white rounded-[22px] px-5 py-4">
            <button
              type="button"
              onClick={reject}
              aria-label={t("cookie.aria_dismiss")}
              className="tap-target absolute top-1 right-1 text-subtle hover:text-ink rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="editorial-kicker mb-2 pr-8">
              {t("cookie.title")}
            </p>
            <h2 className="font-body text-[12px] font-medium text-ink mb-3 leading-relaxed pr-4">
              {t("cookie.desc")}
            </h2>
            <details className="text-[11px] text-muted mb-3"><summary className="cursor-pointer min-h-[24px]">Cookie details &amp; privacy</summary><p className="pt-2">
              {t("cookie.body")}{" "}
              <Link
                href="/privacy/"
                className="text-ink underline decoration-rule-strong hover:decoration-accent underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p></details>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={reject}
                className="tap-target min-h-[44px] px-4 py-2 text-[11px] font-medium text-ink border border-rule-strong rounded hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("cookie.dismiss")}
              </button>
              <button
                type="button"
                onClick={accept}
                className="tap-target min-h-[44px] px-4 py-2 text-[11px] font-semibold text-paper bg-ink rounded hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("cookie.accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
