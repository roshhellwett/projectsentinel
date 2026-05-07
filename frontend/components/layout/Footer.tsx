/**
 * Footer with links and transparency info
 * Optimized: Link components, semantic markup
 */

import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Sentinel News</h3>
            <p className="text-sm text-gray-400">
              AI-powered news aggregator that verifies every story through cross-referencing multiple trusted sources. Zero human editors required.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Links</h3>
            <ul className="space-y-2 text-sm" aria-label="Footer links">
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="https://github.com/projectsentinel"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Transparency</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>No ads, no sponsored content</li>
              <li>All source links visible</li>
              <li>Open source codebase</li>
              <li>AI verification pipeline</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Sentinel News. Open source under MIT license.
          </p>
          <p className="text-xs text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </footer>
  );
}
