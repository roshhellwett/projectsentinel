import { Suspense } from 'react';
import { searchPosts } from '@/lib/supabase/server';
import { SearchResultsGrid } from '@/components/news/SearchResultsGrid';
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
        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
          <SearchX className="w-7 h-7 text-zinc-500" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">No results found</h2>
        <p className="text-sm text-zinc-500 max-w-sm">
          No verified stories matched &ldquo;{query}&rdquo;. Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-400 mb-6">
        {count} result{count !== 1 ? 's' : ''} for &ldquo;
        <span className="font-semibold text-white">{query}</span>&rdquo;
      </p>
      <SearchResultsGrid posts={posts} />
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  return (
    <div className="container mx-auto px-4 lg:px-6 pt-10 pb-12 max-w-6xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-2">
          {query ? 'Search Results' : 'Search'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-2">
          {query ? query : 'Find verified news'}
        </h1>
      </div>

      {query ? (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-shimmer"
                />
              ))}
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <p className="text-zinc-400">
          Use the search button in the top navigation to find verified news.
        </p>
      )}
    </div>
  );
}
