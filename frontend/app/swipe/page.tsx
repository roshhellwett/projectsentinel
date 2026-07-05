import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPosts } from '@/lib/supabase/server';
import { dedupe } from '@/lib/utils/dedupe';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { DesktopRedirect } from '@/components/swipe/DesktopRedirect';
import { PageShell } from '@/components/layout/PageShell';

export const metadata: Metadata = {
  title: 'Swipe — India Verified',
  description: 'Swipe through today’s verified Indian news, one story at a time.',
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

export default async function SwipePage() {
  const { posts } = await fetchPosts(1, 20);
  const deduped = dedupe(posts ?? []);

  return (
    <>
      <DesktopRedirect />
      <main className="md:hidden flex flex-col items-center pt-4 pb-24 min-h-[calc(100dvh-3.5rem)]">
        <header className="w-full max-w-md px-4 mb-3">
          <span className="block w-8 h-[2px] bg-accent rounded-full mb-2" aria-hidden="true" />
          <h1 className="font-display text-lg font-bold text-ink leading-tight">
            Swipe
          </h1>
          <p className="text-[11px] text-muted mt-0.5">One story at a time. Tap to read full.</p>
        </header>
        <SwipeStack initialPosts={deduped} />
      </main>

      <div className="hidden md:flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold text-ink mb-3">Swipe is a mobile experience</h1>
          <p className="text-muted mb-6">Open this page on your phone to swipe through verified news, one story at a time.</p>
          <Link href="/" className="tap-target min-h-[44px] inline-flex items-center px-4 py-2 border border-rule-strong text-sm font-semibold text-ink hover:bg-paper-2 hover-lift transition-all rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Back to grid
          </Link>
        </div>
      </div>
    </>
  );
}
