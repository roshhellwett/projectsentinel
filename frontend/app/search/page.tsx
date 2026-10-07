import { Suspense } from "react";
import { searchPosts } from "@/lib/supabase/server";
import { SearchResultsGrid } from "@/components/news/SearchResultsGrid";
import { dedupe } from "@/lib/utils/dedupe";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search, SearchX, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";
import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

const messagesMap = { en, hi } as const;

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" — India Verified` : "Search — India Verified",
    description: q
      ? `Search results for "${q}" on India Verified.`
      : "Search verified Indian news.",
    robots: { index: false, follow: false },
  };
}

async function SearchResults({
  query,
  locale: localeVal,
}: {
  query: string;
  locale: string;
}) {
  const messages = messagesMap[localeVal as keyof typeof messagesMap];

  const { posts: raw, count } = await searchPosts(query, 30);
  const posts = dedupe(raw);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-fluid-sm text-center">
        <div className="w-16 h-16 rounded-full bg-paper/70 backdrop-blur-sm border border-rule/50 flex items-center justify-center mb-fluid-xs shrink-0">
          <SearchX className="w-7 h-7 text-muted" />
        </div>
        <h2 className="font-display text-fluid-lg font-bold text-ink tracking-[-0.015em] mb-fluid-3xs">
          {messages["search.no_results"]?.replace("{query}", query)}
        </h2>
        <p className="text-fluid-sm text-muted max-w-prose-fluid">
          {messages["search.try_different"]}
        </p>
      </div>
    );
  }

  const displayCount = typeof count === "number" ? count : posts.length;

  return (
    <>
      <p className="text-fluid-sm text-muted mb-fluid-md break-words">
        {displayCount} result{displayCount !== 1 ? "s" : ""} for &ldquo;
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
  const query = (q || "").trim();

  return (
    <div className="relative min-h-screen">
      <PageShell>
        <EditorialPageHeader kicker={query ? messages["search.title"] : messages["search.page_title"]} title={query || messages["search.page_subtitle"]} description={messages["search.page_desc"]} />
        <form action="/search" method="get" className="search-field" role="search">
          <Search size={19} className="text-muted shrink-0" aria-hidden="true" />
          <label htmlFor="news-search-query" className="sr-only">Search verified news</label>
          <input id="news-search-query" type="search" name="q" defaultValue={query} placeholder="A topic, a question, a story…" required maxLength={200} />
          <button type="submit" className="editorial-button">Search <ArrowRight size={14} aria-hidden="true" /></button>
        </form>

        {query ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-fluid-sm">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[218px] rounded-md" />
                ))}
              </div>
            }
          >
            <SearchResults query={query} locale={locale} />
          </Suspense>
        ) : (
          <div><p className="editorial-kicker mb-3">Start somewhere interesting</p><div className="flex flex-wrap gap-3">{["India", "Science", "Economy", "Technology"].map(topic => <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`} className="editorial-link border-b border-rule hover:border-accent mr-5">{topic} <ArrowRight size={13} aria-hidden="true" /></Link>)}</div></div>
        )}
      </PageShell>
    </div>
  );
}
