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
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
  },
  {
    number: '02',
    title: 'Deduplicate',
    subtitle: 'SHA256 Hashing',
    description: 'Each article URL is hashed using SHA256. If we have seen this story before, we skip it. No duplicates, ever.',
    icon: Database,
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
  },
  {
    number: '03',
    title: 'Filter',
    subtitle: 'Block Unreliable Sources',
    description: 'We automatically block known satire sites, spam domains, and sources that have published false claims verified by AltNews or AFP.',
    icon: Shield,
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
  },
  {
    number: '04',
    title: 'Cross-Source Check',
    subtitle: '2+ Sources Required',
    description: 'Stories must be confirmed by 2 or more different trusted sources. Single-source stories are discarded—they never reach you.',
    icon: Search,
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
  },
  {
    number: '05',
    title: 'AI Verification',
    subtitle: 'Groq Llama 3.3 70B',
    description: 'AI analyzes headlines and excerpts from confirming sources. It returns a credibility score (0-100), key facts, category, headline, and summary.',
    icon: CheckCircle,
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
  },
  {
    number: '06',
    title: 'AI Writing',
    subtitle: 'Neutral, Factual',
    description: 'Verified facts are written into a neutral headline and 3-sentence summary. No opinion, no bias, no sensationalism.',
    icon: PenTool,
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
  },
  {
    number: '07',
    title: 'Publish',
    subtitle: 'Instant Delivery',
    description: 'The final story appears on the site instantly. You will see the AI-written headline, summary, credibility score, and all original source links.',
    icon: Newspaper,
    gradient: 'from-accent/40 via-accent/20 to-accent/5',
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

      <div className="text-center mb-16 pb-10 border-b border-rule animate-fade-in-up">
        <span aria-hidden="true" className="block w-12 h-[2px] bg-accent mb-5 mx-auto" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/20">
          <Zap className="w-4 h-4" />
          Fully Automated
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 text-ink leading-[1.05] tracking-tight">
          How India <span className="text-accent">Verified</span> works
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Every story goes through a rigorous 7-step AI verification pipeline before reaching you.
        </p>
      </div>

      <div className="space-y-3 mb-20">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.number}>
            <div className="premium-card premium-card-hover group flex gap-5 p-6 rounded-md transition-all duration-300">
              <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded flex items-center justify-center bg-paper-2 border border-rule group-hover:border-ink transition-colors">
                <step.icon className="w-6 h-6 text-accent" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-[0.18em]">
                    Step {step.number}
                  </span>
                  <span className="text-[11px] text-muted font-medium">{step.subtitle}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink mb-1">{step.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{step.description}</p>
              </div>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-4 h-4 text-subtle" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="premium-card rounded-md p-8 md:p-10 mb-12 animate-fade-in-up">
        <h2 className="font-display text-2xl font-bold mb-3 text-ink tracking-tight">Trusted sources</h2>
        <p className="text-muted mb-6">
          We only pull from established Indian news organizations with editorial standards.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {TRUSTED_SOURCES.map(source => (
            <span
              key={source}
              className="px-3.5 py-1.5 bg-paper border border-rule rounded text-sm font-medium text-ink hover:border-ink transition-colors"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="font-display text-2xl font-bold mb-6 text-ink tracking-tight">Credibility scoring</h2>
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

      <div className="premium-card text-center rounded-md p-10 animate-fade-in-up">
        <div className="w-16 h-16 rounded bg-paper-2 border border-rule flex items-center justify-center mx-auto mb-5">
          <Github className="w-8 h-8 text-ink" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-3 text-ink tracking-tight">Open source</h2>
        <p className="text-muted mb-6 max-w-md mx-auto leading-relaxed">
          The entire codebase is public. Anyone can audit how we work, suggest improvements, or run their own instance.
        </p>
        <a
          href="https://github.com/roshhellwett/projectsentinel"
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-ink/90 text-paper text-sm font-semibold rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover-lift"
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
    <div className={`premium-card p-6 ${borderColor}`}>
      <div className={`relative z-10 inline-block px-2.5 py-1 bg-paper-2 border border-rule ${color} text-xs font-bold rounded mb-3 tabular-nums tracking-wider`}>
        {range}
      </div>
      <h3 className="font-display relative z-10 font-bold text-ink mb-2">{label}</h3>
      <p className="relative z-10 text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
