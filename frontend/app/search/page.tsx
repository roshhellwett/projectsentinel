import { Suspense } from 'react';
import { searchPosts } from '@/lib/supabase/server';
import { SearchResultsGrid } from '@/components/news/SearchResultsGrid';
import { dedupe } from '@/lib/utils/dedupe';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchX } from 'lucide-react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { getServerLocale } from '@/lib/i18n/server';
import en from '@/messages/en.json';
import hi from '@/messages/hi.json';

const messagesMap = { en, hi } as const;

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

async function SearchResults({ query, locale: localeVal }: { query: string; locale: string }) {
  const messages = messagesMap[localeVal as keyof typeof messagesMap];

  const { posts: raw, count } = await searchPosts(query, 30);
  const posts = dedupe(raw);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-paper/70 backdrop-blur-sm border border-rule/50 flex items-center justify-center mb-5">
            <SearchX className="w-7 h-7 text-muted" />
        </div>
        <h2 className="font-display text-lg font-bold text-ink tracking-[-0.015em] mb-2">{messages['search.no_results']?.replace('{query}', query)}</h2>
        <p className="text-sm text-muted max-w-sm">
          {messages['search.try_different']}
        </p>
      </div>
    );
  }

  const displayCount = typeof count === 'number' ? count : posts.length;

  return (
    <>
      <p className="text-sm text-muted mb-6">
        {displayCount} result{displayCount !== 1 ? 's' : ''} for &ldquo;
        <span className="font-semibold text-ink">{query}</span>&rdquo;
      </p>
      <SearchResultsGrid posts={posts} />
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const locale = await getServerLocale();
  const messages = messagesMap[locale];
  const { q } = await searchParams;
  const query = (q || '').trim();

  return (
    <div className="relative min-h-screen">
      <PageShell>
        <header className="mb-6 sm:mb-10 pb-6 sm:pb-8 border-b border-rule">
          <span aria-hidden="true" className="block w-10 sm:w-12 h-[2px] bg-accent rounded-full mb-3 sm:mb-5" />
          <p className="editorial-kicker mb-2 sm:mb-3">
            {query ? messages['search.title'] : messages['search.page_title']}
          </p>
          <h1 className="font-display text-xl sm:text-4xl md:text-5xl font-bold text-ink tracking-[-0.03em] mb-2 sm:mb-3 leading-[1.05]">
            {query ? query : messages['search.page_subtitle']}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            {messages['search.page_desc']}
          </p>
        </header>

        {query ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[218px] rounded-md" />
                ))}
              </div>
            }
          >
            <SearchResults query={query} locale={locale} />
          </Suspense>
        ) : (
          <p className="text-muted">
            {messages['search.use_search']}
          </p>
        )}
      </PageShell>
    </div>
  );
}
