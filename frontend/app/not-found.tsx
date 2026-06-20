

import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in-up">
      <span aria-hidden="true" className="block w-12 h-[2px] bg-accent mb-5" />
      <p className="editorial-kicker mb-3">Error 404</p>
      <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink mb-4 leading-[1.05]">
        Page not found
      </h1>
      <p className="text-ink-soft max-w-md mb-8 text-base leading-relaxed">
        The article or page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-ink bg-ink text-paper text-sm font-semibold hover:bg-ink-soft hover-lift transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <span aria-hidden="true" className="text-subtle">
          <SearchX className="w-5 h-5" />
        </span>
      </div>
    </div>
  );
}
