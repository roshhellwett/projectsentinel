"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { AssistantAvatar } from "@/components/chat/AssistantAvatar";

export function TypingDots() {
  return (
    <div className="flex items-center gap-2.5 self-start px-1 sm:px-0">
      <div className="mt-0.5 shrink-0">
        <AssistantAvatar className="h-8 w-8" />
      </div>
      <div className="flex h-10 items-center gap-1 rounded-[1.1rem] rounded-tl-sm border border-rule/80 bg-paper-2/90 px-3.5 py-2.5 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.28)]">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent/60"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function useTypewriter(
  text: string,
  active: boolean,
): { revealCount: number; isDone: boolean } {
  const [revealed, setRevealed] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active || !text) {
      setRevealed(text.length);
      return;
    }

    setRevealed(0);

    let idx = 0;
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      idx += 1;
      setRevealed(idx);
      if (idx < text.length) {
        const ch = text[idx] ?? "";
        const delay = ch === " " ? 32 : /[.!?,;:]/.test(ch) ? 80 : /[\n]/.test(ch) ? 70 : 25;
        window.setTimeout(tick, delay);
      }
    }

    const startDelay = window.setTimeout(tick, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(startDelay);
    };
  }, [text, active]);

  return {
    revealCount: active ? revealed : text.length,
    isDone: !active ? true : revealed >= text.length,
  };
}