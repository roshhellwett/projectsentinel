"use client";

import Link from "next/link";

export function ChatBubble() {
  return (
    <Link
      href="/chat"
      aria-label="Ask the desk assistant"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] right-4 z-[75] grid place-items-center rounded-full border border-ink bg-paper text-ink shadow-[0_6px_24px_-8px_rgb(var(--c-shadow)/0.45)] transition-transform duration-300 [transition-timing-function:var(--ease-apple)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 sm:bottom-6 sm:right-6"
      style={{ height: "3.25rem", width: "3.25rem" }}
    >
      <span className="sr-only">Desk assistant</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 5.5h16v10H8.5L4 19V5.5Z" />
        <path d="M8 9.5h8M8 12.5h5" />
      </svg>
    </Link>
  );
}

export default ChatBubble;