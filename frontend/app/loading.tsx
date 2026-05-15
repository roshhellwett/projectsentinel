/**
 * Root loading skeleton
 */

import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-9 overflow-hidden rounded-[2rem] border border-slate-950/[0.08] bg-white/60 px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl md:px-10 md:py-10">
        <Skeleton className="mb-4 h-3 w-48 rounded-full" />
        <Skeleton className="mb-4 h-12 w-full max-w-2xl rounded-2xl md:h-16" />
        <Skeleton className="h-5 w-full max-w-xl rounded-full" />
      </div>

      {/* Category pills skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      
      {/* Featured skeleton */}
      <div className="mb-12">
        <Skeleton className="h-[340px] lg:h-[420px] w-full rounded-[2rem]" />
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[218px] rounded-[1.65rem]" />
        ))}
      </div>
    </div>
  );
}
