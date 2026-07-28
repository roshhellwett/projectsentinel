"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Post } from "@/types";

export type MessageStatus = "sending" | "complete" | "error";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status: MessageStatus;
  degraded?: boolean;
};

interface ChatContextType {
  activeArticle: Post | null;
  setActiveArticle: (post: Post | null) => void;
  clearMessages: () => void;
  messages: Message[];
  setMessages: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "Hello. I'm the India Verified desk assistant. Ask me about any story we've published, how our credibility scores work, or how to find your way around the site.",
  timestamp: Date.now(),
  status: "complete",
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeArticle, setActiveArticle] = useState<Post | null>(null);
  const [messages, setMessages] = useState<Message[]>([GREETING]);

  const clearMessages = useCallback(() => {
    setMessages([{ ...GREETING, timestamp: Date.now() }]);
  }, []);

  return (
    <ChatContext.Provider
      value={{ activeArticle, setActiveArticle, clearMessages, messages, setMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}