"use client";

import { Z_INDEX } from "@/lib/theme/zIndex";
import { useEffect, useState } from "react";
import { ArrowUp, Undo2, ArrowLeft, ArrowRight } from "lucide-react";
import { isHintDismissed, dismissHint } from "@/lib/utils/swipeStats";
import { useI18n } from "@/lib/i18n/context";

export function SwipeHint() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isHintDismissed()) return;
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const close = () => {
    dismissHint();
    setShow(false);
  };

  return (
    <>
      {show && (
        <div
          className={`animate-fade-in fixed inset-0 flex items-end sm:items-center justify-center px-4 pb-24 pt-10 ${Z_INDEX.prompts}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="swipe-hint-title"
        >
          <button
            type="button"
            onClick={close}
            className="absolute inset-0 bg-ink/65 cursor-pointer"
            aria-label={t("swipe.aria_dismiss_hint")}
          />

          <div className="animate-slide-up-in relative w-full max-w-sm bg-paper/80 backdrop-blur-xl border border-rule/50 rounded-md overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
                {t("swipe.how_to")}
              </p>
              <h2
                id="swipe-hint-title"
                className="font-display text-lg font-bold text-ink mb-4"
              >
                {t("swipe.two_ways")}
              </h2>

              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <div className="flex gap-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-accent text-accent rounded-md bg-paper shadow-sm">
                      <span className="animate-bounce-y">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </span>
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-accent text-accent rounded-md bg-paper shadow-sm">
                      <span
                        className="animate-bounce-x"
                        style={{ animationDelay: "0.2s" }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </span>
                  </div>
                  <span className="flex flex-col mt-0.5 leading-tight">
                    <span className="text-[13px] font-bold text-ink tracking-[-0.01em]">
                      {t("swipe.next_story")}
                    </span>
                    <span className="text-[12px] text-muted">
                      {t("swipe.swipe_up_right")}
                    </span>
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex gap-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-rule-strong text-ink rounded-md bg-paper shadow-sm">
                      <span
                        className="animate-bounce-y"
                        style={{ animationDelay: "0.4s" }}
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </span>
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 border border-rule-strong text-ink rounded-md bg-paper shadow-sm">
                      <span
                        className="animate-bounce-x"
                        style={{ animationDelay: "0.6s" }}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </span>
                  </div>
                  <span className="flex flex-col mt-0.5 leading-tight">
                    <span className="text-[13px] font-bold text-ink tracking-[-0.01em]">
                      {t("swipe.previous_story")}
                    </span>
                    <span className="text-[12px] text-muted">
                      {t("swipe.swipe_down_left")}
                    </span>
                  </span>
                </li>
              </ul>

              <p className="text-[12px] text-muted mb-5 leading-relaxed">
                <span className="font-semibold text-ink">
                  {t("swipe.swipe_desc")}
                </span>
              </p>

              <button
                type="button"
                onClick={close}
                className="w-full px-4 pt-[9px] pb-[11px] bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 hover-lift transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("swipe.got_it")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
