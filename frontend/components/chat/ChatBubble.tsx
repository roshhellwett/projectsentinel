"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; degraded?: boolean };

const GREETING =
  "Hello. I'm the India Verified desk assistant. Ask me about any story we've published, how our credibility scores work, or how to find your way around the site.";

const PROMPTS = [
  "What's new today?",
  "How is the credibility score decided?",
  "Latest in tech",
] as const;

const MAX_CHARS = 800;
const HISTORY_TURNS = 8;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Renders assistant text as plain text plus internal /news/<id> links only.
 * No HTML is ever interpreted, so model output can never inject markup.
 */
function AssistantText({ text }: { text: string }) {
  const parts = text.split(/(\/news\/[0-9a-fA-F-]{36})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\/news\/[0-9a-fA-F-]{36}$/.test(part) ? (
          <Link
            key={i}
            href={part}
            className="underline decoration-ink/30 underline-offset-2 hover:decoration-ink"
          >
            read the story
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: GREETING },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_CHARS);
      if (!text || busy) return;

      const history = messages
        .filter((m) => m.id !== "greeting")
        .slice(-HISTORY_TURNS)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: text },
      ]);
      setInput("");
      setBusy(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history }),
        });
        const data = (await res.json()) as {
          reply?: string;
          degraded?: boolean;
        };
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: data.reply || "Some error occurred, wait for a while",
            degraded: Boolean(data.degraded),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "Some error occurred, wait for a while",
            degraded: true,
          },
        ]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages],
  );

  return (
    <>
      {/* Launcher */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="iv-chat-panel"
        aria-label={
          open ? "Close the desk assistant" : "Ask the desk assistant"
        }
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] right-4 z-[60] grid place-items-center rounded-full border border-[rgb(var(--c-ink))] bg-[rgb(var(--c-paper))] text-[rgb(var(--c-ink))] shadow-[0_6px_24px_-8px_rgb(var(--c-shadow)/0.45)] transition-transform duration-300 [transition-timing-function:var(--ease-apple)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--c-ink))] active:scale-95 sm:bottom-6 sm:right-6"
        style={{ height: "3.25rem", width: "3.25rem" }}
      >
        <span className="sr-only">Desk assistant</span>
        {open ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
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
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          id="iv-chat-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="India Verified desk assistant"
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+8.25rem)] right-3 z-[59] flex w-[min(23rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-lg border border-[rgb(var(--c-rule-strong))] bg-[rgb(var(--c-paper-tint))] shadow-[0_24px_60px_-24px_rgb(var(--c-shadow)/0.55)] sm:bottom-24 sm:right-6"
          style={{ maxHeight: "min(32rem, calc(100dvh - 11rem))" }}
        >
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[rgb(var(--c-rule))] bg-[rgb(var(--c-paper))] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--c-muted))]">
                India Verified
              </p>
              <h2 className="truncate text-[0.95rem] font-bold leading-snug">
                Desk Assistant
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[rgb(var(--c-rule))] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-[rgb(var(--c-muted))]">
              Read-only
            </span>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : ""}
              >
                {m.role === "user" ? (
                  <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-md rounded-br-sm bg-[rgb(var(--c-ink))] px-3 py-2 text-[0.85rem] leading-relaxed text-[rgb(var(--c-paper))]">
                    {m.content}
                  </p>
                ) : (
                  <p
                    className={`max-w-full whitespace-pre-wrap break-words text-[0.875rem] leading-[1.65] ${
                      m.degraded
                        ? "text-[rgb(var(--c-muted))] italic"
                        : "text-[rgb(var(--c-ink))]"
                    }`}
                  >
                    <AssistantText text={m.content} />
                  </p>
                )}
              </div>
            ))}

            {busy && (
              <p
                className="text-[0.8rem] italic text-[rgb(var(--c-muted))]"
                aria-live="polite"
              >
                Checking the desk…
              </p>
            )}

            {messages.length === 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
                    className="rounded-full border border-[rgb(var(--c-rule-strong))] px-3 py-1.5 text-[0.75rem] text-[rgb(var(--c-ink-soft))] transition-colors hover:bg-[rgb(var(--c-ink))] hover:text-[rgb(var(--c-paper))]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-[rgb(var(--c-rule))] bg-[rgb(var(--c-paper))] px-3 py-2.5"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
              <label htmlFor="iv-chat-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="iv-chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_CHARS}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask about a story…"
                className="max-h-24 min-w-0 resize-none bg-transparent px-1 py-2 text-[0.875rem] leading-relaxed placeholder:text-[rgb(var(--c-subtle))] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send question"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgb(var(--c-ink))] text-[rgb(var(--c-paper))] transition-opacity disabled:opacity-30"
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
            <p className="px-1 pt-1 text-[0.65rem] leading-snug text-[rgb(var(--c-subtle))]">
              Answers come from published India Verified stories. Always check
              the sources on the story page.
            </p>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBubble;
