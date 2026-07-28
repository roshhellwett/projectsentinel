"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { canSubmitChatMessage } from "@/components/chat/chatUtils";

const MAX_CHARS = 800;

export function ChatInput({
  value,
  onChange,
  onSend,
  busy,
  placeholder = "Ask about a story…",
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  placeholder?: string;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 7 * 1.4 * 0.875 * 16;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [autoResize, value]);

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSubmitChatMessage(value, busy)) onSend();
      }
    },
    [busy, onSend, value],
  );

  const charsLeft = MAX_CHARS - value.length;
  const canSubmit = canSubmitChatMessage(value, busy);

  return (
    <div className="border-t border-rule/80 bg-paper/95 px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-xl sm:px-5 sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-[1.25rem] border border-rule/70 bg-paper-2/80 p-2 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.25)] sm:p-2.5">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              onKeyDown={handleKey}
              placeholder={placeholder}
              maxLength={MAX_CHARS}
              rows={1}
              disabled={busy}
              className="min-h-[46px] w-full resize-none overflow-hidden rounded-[1rem] border border-rule/70 bg-paper px-3.5 py-3 text-[0.95rem] leading-6 text-ink shadow-inner shadow-paper-2/60 placeholder:text-subtle/70 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:opacity-60 sm:min-h-[50px] sm:py-3.5"
            />
            {value.length > MAX_CHARS * 0.85 && (
              <span
                className={`pointer-events-none absolute bottom-2 right-2 text-[0.64rem] font-mono ${
                  charsLeft < 20 ? "text-red-500" : "text-subtle"
                }`}
              >
                {charsLeft}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (canSubmit) onSend();
            }}
            disabled={!canSubmit}
            aria-label="Send message"
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-ink text-paper shadow-[0_10px_24px_-10px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:bg-ink"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="px-2 text-[0.68rem] leading-relaxed text-subtle sm:text-[0.7rem]">
          Answers come from published India Verified stories. Always check the sources on the story page.
        </p>
      </div>
    </div>
  );
}