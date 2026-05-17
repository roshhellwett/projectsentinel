// last edited 2026-05-17 by roshhellwett

import { Metadata } from 'next';
import {
  Newspaper,
  Search,
  CheckCircle,
  PenTool,
  Shield,
  Database,
  Clock,
  Github,
  Zap,
  ArrowDown
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works - India Verified',
  description: 'Learn how our AI cross-references and scores news from multiple trusted sources to fight misinformation.',
  openGraph: {
    title: 'How It Works - India Verified',
    description: 'Learn how our AI verifies Indian news.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works - India Verified',
    description: 'Learn how our AI verifies Indian news.',
  },
};

const TRUSTED_SOURCES = [
  'NDTV', 'The Hindu', 'Times of India', 'Indian Express',
  'Hindustan Times', 'Mint', 'The Wire', 'Scroll.in',
  'Deccan Herald', 'ANI News', 'AltNews (fact-check)'
];

const PIPELINE_STEPS = [
  {
    number: '01',
    title: 'Fetch News',
    subtitle: 'Every 10 Minutes',
    description: 'Our system continuously monitors RSS feeds from 20+ trusted Indian news sources. We fetch headlines and the first 150 words of each article for efficiency.',
    icon: Clock,
    gradient: 'from-accent/40 to-cyan-500/20',
  },
  {
    number: '02',
    title: 'Deduplicate',
    subtitle: 'SHA256 Hashing',
    description: 'Each article URL is hashed using SHA256. If we have seen this story before, we skip it. No duplicates, ever.',
    icon: Database,
    gradient: 'from-violet-500/40 to-purple-500/20',
  },
  {
    number: '03',
    title: 'Filter',
    subtitle: 'Block Unreliable Sources',
    description: 'We automatically block known satire sites, spam domains, and sources that have published false claims verified by AltNews or AFP.',
    icon: Shield,
    gradient: 'from-red-500/40 to-orange-500/20',
  },
  {
    number: '04',
    title: 'Cross-Source Check',
    subtitle: '2+ Sources Required',
    description: 'Stories must be confirmed by 2 or more different trusted sources. Single-source stories are discarded—they never reach you.',
    icon: Search,
    gradient: 'from-amber-500/40 to-yellow-500/20',
  },
  {
    number: '05',
    title: 'AI Verification',
    subtitle: 'Groq Llama 3.3 70B',
    description: 'AI analyzes headlines and excerpts from confirming sources. It returns a credibility score (0-100), key facts, category, headline, and summary.',
    icon: CheckCircle,
    gradient: 'from-emerald-500/40 to-green-500/20',
  },
  {
    number: '06',
    title: 'AI Writing',
    subtitle: 'Neutral, Factual',
    description: 'Verified facts are written into a neutral headline and 3-sentence summary. No opinion, no bias, no sensationalism.',
    icon: PenTool,
    gradient: 'from-pink-500/40 to-rose-500/20',
  },
  {
    number: '07',
    title: 'Publish',
    subtitle: 'Instant Delivery',
    description: 'The final story appears on the site instantly. You will see the AI-written headline, summary, credibility score, and all original source links.',
    icon: Newspaper,
    gradient: 'from-accent/40 to-accent/10',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does India Verified fetch news?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our system continuously monitors RSS feeds from 20+ trusted Indian news sources every 10 minutes.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does India Verified verify news?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Stories must be confirmed by 2+ different trusted sources. Groq Llama 3.3 AI then analyzes headlines and excerpts, returning a credibility score.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is India Verified open source?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, the entire codebase is open source under MIT license.',
                },
              },
            ],
          }),
        }}
      />


      <div className="premium-card text-center mb-16 relative rounded-[2rem] px-6 py-12 md:px-10 md:py-16">
        <div className="absolute inset-0 -z-10 flex justify-center">
          <div className="w-72 h-72 bg-accent/[0.04] rounded-full blur-3xl" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/20">
          <Zap className="w-4 h-4" />
          Fully Automated
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-5 text-slate-950 leading-tight tracking-normal">
          How India <span className="text-accent">Verified</span> Works
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Every story goes through a rigorous 7-step AI verification pipeline before reaching you.
        </p>
      </div>


      <div className="space-y-3 mb-20">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.number}>
            <div className="premium-card premium-card-hover group flex gap-5 p-6 rounded-2xl transition-all duration-300">
              <div className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-white/70 border border-slate-950/[0.10] group-hover:border-accent/30 transition-colors`}>
                <step.icon className="w-6 h-6 text-accent" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-[0.18em]">
                    Step {step.number}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{step.subtitle}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>


      <div className="premium-card rounded-3xl p-8 md:p-10 mb-12">
        <h2 className="text-2xl font-bold mb-3 text-slate-950">Trusted Sources</h2>
        <p className="text-slate-600 mb-6">
          We only pull from established Indian news organizations with editorial standards.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {TRUSTED_SOURCES.map(source => (
            <span
              key={source}
              className="touch-polish px-4 py-2 bg-white/70 border border-slate-950/[0.08] rounded-xl text-sm font-medium text-slate-700 hover:bg-white hover:border-accent/20 active:scale-95 transition-all"
            >
              {source}
            </span>
          ))}
        </div>
      </div>


      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-950">Credibility Scoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreCard
            range="90-100"
            label="High Credibility"
            color="text-cred-high"
            borderColor="border-cred-high/20"
            description="Multiple reputable sources agree, named officials cited, specific details provided."
          />
          <ScoreCard
            range="70-89"
            label="Moderate Credibility"
            color="text-cred-mid"
            borderColor="border-cred-mid/20"
            description="Some sources agree, but fewer details or less authoritative sources."
          />
          <ScoreCard
            range="0-69"
            label="Low Credibility"
            color="text-cred-low"
            borderColor="border-cred-low/20"
            description="Vague claims, anonymous sources only, or emotionally manipulative language."
          />
        </div>
      </div>


      <div className="premium-card text-center rounded-3xl p-10">
        <div className="w-16 h-16 rounded-2xl bg-white/70 border border-slate-950/[0.10] flex items-center justify-center mx-auto mb-5">
          <Github className="w-8 h-8 text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-950">Open Source</h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          The entire codebase is public. Anyone can audit how we work, suggest improvements, or run their own instance.
        </p>
        <a
          href="https://github.com/roshhellwett/projectsentinel"
          target="_blank"
          rel="noopener noreferrer"
          className="touch-polish inline-flex items-center gap-2.5 px-7 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-2xl transition-all duration-300 shadow-glow-accent hover:shadow-glow-accent-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Github className="w-5 h-5" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}

function ScoreCard({
  range,
  label,
  color,
  borderColor,
  description,
}: {
  range: string;
  label: string;
  color: string;
  borderColor: string;
  description: string;
}) {
  return (
    <div className={`premium-card premium-card-hover rounded-2xl p-6 border ${borderColor}`}>
      <div className={`relative z-10 inline-block px-3.5 py-1.5 bg-white/70 border border-slate-950/[0.10] ${color} text-sm font-bold rounded-xl mb-3`}>
        {range}
      </div>
      <h3 className="relative z-10 font-bold text-slate-950 mb-2">{label}</h3>
      <p className="relative z-10 text-sm text-slate-600">{description}</p>
    </div>
  );
}
