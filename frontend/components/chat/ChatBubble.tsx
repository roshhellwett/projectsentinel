"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext } from "@/components/chat/ChatContext";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; degraded?: boolean };

const GREETING =
  "Hello. I'm the India Verified desk assistant. Ask me about any story we've published, how our credibility scores work, or how to find your way around the site.";

const PROMPTS = [
  "What's new today?",
  "How is the credibility score decided?",
  "Latest in tech",
] as const;

const CONTEXTUAL_PROMPTS = [
  "Is this news true?",
  "Summarize this story",
  "Show related stories",
] as const;

const MAX_CHARS = 800;
const HISTORY_TURNS = 8;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function AssistantText({ text }: { text: string }) {
  const cleanText = text.replace(/\(\/news\/([0-9a-fA-F-]{36})\)/g, '/news/$1');
  const lines = cleanText.split('\n');

  return (
    <div className="flex flex-col gap-3.5">
      {lines.map((line, i) => {
        if (!line.trim()) return null;

        const isList = line.trim().startsWith('* ') || line.trim().startsWith('- ');
        const content = isList ? line.trim().substring(2) : line;

        const parts = content.split(/(\/news\/[0-9a-fA-F-]{36}|\*\*.*?\*\*)/g);

        const renderedContent = parts.map((part, j) => {
          if (/^\/news\/[0-9a-fA-F-]{36}$/.test(part)) {
            return (
              <Link
                key={j}
                href={part}
                className="mt-1 mb-1 ml-2 inline-flex items-center justify-center rounded-full bg-ink px-3.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent align-middle"
              >
                Read Story
                <svg className="ml-1.5 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            );
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
          }
          
          if (isList && j === 0 && part.includes(':')) {
            const colonIndex = part.indexOf(':');
            return (
              <span key={j}>
                <strong className="font-semibold text-ink">
                  {part.substring(0, colonIndex + 1)}
                </strong>
                {part.substring(colonIndex + 1)}
              </span>
            );
          }

          return <span key={j}>{part}</span>;
        });

        if (isList) {
          return (
            <div key={i} className="relative pl-5 before:absolute before:left-0.5 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent">
              <p className="text-[0.875rem] leading-[1.65] text-ink-soft">
                {renderedContent}
              </p>
            </div>
          );
        }

        return (
          <p key={i} className="text-[0.875rem] leading-[1.65] text-ink-soft">
            {renderedContent}
          </p>
        );
      })}
    </div>
  );
}

export function ChatBubble() {
  const { activeArticle } = useChatContext();
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

      const displayMessage = text;
      const backendMessage = activeArticle
        ? `[Context: Regarding the article "${activeArticle.headline}" (ID: ${activeArticle.id})]\n${text}`
        : text;

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: displayMessage },
      ]);
      setInput("");
      setBusy(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: backendMessage, history }),
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
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] right-4 z-[75] grid place-items-center rounded-full border border-[rgb(var(--c-ink))] bg-[rgb(var(--c-paper))] text-[rgb(var(--c-ink))] shadow-[0_6px_24px_-8px_rgb(var(--c-shadow)/0.45)] transition-transform duration-300 [transition-timing-function:var(--ease-apple)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--c-ink))] active:scale-95 sm:bottom-6 sm:right-6"
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
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          id="iv-chat-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="India Verified desk assistant"
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+8.25rem)] right-3 z-[74] flex w-[min(23rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-lg border border-[rgb(var(--c-rule-strong))] bg-[rgb(var(--c-paper-tint))]/85 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_24px_60px_-24px_rgb(var(--c-shadow)/0.55)] sm:bottom-24 sm:right-6"
          style={{ maxHeight: "min(32rem, calc(100dvh - 11rem))" }}
        >
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[rgb(var(--c-rule))] bg-[rgb(var(--c-paper))]/70 px-4 py-3 backdrop-blur-md">
            <div className="min-w-0">
              <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--c-muted))]">
                India Verified
              </p>
              <h2 className="truncate text-[0.95rem] font-bold leading-snug">
                Desk Assistant
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[rgb(var(--c-rule))] bg-[rgb(var(--c-paper))] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-[rgb(var(--c-muted))]">
              Read-only
            </span>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4"
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={m.role === "user" ? "flex justify-end" : "flex gap-2.5"}
                >
                  {m.role === "assistant" && (
                    <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[0.45rem] font-bold text-paper shadow-sm">
                      IV
                    </div>
                  )}

                  {m.role === "user" ? (
                    <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-ink px-3.5 py-2 text-[0.85rem] leading-relaxed text-paper shadow-md">
                      {m.content}
                    </p>
                  ) : (
                    <div
                      className={`min-w-0 flex-1 whitespace-pre-wrap break-words text-[0.875rem] leading-[1.65] ${
                        m.degraded
                          ? "text-muted italic"
                          : "text-ink"
                      }`}
                    >
                      <AssistantText text={m.content} />
                    </div>
                  )}
                </motion.div>
              ))}

              {busy && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2.5"
                >
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[0.45rem] font-bold text-paper shadow-sm">
                    IV
                  </div>
                  <div className="flex h-8 items-center space-x-1.5 rounded-2xl rounded-tl-sm bg-paper-2 px-3.5 py-2 shadow-sm w-fit">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-accent"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.length === 1 && !busy && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2 pt-1 pl-[2.125rem]"
              >
                {(activeArticle ? CONTEXTUAL_PROMPTS : PROMPTS).map((p) => (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
                    className="relative overflow-hidden rounded-full border border-rule bg-gradient-to-br from-paper to-[rgb(var(--c-paper-2))] px-3 py-1.5 text-[0.7rem] font-medium text-ink-soft shadow-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {p}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-[rgb(var(--c-rule))] bg-[rgb(var(--c-paper))]/70 backdrop-blur-md px-3 py-2.5"
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
        </motion.div>
      )}
    </>
  );
}

export default ChatBubble;
