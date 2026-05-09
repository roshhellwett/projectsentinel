import Link from 'next/link';
import { Github, Shield, Eye, Code2, Zap } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-slate-200 dark:border-slate-800">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-india-saffron/40 to-transparent" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-india-saffron to-saffron-dark flex items-center justify-center shadow-saffron">
                <span className="text-white font-extrabold text-sm leading-none">IV</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                India <span className="text-india-saffron">Verified</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-powered news aggregator that verifies every story through cross-referencing multiple trusted sources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Navigate</h3>
            <ul className="space-y-2.5 text-sm" aria-label="Footer navigation">
              <li>
                <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/category/politics" className="text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron transition-colors duration-200">
                  Politics
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron transition-colors duration-200">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/category/sports" className="text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron transition-colors duration-200">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-slate-500 dark:text-slate-400 hover:text-india-saffron dark:hover:text-india-saffron transition-colors duration-200">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Transparency</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-india-green flex-shrink-0" />
                No ads, no sponsored content
              </li>
              <li className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-india-green flex-shrink-0" />
                All source links visible
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-india-green flex-shrink-0" />
                Open source codebase
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-india-green flex-shrink-0" />
                AI verification pipeline
              </li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Open Source</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Audit our code, suggest improvements, or run your own instance.
            </p>
            <a
              href="https://github.com/roshhellwett/projectsentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-india-saffron/10 hover:text-india-saffron dark:hover:bg-india-saffron/10 dark:hover:text-india-saffron rounded-xl transition-all duration-200"
            >
              <Github className="w-4 h-4" />
              GitHub Repository
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-3 h-1 rounded-full bg-india-saffron" />
              <div className="w-3 h-1 rounded-full bg-white border border-slate-300 dark:border-slate-600" />
              <div className="w-3 h-1 rounded-full bg-india-green" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {currentYear} India Verified. Open source under MIT license.
            </p>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Made with ❤️ for India
          </p>
        </div>
      </div>
    </footer>
  );
}
