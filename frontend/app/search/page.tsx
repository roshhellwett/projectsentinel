// last edited 2026-05-17 by roshhellwett

import { Suspense } from 'react';
import { searchPosts } from '@/lib/supabase/server';
import { SearchResultsGrid } from '@/components/news/SearchResultsGrid';
import { dedupe } from '@/lib/utils/dedupe';
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
  const { posts: raw, count } = await searchPosts(query, 30);
  const posts = dedupe(raw);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/70 border border-slate-950/[0.10] flex items-center justify-center mb-5">
          <SearchX className="w-7 h-7 text-slate-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-950 mb-2">No results found</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          No verified stories matched &ldquo;{query}&rdquo;. Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-slate-600 mb-6">
        {count} result{count !== 1 ? 's' : ''} for &ldquo;
        <span className="font-semibold text-slate-950">{query}</span>&rdquo;
      </p>
      <SearchResultsGrid posts={posts} />
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  return (
    <div className="container mx-auto px-4 lg:px-6 pt-10 pb-14 max-w-6xl">
      <div className="premium-card mb-8 rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
        <p className="editorial-kicker mb-3">
          {query ? 'Search Results' : 'Search'}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-950 tracking-normal mb-3">
          {query ? query : 'Find verified news'}
        </h1>
        <p className="text-sm text-slate-600">
          Browse calm, verified coverage from the India Verified archive.
        </p>
      </div>

      {query ? (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[218px] rounded-[1.65rem]" />
              ))}
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <p className="text-slate-600">
          Use the search button in the top navigation to find verified news.
        </p>
      )}
    </div>
  );
}
