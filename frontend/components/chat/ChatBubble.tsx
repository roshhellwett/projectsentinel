"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isBodyScrollLocked, subscribeBodyScrollLock } from "@/lib/utils/bodyScrollLock";

export function ChatBubble() {
  const pathname = usePathname();
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => {
    setOverlayOpen(isBodyScrollLocked());
    return subscribeBodyScrollLock(setOverlayOpen);
  }, []);
  // The bubble is the doorway to the desk — pointless once you're standing in it.
  if (pathname?.startsWith("/chat") || overlayOpen) return null;

  return (
    <Link
      href="/chat"
      aria-label="Ask the AI News Assistant"
      className="group fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] right-4 z-[59] grid place-items-center rounded-full border border-rule bg-paper text-ink shadow-[0_6px_20px_rgb(var(--c-shadow)/0.06)] transition-transform duration-300 [transition-timing-function:var(--ease-apple)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 md:bottom-6 md:right-6"
      style={{ height: "3.5rem", width: "3.5rem" }}
    >

      <span className="sr-only">AI News Assistant</span>
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
