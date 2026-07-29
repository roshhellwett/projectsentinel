"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useChatContext, type Message } from "@/components/chat/ChatContext";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatWelcome } from "@/components/chat/ChatWelcome";
import { TypingDots, useTypewriter } from "@/components/chat/ChatTypingIndicator";

const HISTORY_TURNS = 8;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPage() {
  const { activeArticle, messages, setMessages, clearMessages } = useChatContext();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const typingMsg = typingId ? messages.find((m) => m.id === typingId) : undefined;
  const { revealCount, isDone } = useTypewriter(typingMsg?.content ?? "", !!typingId);

  useEffect(() => {
    if (isDone && typingId) {
      setTypingId(null);
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, status: "complete" as const } : m)),
      );
    }
  }, [isDone, typingId, setMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const tick = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    return () => window.cancelAnimationFrame(tick);
  }, [messages, typingId, revealCount]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 800);
      if (!text || busy) return;

      const history = messages
        .filter((m) => m.id !== "greeting" && m.status !== "error")
        .slice(-HISTORY_TURNS)
        .map((m) => ({ role: m.role, content: m.content }));

      const backendMessage = activeArticle
        ? `[Context: Regarding the article "${activeArticle.headline}" (ID: ${activeArticle.id})]\n${text}`
        : text;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: text,
        timestamp: Date.now(),
        status: "complete",
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setBusy(true);
      setWaiting(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: backendMessage, history }),
        });
        const data = (await res.json()) as { reply?: string; degraded?: boolean };

        const placeholderId = uid();
        setMessages((prev) => [
          ...prev,
          {
            id: placeholderId,
            role: "assistant",
            content: data.reply || "Some error occurred, wait for a while",
            timestamp: Date.now(),
            status: "sending",
            degraded: Boolean(data.degraded),
          }
        ]);
        setWaiting(false);
        setTypingId(placeholderId);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "Some error occurred, wait for a while",
            timestamp: Date.now(),
            status: "error",
            degraded: true,
          }
        ]);
        setWaiting(false);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, activeArticle, setMessages],
  );

  const retryMessage = useCallback(
    (id: string) => {
      const failed = messages.find((m) => m.id === id);
      if (!failed) return;
      const previousUser = [...messages]
        .reverse()
        .find((m) => m.role === "user" && m.timestamp < failed.timestamp);
      if (!previousUser) return;
      setMessages((prev) => prev.filter((m) => m.id !== id || m.id === previousUser.id));
      send(previousUser.content);
    },
    [messages, send, setMessages],
  );

  const handlePrompt = useCallback((text: string) => void send(text), [send]);

  const showWelcome = messages.length === 1 && messages[0].id === "greeting" && !busy;
  const hasError = messages.some((m) => m.status === "error");

  return (
    <div className="mx-auto flex h-dynamic min-h-dynamic w-full max-w-5xl flex-col px-0 py-0 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-paper/95 shadow-none sm:rounded-[1.75rem] sm:border sm:border-rule/70 sm:shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]">
        <ChatHeader onClear={clearMessages} messageCount={messages.length} />

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.03),transparent_45%)] px-3 py-4 sm:px-5 sm:py-5">
          {showWelcome ? (
            <div className="flex h-full items-center justify-center px-1 py-2 sm:px-2">
              <ChatWelcome onPrompt={handlePrompt} hasArticleContext={!!activeArticle} />
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  if (m.id === "greeting" && messages.length > 1) return null;
                  const isTyping = m.id === typingId;

                  return (
                    <ChatMessage
                      key={m.id}
                      id={m.id}
                      role={m.role}
                      content={m.content}
                      degraded={m.degraded}
                      typewriter={isTyping}
                      typewriterReveal={isTyping ? revealCount : undefined}
                      onRetry={hasError ? retryMessage : undefined}
                    />
                  );
                })}
              </AnimatePresence>

              {waiting && <TypingDots />}
            </div>
          )}
        </div>

        <ChatInput value={input} onChange={setInput} onSend={() => send(input)} busy={busy} />
      </div>
    </div>
  );
}