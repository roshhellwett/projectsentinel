import { PageShell } from '@/components/layout/PageShell';
import { FeedSkeleton } from '@/components/news/InfiniteFeed';

export default function SavedLoading() {
  return (
    <PageShell>
      <div className="mb-6 h-8 w-20 bg-rule/60 rounded animate-pulse" />

      <div className="mb-10 pb-8 border-b border-rule animate-pulse">
        <div className="w-12 h-[2px] bg-accent rounded-full mb-5" />
        <div className="h-3 w-24 bg-rule/60 rounded mb-3" />
        <div className="h-10 w-56 bg-rule/60 rounded mb-4" />
        <div className="h-5 w-full max-w-xl bg-rule/40 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <FeedSkeleton />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
