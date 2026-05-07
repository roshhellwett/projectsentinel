/**
 * Root loading skeleton
 */

import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-12">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
