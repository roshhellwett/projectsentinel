/**
 * Footer with links and transparency info
 * Optimized: Link components, semantic markup
 */

import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">India Verified</h3>
            <p className="text-sm text-slate-500">
              AI-powered news aggregator that verifies every story through cross-referencing multiple trusted sources. Zero human editors required.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">Links</h3>
            <ul className="space-y-2 text-sm" aria-label="Footer links">
              <li>
                <Link href="/how-it-works" className="text-slate-500 hover:text-slate-900 transition-colors duration-200">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="https://github.com/yourusername/projectsentinel"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-slate-500 hover:text-slate-900 transition-colors duration-200 inline-flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">Transparency</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>No ads, no sponsored content</li>
              <li>All source links visible</li>
              <li>Open source codebase</li>
              <li>AI verification pipeline</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} India Verified. Open source under MIT license.
          </p>
          <p className="text-xs text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </footer>
  );
}
