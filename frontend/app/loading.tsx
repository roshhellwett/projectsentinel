// last edited 2026-05-17 by roshhellwett

import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-9 overflow-hidden rounded-md border border-rule bg-paper px-6 py-8 md:px-10 md:py-10">
        <Skeleton className="mb-4 h-3 w-48 rounded-full" />
        <Skeleton className="mb-4 h-12 w-full max-w-2xl rounded-md md:h-16" />
        <Skeleton className="h-5 w-full max-w-xl rounded-full" />
      </div>

      <div className="flex gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      <div className="mb-12">
        <Skeleton className="h-[340px] lg:h-[420px] w-full rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[218px] rounded-md" />
        ))}
      </div>
    </div>
  );
}
