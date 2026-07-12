"use client";

import { Z_INDEX } from "@/lib/theme/zIndex";
import { useEffect, useRef } from "react";

interface ReadingProgressProps {
  targetSelector?: string;
}

export function ReadingProgress({ targetSelector }: ReadingProgressProps = {}) {
  const barRef = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const compute = () => {
      const target = targetSelector
        ? (document.querySelector(targetSelector) as HTMLElement | null)
        : null;

      const scrolled = window.scrollY;
      let total: number;

      if (target) {
        const rect = target.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementHeight = rect.height;
        const viewport = window.innerHeight;
        total = Math.max(1, elementHeight + elementTop - viewport);
      } else {
        total = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
      }

      const ratio = Math.max(0, Math.min(1, scrolled / total));
      const visible = ratio > 0.005 && ratio < 0.995;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${ratio})`;
        barRef.current.style.opacity = visible ? "1" : "0";
        barRef.current.style.willChange = visible
          ? "transform, opacity"
          : "auto";
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        compute();
        tickingRef.current = false;
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetSelector]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 ${Z_INDEX.readingProgress} h-[2px] pointer-events-none`}
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}
    >
      <div
        ref={barRef}
        className="h-full origin-left transition-opacity duration-300 transform-gpu"
        style={{
          transform: "scaleX(0)",
          opacity: 0,
          background:
            "linear-gradient(to right, rgb(var(--c-accent-hover)), rgb(var(--c-accent)), rgb(var(--c-accent-hover)))",
          boxShadow: "0 0 12px rgb(var(--c-accent) / 0.55)",
        }}
      />
    </div>
  );
}
