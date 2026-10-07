"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isBodyScrollLocked, subscribeBodyScrollLock } from "@/lib/utils/bodyScrollLock";
import { MessagesSquare } from "lucide-react";
import { MaterialIcon } from "@/components/visual/MaterialIcon";

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
      className="frosted-panel group fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.75rem)] right-4 z-[59] grid place-items-center rounded-[20px] border border-white shadow-[0_8px_26px_rgb(var(--c-shadow)/0.08)] transition-transform duration-300 [transition-timing-function:var(--ease-apple)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 md:bottom-6 md:right-6"
      style={{ height: "3.5rem", width: "3.5rem" }}
    >

      <span className="sr-only">AI News Assistant</span>
      <MaterialIcon icon={MessagesSquare} tone="violet" />
    </Link>
  );
}

export default ChatBubble;
