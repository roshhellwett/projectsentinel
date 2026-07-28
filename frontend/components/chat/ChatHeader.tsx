"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ChatHeader({
  onClear,
  messageCount,
}: {
  onClear: () => void;
  messageCount: number;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-rule bg-paper/90 px-4 py-3 backdrop-blur-md">
      <Link
        href="/"
        className="-ml-2 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
        aria-label="Back to home"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>

      <motion.div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-[0.5rem] font-bold text-paper shadow-sm"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        IV
      </motion.div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          India Verified
        </p>
        <h2 className="truncate text-[0.95rem] font-bold leading-snug">Desk Assistant</h2>
      </div>

      {messageCount > 1 && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-lg border border-rule bg-paper-2 px-2.5 py-1.5 text-[0.65rem] font-medium text-ink-soft transition-all hover:border-ink/30 hover:text-ink active:scale-95"
          aria-label="Clear conversation"
        >
          Clear
        </button>
      )}
    </header>
  );
}