"use client";

import Link from "next/link";
import { Post } from "@/types";
import { Z_INDEX } from "@/lib/theme/zIndex";
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback";

interface NewsTickerClientProps {
  posts: Post[];
}

export function NewsTickerClient({ posts }: NewsTickerClientProps) {
  const haptic = useHapticFeedback();
  
  // Duplicate the posts to ensure a smooth continuous loop
  const tickerItems = [...posts, ...posts, ...posts];

  return (
    <div className={`sticky top-12 sm:top-14 lg:top-16 ${Z_INDEX.stickyNav} w-full bg-paper/80 backdrop-blur-md text-ink flex items-center h-9 sm:h-10 overflow-hidden border-b border-rule z-30 transform-gpu`}>
      <div className="bg-ink text-paper font-display font-bold px-3 sm:px-4 h-full flex items-center shrink-0 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.1)] uppercase tracking-wider text-xs sm:text-sm">
        Live News
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
         <div className="flex animate-ticker hover:[animation-play-state:paused] whitespace-nowrap h-full items-center">
           {tickerItems.map((p, i) => (
              <span key={`${p.id}-${i}`} className="flex items-center mx-6 sm:mx-10 shrink-0">
                 <span className="w-1.5 h-1.5 rounded-full bg-ink mr-2.5 animate-pulse" />
                 <span className="text-ink-soft uppercase tracking-wider text-[10px] sm:text-xs font-bold mr-2 sm:mr-3 font-mono">
                   {p.category}
                 </span>
                 <Link 
                   href={`/news/${p.id}/`} 
                   onClick={() => haptic.light()}
                   className="text-xs sm:text-sm font-medium hover:underline hover:text-ink/70 transition-colors duration-fast font-body text-ink"
                 >
                   {p.headline}
                 </Link>
              </span>
           ))}
         </div>
      </div>
    </div>
  );
}
