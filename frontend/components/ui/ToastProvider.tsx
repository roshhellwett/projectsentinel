"use client";

import {
  BookmarkCheck,
  BookmarkMinus,
  Share2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Z_INDEX } from "@/lib/theme/zIndex";
import { useToasts } from "@/lib/utils/toast";

export function ToastProvider() {
  const toasts = useToasts();

  return (
    <div
      className={`fixed sm:bottom-10 left-1/2 -translate-x-1/2 ${Z_INDEX.toast} flex flex-col items-center gap-2 pointer-events-none`}
      style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.icon === "error" ? "alert" : "status"}
          aria-live={toast.icon === "error" ? "assertive" : "polite"}
          className="animate-slide-up-fade flex items-center gap-2.5 px-4 py-2.5 bg-ink/90 text-paper rounded-full shadow-paper-lift will-change-transform transform-gpu"
        >
          {toast.icon === "bookmark" && (
            <BookmarkCheck
              className="w-4 h-4 text-paper/80"
              strokeWidth={2.5}
            />
          )}
          {toast.icon === "bookmark-off" && (
            <BookmarkMinus
              className="w-4 h-4 text-paper/80"
              strokeWidth={2.5}
            />
          )}
          {toast.icon === "share" && (
            <Share2 className="w-4 h-4 text-paper/80" strokeWidth={2.5} />
          )}
          {toast.icon === "success" && (
            <CheckCircle2 className="w-4 h-4 text-paper/80" strokeWidth={2.5} />
          )}
          {toast.icon === "error" && (
            <AlertCircle className="w-4 h-4 text-paper/80" strokeWidth={2.5} />
          )}
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
