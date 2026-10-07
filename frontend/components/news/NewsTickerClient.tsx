"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { Post } from "@/types";

export function NewsTickerClient({ posts }: { posts: Post[] }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="newswire flex items-center h-10 border-b border-rule bg-paper-2/60 overflow-hidden" aria-label="Latest headlines">
      <span className="flex items-center h-full px-4 sm:px-6 text-[9px] font-mono tracking-[0.12em] uppercase text-accent bg-paper-2 shrink-0 border-r border-rule">Just in</span>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="newswire__track flex w-max animate-ticker hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]" style={{ animationDuration: "80s", animationPlayState: paused ? "paused" : undefined }}>
          {[0, 1, 2].map(copy => (
            <div key={copy} className={`flex shrink-0 items-center ${copy ? "ticker-clone" : ""}`} aria-hidden={copy ? true : undefined}>
              {posts.map(post => <Link key={post.id} href={`/news/${post.id}`} tabIndex={copy ? -1 : undefined} className="flex items-center gap-3 whitespace-nowrap px-7 text-[11px] min-h-[40px] hover:text-accent"><span className="font-mono text-[8px] uppercase text-muted">{post.category}</span><span>{post.headline}</span><span aria-hidden="true" className="text-accent ml-4">✳</span></Link>)}
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="inline-flex min-w-[44px] min-h-[40px] items-center justify-center border-l border-rule bg-paper-2 text-muted hover:text-ink" onClick={() => setPaused(value => !value)} aria-label={paused ? "Resume headlines" : "Pause headlines"} aria-pressed={paused}>{paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}</button>
    </div>
  );
}
