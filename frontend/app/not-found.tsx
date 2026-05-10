import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-white/70 border border-slate-950/[0.10] flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <SearchX className="w-10 h-10 text-slate-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-950 mb-3">404 — Page not found</h1>
      <p className="text-slate-600 max-w-md mb-8">
        The article or page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover transition-colors shadow-glow-accent"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
