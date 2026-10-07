import type { CSSProperties } from "react";
import { Landmark, TrendingUp, Trophy, ShieldCheck, Atom, HeartPulse, Cpu, Globe2, Clapperboard, GraduationCap, Newspaper, type LucideIcon } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils/cn";

export type MaterialTone = "coral" | "sage" | "sky" | "violet" | "gold" | "neutral";

const TONES: Record<MaterialTone, { color: string; tint: string }> = {
  coral: { color: "174 63 43", tint: "249 218 203" },
  sage: { color: "39 103 76", tint: "211 234 218" },
  sky: { color: "47 97 154", tint: "213 229 252" },
  violet: { color: "110 71 153", tint: "230 217 247" },
  gold: { color: "143 94 27", tint: "246 229 187" },
  neutral: { color: "74 88 100", tint: "224 233 238" },
};

export const CATEGORY_MATERIALS: Record<Category, { icon: LucideIcon; tone: MaterialTone }> = {
  politics: { icon: Landmark, tone: "coral" },
  business: { icon: TrendingUp, tone: "sage" },
  sports: { icon: Trophy, tone: "gold" },
  crime: { icon: ShieldCheck, tone: "neutral" },
  science: { icon: Atom, tone: "violet" },
  health: { icon: HeartPulse, tone: "coral" },
  tech: { icon: Cpu, tone: "sky" },
  world: { icon: Globe2, tone: "sky" },
  entertainment: { icon: Clapperboard, tone: "violet" },
  education: { icon: GraduationCap, tone: "gold" },
};

export function materialStyle(tone: MaterialTone): CSSProperties {
  return { "--material-color": TONES[tone].color, "--material-tint": TONES[tone].tint } as CSSProperties;
}

export function MaterialIcon({ icon: Icon, tone = "coral", size = "md", className = "" }: { icon: LucideIcon; tone?: MaterialTone; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  return (
    <span className={cn("material-icon", `material-icon--${size}`, className)} style={materialStyle(tone)} aria-hidden="true">
      <span className="material-icon__reflection" />
      <Icon strokeWidth={1.65} />
    </span>
  );
}

export function CategoryIcon({ category, size = "sm", className }: { category: string; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  const material = CATEGORY_MATERIALS[category as Category] ?? { icon: Newspaper, tone: "neutral" as const };
  return <MaterialIcon {...material} size={size} className={className} />;
}
