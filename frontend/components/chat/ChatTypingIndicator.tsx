"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export function TypingDots() {
  return (
    <div className="flex items-center gap-2.5 px-4">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-[0.45rem] font-bold text-paper shadow-sm">
        IV
      </div>
      <div className="flex h-8 items-center gap-1 rounded-xl rounded-tl-sm bg-paper-2 px-3.5 py-2 shadow-xs">
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
  const [revealed, setRevealed] = useState(active ? 0 : Infinity);
  const linesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!active || !text) {
      setRevealed(Infinity);
      return;
    }

    const lines = text.split("\n");
    linesRef.current = lines;
    setRevealed(0);

    let idx = 0;
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      idx++;
      setRevealed(idx);
      if (idx < lines.length) {
        const cur = lines[idx]?.trim() ?? "";
        const delay = !cur ? 20 : cur.length < 40 ? 60 : cur.length < 100 ? 100 : 150;
        setTimeout(tick, delay);
      }
    }

    const startDelay = setTimeout(tick, 350);
    return () => {
      cancelled = true;
      clearTimeout(startDelay);
    };
  }, [text, active]);

  return {
    revealCount: revealed,
    isDone: revealed >= linesRef.current.length,
  };
}