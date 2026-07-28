"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AssistantText } from "@/components/chat/AssistantText";
import { AssistantAvatar } from "@/components/chat/AssistantAvatar";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  degraded?: boolean;
  typewriter?: boolean;
  typewriterReveal?: number;
  onRetry?: (id: string) => void;
}

export function ChatMessage({
  id,
  role,
  content,
  degraded,
  typewriter,
  typewriterReveal,
  onRetry,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard errors and keep the UI calm.
    }
  };

  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={isUser ? "flex justify-end" : "flex items-start gap-2.5"}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
          className="mt-0.5 shrink-0"
        >
          <AssistantAvatar className="h-8 w-8" />
        </motion.div>
      )}

      <div className={`group flex max-w-[min(92%,38rem)] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <p className="max-w-full whitespace-pre-wrap break-words rounded-[1.25rem] rounded-tr-sm bg-ink px-3.5 py-3 text-[0.95rem] leading-7 text-paper shadow-[0_12px_30px_-16px_rgba(15,23,42,0.35)] sm:px-4 sm:py-3.5">
            {content}
          </p>
        ) : (
          <div
            className={`max-w-full whitespace-pre-wrap break-words rounded-[1.2rem] rounded-tl-sm border border-rule/80 bg-paper-2/90 px-3.5 py-3 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.28)] sm:px-4 sm:py-3.5 ${
              degraded ? "border-amber-300/70 bg-amber-50/70 italic text-ink-soft" : ""
            }`}
          >
            {typewriter && typewriterReveal !== undefined ? (
              <AssistantText text={content} revealCount={typewriterReveal} />
            ) : (
              <AssistantText text={content} />
            )}
          </div>
        )}

        <div className={`flex items-center gap-1.5 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          {!isUser && !degraded && (
            <button
              type="button"
              onClick={handleCopy}
              className="grid h-7 w-7 place-items-center rounded-full text-[0.62rem] text-subtle opacity-0 transition-all hover:bg-paper-2 hover:text-ink group-hover:opacity-100"
              aria-label={copied ? "Copied" : "Copy response"}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
          {degraded && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(id)}
              className="grid h-7 w-7 place-items-center rounded-full text-[0.62rem] text-subtle opacity-0 transition-all hover:bg-paper-2 hover:text-ink group-hover:opacity-100"
              aria-label="Retry"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}