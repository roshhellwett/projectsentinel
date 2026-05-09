/**
 * Root loading skeleton
 */

import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category pills skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      
      {/* Featured skeleton */}
      <div className="mb-12">
        <Skeleton className="h-[340px] lg:h-[380px] w-full rounded-3xl" />
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[240px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
