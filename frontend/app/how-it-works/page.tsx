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
  description: 'Learn how India Verified uses AI to verify news stories from multiple trusted sources.',
  openGraph: {
    title: 'How It Works - India Verified',
    description: 'Learn how India Verified uses AI to verify news stories from multiple trusted sources.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works - India Verified',
    description: 'Learn how India Verified uses AI to verify news stories from multiple trusted sources.',
    images: ['/og-image.png'],
  },
};

const TRUSTED_SOURCES = [
  'NDTV', 'The Hindu', 'Times of India', 'Indian Express',
  'Hindustan Times', 'Mint', 'The Wire', 'Scroll.in',
  'Deccan Herald', 'ANI News', 'AltNews (fact-check)'
];

export default function HowItWorksPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
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
                  text: 'Our system continuously monitors RSS feeds from 20+ trusted Indian news sources every 30 minutes.',
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

      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 -z-10 flex justify-center">
          <div className="w-72 h-72 bg-india-saffron/[0.06] rounded-full blur-3xl" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-india-saffron/10 text-india-saffron text-sm font-semibold rounded-full mb-6">
          <Zap className="w-4 h-4" />
          Fully Automated
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-5 text-slate-900 dark:text-white leading-tight">
          How India <span className="text-india-saffron">Verified</span> Works
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Every story goes through a rigorous 7-step AI verification pipeline before reaching you.
        </p>
      </div>
      
      {/* Pipeline Steps */}
      <div className="space-y-4 mb-20">
        <Step
          icon={<Clock className="w-6 h-6" />}
          number="1"
          title="Fetch News"
          subtitle="Every 30 Minutes"
          description="Our system continuously monitors RSS feeds from 20+ trusted Indian news sources. We fetch headlines and the first 150 words of each article for efficiency."
          gradient="from-blue-500 to-cyan-500"
        />
        
        <StepConnector />
        
        <Step
          icon={<Database className="w-6 h-6" />}
          number="2"
          title="Deduplicate"
          subtitle="SHA256 Hashing"
          description="Each article URL is hashed using SHA256. If we've seen this story before, we skip it. No duplicates, ever."
          gradient="from-violet-500 to-purple-500"
        />
        
        <StepConnector />
        
        <Step
          icon={<Shield className="w-6 h-6" />}
          number="3"
          title="Filter"
          subtitle="Block Unreliable Sources"
          description="We automatically block known satire sites, spam domains, and sources that have published false claims verified by AltNews or AFP."
          gradient="from-red-500 to-orange-500"
        />
        
        <StepConnector />
        
        <Step
          icon={<Search className="w-6 h-6" />}
          number="4"
          title="Cross-Source Check"
          subtitle="2+ Sources Required"
          description="Stories must be confirmed by 2+ different trusted sources. Single-source stories are discarded—they never reach you."
          gradient="from-amber-500 to-india-saffron"
        />
        
        <StepConnector />
        
        <Step
          icon={<CheckCircle className="w-6 h-6" />}
          number="5"
          title="AI Verification"
          subtitle="Groq Llama 3.3 70B"
          description="AI analyzes headlines and excerpts from confirming sources. It returns: credibility score (0-100), key facts, category, headline, and summary."
          gradient="from-emerald-500 to-green-500"
        />
        
        <StepConnector />
        
        <Step
          icon={<PenTool className="w-6 h-6" />}
          number="6"
          title="AI Writing"
          subtitle="Neutral, Factual"
          description="Verified facts are written into a neutral headline and 3-sentence summary. No opinion, no bias, no sensationalism."
          gradient="from-pink-500 to-rose-500"
        />
        
        <StepConnector />
        
        <Step
          icon={<Newspaper className="w-6 h-6" />}
          number="7"
          title="Publish"
          subtitle="Instant Delivery"
          description="The final story appears on the site instantly. You'll see: the AI-written headline, summary, credibility score, and all original source links."
          gradient="from-india-saffron to-saffron-dark"
        />
      </div>
      
      {/* Trusted Sources */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 mb-12 border border-slate-200 dark:border-slate-700 shadow-card">
        <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Trusted Sources</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We only pull from established Indian news organizations with editorial standards.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {TRUSTED_SOURCES.map(source => (
            <span 
              key={source}
              className="px-4 py-2 bg-saffron-light/50 dark:bg-india-saffron/5 border border-india-saffron/10 dark:border-india-saffron/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-india-saffron/10 dark:hover:bg-india-saffron/10 transition-colors duration-200"
            >
              {source}
            </span>
          ))}
        </div>
      </div>
      
      {/* Credibility Scoring */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Credibility Scoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreCard
            range="80-100"
            label="High Credibility"
            color="bg-success"
            ringColor="ring-success/20"
            description="Multiple reputable sources agree, named officials cited, specific details provided."
          />
          <ScoreCard
            range="60-79"
            label="Moderate Credibility"
            color="bg-warning"
            ringColor="ring-warning/20"
            description="Some sources agree, but fewer details or less authoritative sources."
          />
          <ScoreCard
            range="0-59"
            label="Low Credibility"
            color="bg-danger"
            ringColor="ring-danger/20"
            description="Vague claims, anonymous sources only, or emotionally manipulative language."
          />
        </div>
      </div>
      
      {/* Open Source CTA */}
      <div className="text-center bg-gradient-to-br from-saffron-light/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl p-10 border border-slate-200 dark:border-slate-700 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Github className="w-8 h-8 text-white dark:text-slate-900" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Open Source</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          The entire codebase is public. Anyone can audit how we work, suggest improvements, or run their own instance.
        </p>
        <a
          href="https://github.com/roshhellwett/projectsentinel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-india-saffron to-saffron-dark hover:from-saffron-dark hover:to-india-saffron text-white font-semibold rounded-2xl transition-all duration-300 shadow-saffron hover:shadow-saffron-lg"
        >
          <Github className="w-5 h-5" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}

function StepConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-4 bg-gradient-to-b from-slate-300 dark:from-slate-600 to-transparent" />
        <ArrowDown className="w-4 h-4 text-slate-300 dark:text-slate-600" />
      </div>
    </div>
  );
}

function Step({ 
  icon, 
  number, 
  title,
  subtitle,
  description,
  gradient
}: { 
  icon: React.ReactNode; 
  number: string; 
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="flex gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300 group">
      <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-xs font-bold text-india-saffron uppercase tracking-widest">Step {number}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{subtitle}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ScoreCard({ 
  range, 
  label, 
  color,
  ringColor,
  description 
}: { 
  range: string; 
  label: string; 
  color: string;
  ringColor: string;
  description: string;
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-card ring-2 ${ringColor}`}>
      <div className={`inline-block px-3.5 py-1.5 ${color} text-white text-sm font-bold rounded-xl mb-3`}>
        {range}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{label}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
