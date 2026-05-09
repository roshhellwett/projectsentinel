'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const TRUST_BADGES = [
  { label: 'No Ads' },
  { label: 'AI Verified' },
  { label: 'Open Source' },
];

export function Hero() {
  return (
    <section
      aria-label="India Verified — AI-powered Indian news"
      className="relative isolate overflow-hidden pt-12 md:pt-20 pb-10 md:pb-16"
    >
      {/* Soft accent spotlight */}
      <div className="hero-spotlight" aria-hidden="true" />

      {/* Massive "Verified News" typographic watermark */}
      <div className="hero-watermark" aria-hidden="true">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Verified News
        </motion.span>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-10 md:pt-16">
          {/* IV logo badge — circular glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-16 h-16 mb-7 rounded-full bg-white/[0.04] border border-white/[0.10] backdrop-blur-md flex items-center justify-center shadow-2xl shadow-black/40"
          >
            <span className="text-lg font-black text-white tracking-tight leading-none">IV</span>
            <div className="absolute -inset-px rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[44px] md:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] mb-5"
          >
            India Verified
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-lg text-zinc-400 font-normal mb-8 max-w-xl"
          >
            AI-powered. Cross-referenced. Trusted.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-9"
          >
            <Link
              href="#latest"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-all duration-200 shadow-glow-accent hover:shadow-glow-accent-lg w-full sm:w-auto"
            >
              Read Latest
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-transparent hover:bg-white/[0.06] border border-white/[0.14] hover:border-white/[0.25] text-white font-medium text-sm transition-all duration-200 w-full sm:w-auto"
            >
              How It Works
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Trust signals"
          >
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] font-medium text-zinc-300"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                {badge.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
