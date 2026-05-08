import { Metadata } from 'next';
import { 
  Newspaper, 
  Search, 
  CheckCircle, 
  PenTool, 
  Shield, 
  Database,
  Clock,
  Github
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works - India Verified',
  description: 'Learn how India Verified uses AI to verify news stories from multiple trusted sources.',
  openGraph: {
    title: 'How It Works - India Verified',
    description: 'Learn how India Verified uses AI to verify news stories from multiple trusted sources.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works - India Verified',
    description: 'Learn how India Verified uses AI to verify news stories from multiple trusted sources.',
    images: ['/og-image.svg'],
  },
};

const TRUSTED_SOURCES = [
  'NDTV', 'The Hindu', 'Times of India', 'Indian Express',
  'Hindustan Times', 'Mint', 'The Wire', 'Scroll.in',
  'Deccan Herald', 'ANI News', 'AltNews (fact-check)'
];

export default function HowItWorksPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiaverified.vercel.app';

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
                  text: 'Our system continuously monitors RSS feeds from 20+ trusted Indian news sources. We fetch headlines and the first 150 words of each article for efficiency every 30 minutes.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does India Verified verify news?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Stories must be confirmed by 2+ different trusted sources. Single-source stories are discarded. Groq Llama 3.3 AI then analyzes headlines and excerpts, returning a credibility score (0-100), key facts, category, headline, and summary.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is India Verified open source?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, the entire codebase is open source under MIT license. Anyone can audit how we work, suggest improvements, or run their own instance.',
                },
              },
            ],
          }),
        }}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-medium mb-4">How India Verified Works</h1>
        <p className="text-xl text-slate-600">
          Fully automated, AI-powered news verification
        </p>
      </div>
      
      <div className="space-y-8 mb-16">
        <Step
          icon={<Clock className="w-6 h-6" />}
          number="1"
          title="Fetch (Every 30 Minutes)"
          description="Our system continuously monitors RSS feeds from 20+ trusted Indian news sources. We fetch headlines and the first 150 words of each article for efficiency."
        />
        
        <Step
          icon={<Database className="w-6 h-6" />}
          number="2"
          title="Deduplicate"
          description="Each article URL is hashed using SHA256. If we've seen this story before, we skip it. No duplicates, ever."
        />
        
        <Step
          icon={<Shield className="w-6 h-6" />}
          number="3"
          title="Filter"
          description="We automatically block known satire sites, spam domains, and sources that have published false claims verified by AltNews or AFP."
        />
        
        <Step
          icon={<Search className="w-6 h-6" />}
          number="4"
          title="Cross-Source Check"
          description="Stories must be confirmed by 2+ different trusted sources. Single-source stories are discarded—they never reach you."
        />
        
        <Step
          icon={<CheckCircle className="w-6 h-6" />}
          number="5"
          title="AI Verification (Groq Llama 3.3)"
          description="Groq Llama 3.3 analyzes headlines and excerpts from confirming sources. It returns: credibility score (0-100), key facts, category, headline, and summary."
        />
        
        <Step
          icon={<PenTool className="w-6 h-6" />}
          number="6"
          title="AI Writing (Groq)"
          description="Verified facts are sent to Groq (Llama 3.3 70B) which writes a neutral headline and 3-sentence summary. No opinion, no bias."
        />
        
        <Step
          icon={<Newspaper className="w-6 h-6" />}
          number="7"
          title="Publish"
          description="The final story appears on the site instantly. You'll see: the AI-written headline, summary, credibility score, and all original source links."
        />
      </div>
      
      <div className="bg-surface rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-medium mb-6">Trusted Sources</h2>
        <p className="text-slate-600 mb-6">
          We only pull from established Indian news organizations with editorial standards.
        </p>
        <div className="flex flex-wrap gap-3">
          {TRUSTED_SOURCES.map(source => (
            <span 
              key={source}
              className="px-3 py-1 bg-background rounded-full text-sm text-slate-600"
            >
              {source}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-6">Credibility Scoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreCard
            range="80-100"
            label="High Credibility"
            color="bg-success"
            description="Multiple reputable sources agree, named officials cited, specific details provided."
          />
          <ScoreCard
            range="60-79"
            label="Moderate Credibility"
            color="bg-warning"
            description="Some sources agree, but fewer details or less authoritative sources."
          />
          <ScoreCard
            range="0-59"
            label="Low Credibility"
            color="bg-danger"
            description="Vague claims, anonymous sources only, or emotionally manipulative language."
          />
        </div>
      </div>
      
      <div className="text-center bg-surface rounded-xl p-8">
        <Github className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-medium mb-4">Open Source</h2>
        <p className="text-slate-600 mb-6">
          The entire codebase is public. Anyone can audit how we work, suggest improvements, or run their own instance.
        </p>
        <a
          href="https://github.com/yourusername/projectsentinel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover rounded-lg transition-colors"
        >
          <Github className="w-5 h-5" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}

function Step({ 
  icon, 
  number, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  number: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-medium text-accent">Step {number}</span>
          <h3 className="text-lg font-medium text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function ScoreCard({ 
  range, 
  label, 
  color, 
  description 
}: { 
  range: string; 
  label: string; 
  color: string; 
  description: string;
}) {
  return (
    <div className="bg-surface rounded-lg p-6">
      <div className={`inline-block px-3 py-1 ${color} text-white text-sm font-medium rounded-full mb-3`}>
        {range}
      </div>
      <h3 className="font-medium text-slate-900 mb-2">{label}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
