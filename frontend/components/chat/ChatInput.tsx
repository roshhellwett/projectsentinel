"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";

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
    el.style.height = `${Math.min(el.scrollHeight, 7 * 1.4 * 0.875 * 16)}px`;
  }, []);

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  const charsLeft = MAX_CHARS - value.length;

  return (
    <div className="border-t border-rule bg-paper/80 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] pt-2.5 backdrop-blur-md">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <div className="relative">
          <textarea
            ref={textRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKey}
            placeholder={placeholder}
            maxLength={MAX_CHARS}
            rows={1}
            disabled={busy}
            className="max-h-44 min-w-0 resize-none bg-transparent px-2 py-2 text-[0.875rem] leading-relaxed placeholder:text-subtle/60 focus:outline-none disabled:opacity-50"
          />
          {value.length > MAX_CHARS * 0.85 && (
            <span
              className={`pointer-events-none absolute bottom-1.5 right-2 text-[0.6rem] font-mono ${
                charsLeft < 20 ? "text-red-500" : "text-subtle"
              }`}
            >
              {charsLeft}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={busy || !value.trim()}
          aria-label="Send message"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-90 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          <svg
            width="16"
            height="16"
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
      <p className="px-1 pt-1 text-[0.65rem] leading-snug text-subtle">
        Answers come from published India Verified stories. Always check the sources on the story page.
      </p>
    </div>
  );
}