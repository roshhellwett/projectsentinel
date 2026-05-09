import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-saffron-light/40 dark:bg-india-saffron/10 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-india-saffron" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">404 — Page not found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The article or page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-india-saffron text-white font-semibold hover:bg-saffron-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
