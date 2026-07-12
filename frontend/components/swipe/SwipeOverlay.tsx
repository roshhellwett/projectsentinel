"use client";

import { ArrowRight, ArrowDown, ArrowUp, Undo2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { safeRead, safeWrite } from "@/lib/utils/safeStorage";
import { Z_INDEX } from "@/lib/theme/zIndex";
import { useI18n } from "@/lib/i18n/context";

interface SwipeOverlayProps {
  dragX: MotionValue<number>;
  dragY: MotionValue<number>;
  canRewind?: boolean;
}

const TRIGGER = 110;
const SEEN_KEY = "iv:swipe:overlaySeen:v1";

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function SwipeOverlay({
  dragX,
  dragY,
  canRewind = true,
}: SwipeOverlayProps) {
  const { t } = useI18n();
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    setHasSeen(safeRead(SEEN_KEY) === "true");
  }, []);

  const lastSeenCheck = useRef(0);

  const checkSeen = (val: number) => {
    if (hasSeen) return;
    if (
      Math.abs(val) > TRIGGER * 0.6 &&
      lastSeenCheck.current < Date.now() - 500
    ) {
      lastSeenCheck.current = Date.now();
      safeWrite(SEEN_KEY, true);
      setHasSeen(true);
    }
  };

  useMotionValueEvent(dragX, "change", checkSeen);
  useMotionValueEvent(dragY, "change", checkSeen);

  if (hasSeen) return null;

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${Z_INDEX.dropdown} touch-manipulation`}
    >
      <Badge
        label={t("swipe.next")}
        icon={<ArrowRight className="w-4 h-4" />}
        dragVal={dragX}
        range={[0, TRIGGER]}
        position="right"
        accent="border-accent text-accent bg-paper"
      />
      <Badge
        label={t("swipe.previous")}
        icon={<Undo2 className="w-4 h-4" />}
        dragVal={dragX}
        range={[0, -TRIGGER]}
        position="left"
        accent="border-rule-strong text-ink bg-paper/70 backdrop-blur-sm"
        disabled={!canRewind}
      />
      <Badge
        label={t("swipe.next")}
        icon={<ArrowUp className="w-4 h-4" />}
        dragVal={dragY}
        range={[0, -TRIGGER]}
        position="top"
        accent="border-accent text-accent bg-paper/70 backdrop-blur-sm"
      />
      <Badge
        label={t("swipe.previous")}
        icon={<ArrowDown className="w-4 h-4" />}
        dragVal={dragY}
        range={[0, TRIGGER]}
        position="bottom"
        accent="border-rule-strong text-ink bg-paper/70 backdrop-blur-sm"
        disabled={!canRewind}
      />
    </motion.div>
  );
}

type BadgePosition = "left" | "right" | "top" | "bottom";

const POSITION_STYLE: Record<BadgePosition, React.CSSProperties> = {
  right: { top: "50%", right: "1.25rem", transform: "translateY(-50%)" },
  left: { top: "50%", left: "1.25rem", transform: "translateY(-50%)" },
  bottom: { bottom: "1.5rem", left: "50%", transform: "translateX(-50%)" },
  top: { top: "1.5rem", left: "50%", transform: "translateX(-50%)" },
};

function Badge({
  label,
  icon,
  dragVal,
  range,
  position,
  accent,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  dragVal: MotionValue<number>;
  range: [number, number];
  position: BadgePosition;
  accent: string;
  disabled?: boolean;
}) {
  const opacity = useTransform(dragVal, range, [0, disabled ? 0 : 1]);
  const scale = useTransform(opacity, [0, 1], [0.9, 1]);
  const base = POSITION_STYLE[position];

  return (
    <motion.div
      className={`absolute inline-flex items-center gap-2 px-3 py-1.5 border-2 rounded-md text-[11px] font-bold uppercase tracking-[0.18em] shadow-paper-lift will-change-transform transform-gpu ${accent}`}
      style={{ ...base, opacity, scale }}
    >
      {icon}
      <span>{label}</span>
    </motion.div>
  );
}
