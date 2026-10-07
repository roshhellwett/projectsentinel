"use client";

import Link from "next/link";
import { AssistantAvatar } from "@/components/chat/AssistantAvatar";

export function ChatHeader({
  onClear,
  messageCount,
}: {
  onClear: () => void;
  messageCount: number;
}) {
  return (
    <header className="border-b border-rule/80 bg-paper/95 px-3.5 py-3 backdrop-blur-xl sm:px-4 sm:py-4">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
        <Link
          href="/"
          className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
          aria-label="Back to home"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="shrink-0">
          <AssistantAvatar className="h-10 w-10" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-stamp" />
            </span>
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
              India Verified
            </p>
          </div>
          <h1 className="truncate text-[0.95rem] font-semibold leading-snug sm:text-[1rem]">
            AI News Assistant
          </h1>
          <p className="truncate text-[0.72rem] text-ink-soft sm:text-[0.78rem]">
            Stories, sources, and a little more context.
          </p>
        </div>

        {messageCount > 1 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full border border-rule/80 bg-paper-2 px-3 py-1.5 text-[0.7rem] font-medium text-ink-soft transition-all hover:border-ink/30 hover:text-ink active:scale-95"
            aria-label="Clear conversation"
          >
            Clear
          </button>
        )}
      </div>
    </header>
  );
}
