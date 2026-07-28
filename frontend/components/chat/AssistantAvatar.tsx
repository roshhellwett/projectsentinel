"use client";

import Image from "next/image";

export function AssistantAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-full border border-rule/70 bg-paper-2 shadow-sm ${className}`}>
      <Image
        src="/bot.webp"
        alt="India Verified assistant"
        width={32}
        height={32}
        className="h-full w-full object-cover"
        priority={false}
      />
    </div>
  );
}
