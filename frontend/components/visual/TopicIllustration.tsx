import type { Category } from "@/types";
import { CATEGORY_MATERIALS, CategoryIcon, materialStyle } from "./MaterialIcon";
import { cn } from "@/lib/utils/cn";

/** A category emblem, rather than an image purporting to depict a news event. */
export function TopicIllustration({ category, compact = false, className = "" }: { category: string; compact?: boolean; className?: string }) {
  const tone = CATEGORY_MATERIALS[category as Category]?.tone ?? "neutral";
  return (
    <div className={cn("topic-illustration", compact && "topic-illustration--compact", className)} style={materialStyle(tone)} aria-hidden="true">
      <span className="topic-illustration__light" />
      <span className="topic-illustration__sheet topic-illustration__sheet--back" />
      <span className="topic-illustration__sheet topic-illustration__sheet--front"><span /><span /><span /></span>
      <CategoryIcon category={category} size="lg" className="topic-illustration__icon" />
      <svg className="topic-illustration__spark" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="4" stroke="currentColor" /></svg>
      <span className="topic-illustration__dot" />
    </div>
  );
}
