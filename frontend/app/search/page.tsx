import { Suspense } from 'react';
import { searchPosts } from '@/lib/supabase/server';
import { NewsGrid } from '@/components/news/NewsGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchX } from 'lucide-react';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" — India Verified` : 'Search — India Verified',
    description: q ? `Search results for "${q}" on India Verified.` : 'Search verified Indian news.',
    robots: { index: false, follow: false },
  };
}

async function SearchResults({ query }: { query: string }) {
  const { posts, count } = await searchPosts(query, 30);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          No verified stories matched &ldquo;{query}&rdquo;. Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {count} result{count !== 1 ? 's' : ''} for &ldquo;<span className="font-semibold text-slate-700 dark:text-slate-300">{query}</span>&rdquo;
      </p>
      <NewsGrid posts={posts} />
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {query ? `Search results` : 'Search'}
        </h1>
        {query && (
          <p className="text-slate-500 dark:text-slate-400">
            Showing verified news for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {query ? (
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-xl animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        }>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          Use the search bar in the top navigation to find verified news.
        </p>
      )}
    </div>
  );
}
