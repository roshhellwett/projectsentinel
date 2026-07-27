import type { Metadata } from "next";
import Link from "next/link";
import { fetchPostsCursor } from "@/lib/supabase/server";
import { dedupe } from "@/lib/utils/dedupe";
import { SwipeStack } from "@/components/swipe/SwipeStack";
import { DesktopRedirect } from "@/components/swipe/DesktopRedirect";
import { PageShell } from "@/components/layout/PageShell";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { getServerLocale } from "@/lib/i18n/server";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

const messagesMap = { en, hi } as const;

export const metadata: Metadata = {
  title: "Swipe — India Verified",
  description:
    "Swipe through today's verified Indian news, one story at a time.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SwipePage() {
  const locale = await getServerLocale();
  const messages = messagesMap[locale];

  const { posts } = await fetchPostsCursor(undefined, 30);
  const deduped = dedupe(posts ?? []);

  return (
    <>
      <DesktopRedirect />
      <main className="md:hidden flex flex-col items-center pt-3 pb-24 min-h-[calc(100dvh-3.5rem)] overscroll-none">
        <header className="w-full max-w-md px-fluid-sm mb-fluid-3xs min-w-0">
          <span
            className="block w-8 h-[2px] bg-accent rounded-full mb-fluid-3xs"
            aria-hidden="true"
          />
          <h1 className="font-display text-fluid-md font-bold text-ink leading-tight">
            {messages["swipe.page_title"]}
          </h1>
          <p className="text-fluid-2xs text-muted mt-0.5">
            {messages["swipe.page_subtitle"]}
          </p>
        </header>
        <ErrorBoundary>
          <SwipeStack initialPosts={deduped} />
        </ErrorBoundary>
      </main>

      <div className="hidden md:flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] px-4">
        <div className="max-w-prose-fluid text-center">
          <h1 className="font-display text-fluid-2xl font-bold text-ink mb-fluid-2xs">
            {messages["swipe.mobile_only"]}
          </h1>
          <p className="text-muted mb-fluid-md">
            {messages["swipe.mobile_only_desc"]}
          </p>
          <Link
            href="/"
            className="tap-target min-h-[44px] inline-flex items-center px-4 py-2 border border-rule-strong text-sm font-semibold text-ink hover:bg-paper-2 hover-lift transition-all rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {messages["swipe.back_to_grid"]}
          </Link>
        </div>
      </div>
    </>
  );
}
