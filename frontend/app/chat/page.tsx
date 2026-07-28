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
    if (el) el.scrollTop = el.scrollHeight;
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
      const placeholderId = uid();
      const placeholder: Message = {
        id: placeholderId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMsg, placeholder]);
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

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  ...m,
                  content: data.reply || "Some error occurred, wait for a while",
                  degraded: Boolean(data.degraded),
                }
              : m,
          ),
        );
        setWaiting(false);
        setTypingId(placeholderId);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, content: "Some error occurred, wait for a while", status: "error" as const, degraded: true }
              : m,
          ),
        );
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
    <div className="mx-auto flex min-h-dynamic w-full max-w-3xl flex-col bg-paper">
      <ChatHeader onClear={clearMessages} messageCount={messages.length} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        {showWelcome ? (
          <ChatWelcome onPrompt={handlePrompt} hasArticleContext={!!activeArticle} />
        ) : (
          <div className="flex flex-col gap-4 px-4 py-5">
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
  );
}