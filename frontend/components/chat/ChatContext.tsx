"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Post } from "@/types";

interface ChatContextType {
  activeArticle: Post | null;
  setActiveArticle: (post: Post | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeArticle, setActiveArticle] = useState<Post | null>(null);

  return (
    <ChatContext.Provider value={{ activeArticle, setActiveArticle }}>
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
