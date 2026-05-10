'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

const footerLinks: Record<string, { href: string; label: string }[]> = {
  Links: [
    { href: 'https://zenithopensourceprojects.vercel.app/', label: 'Company' },
    { href: '/contact', label: 'Contact' },
    { href: '/cookies', label: 'Cookies' },
    { href: '/how-it-works', label: 'How it Works' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-10">
        {/* Top section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-slate-900 text-base font-black tracking-wider">IV</span>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">India Verified</h2>
                <p className="text-sm text-slate-400 font-medium">AI-Verified News</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Bringing you verified, unbiased news powered by AI. No ads, no noise, just the truth.
            </p>
            {/* GitHub only */}
            <motion.a
              href="https://github.com/roshhellwett/projectsentinel"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </motion.a>
          </div>

          {/* Footer links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full md:w-auto">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-bold mb-4 tracking-wide text-white/80">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-white/10 space-y-3">
          <p className="text-sm text-slate-400 text-center md:text-left">
            &copy; {currentYear} Zenith Open Source Projects. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 text-center md:text-left leading-relaxed">
            Built with Next.js, Tailwind CSS &amp; Framer Motion &middot; Designed by Roshhellwett &middot; Powered by Claude &amp; Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
