import { Metadata } from "next";
import {
  Newspaper,
  Search,
  CheckCircle,
  PenTool,
  Shield,
  Database,
  Clock,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";
import { Reveal } from "@/components/layout/Reveal";

export const metadata: Metadata = {
  title: "How It Works - India Verified",
  description:
    "Learn how our AI cross-references and scores news from multiple trusted sources to fight misinformation.",
  openGraph: {
    title: "How It Works - India Verified",
    description: "Learn how our AI verifies Indian news.",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works - India Verified",
    description: "Learn how our AI verifies Indian news.",
  },
};

const TRUSTED_SOURCES = [
  "NDTV",
  "The Hindu",
  "Times of India",
  "Indian Express",
  "Hindustan Times",
  "Mint",
  "The Wire",
  "Scroll.in",
  "Deccan Herald",
  "ANI News",
  "AltNews (fact-check)",
];

const PIPELINE_STEPS = [
  {
    number: "01",
    title: "Fetch News",
    subtitle: "Every 10 Minutes",
    description:
      "Our system continuously monitors RSS feeds from 20+ trusted Indian news sources. We fetch headlines and the first 150 words of each article for efficiency.",
    icon: Clock,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
  {
    number: "02",
    title: "Deduplicate",
    subtitle: "SHA256 Hashing",
    description:
      "Each article URL is hashed using SHA256. If we have seen this story before, we skip it. No duplicates, ever.",
    icon: Database,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
  {
    number: "03",
    title: "Filter",
    subtitle: "Block Unreliable Sources",
    description:
      "We automatically block known satire sites, spam domains, and sources that have published false claims verified by AltNews or AFP.",
    icon: Shield,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
  {
    number: "04",
    title: "Cross-Source Check",
    subtitle: "2+ Sources Required",
    description:
      "Stories must be confirmed by 2 or more different trusted sources. Single-source stories are discarded—they never reach you.",
    icon: Search,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
  {
    number: "05",
    title: "AI Verification",
    subtitle: "AI Cross-Referencing",
    description:
      "AI analyzes headlines and excerpts from confirming sources. It returns a credibility score (0-100), key facts, category, headline, and summary.",
    icon: CheckCircle,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
  {
    number: "06",
    title: "AI Writing",
    subtitle: "Neutral, Factual",
    description:
      "Verified facts are written into a neutral headline and 3-sentence summary. No opinion, no bias, no sensationalism.",
    icon: PenTool,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
  {
    number: "07",
    title: "Publish",
    subtitle: "Instant Delivery",
    description:
      "The final story appears on the site instantly. You will see the AI-written headline, summary, credibility score, and all original source links.",
    icon: Newspaper,
    gradient: "from-accent/40 via-accent/20 to-accent/5",
  },
];

export default function HowItWorksPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How does India Verified fetch news?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our system continuously monitors RSS feeds from 20+ trusted Indian news sources every 10 minutes.",
                },
              },
              {
                "@type": "Question",
                name: "How does India Verified verify news?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stories must be confirmed by 2+ different trusted sources. Cross-referencing AI then analyzes headlines and excerpts, returning a credibility score.",
                },
              },
              {
                "@type": "Question",
                name: "Is India Verified open source?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, the entire codebase is open source under MIT license.",
                },
              },
            ],
          }),
        }}
      />

      <EditorialPageHeader kicker="The method / Open by design" title={<>A story is only as good<br />as its <em className="text-accent">sources.</em></>} description="Look behind the headlines. Here is the seven-step process that collects, cross-references, and publishes the stories you read." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-20 mb-14">
        <div><div className="lg:sticky lg:top-28"><p className="editorial-kicker mb-4">From report to perspective</p><h2 className="font-display text-3xl font-normal mb-5">No black box.<br />Follow the process.</h2><p className="text-sm text-ink-soft max-w-[34ch]">The credibility score is a starting point. Original sources and the reasoning behind every score are always there for you to explore.</p></div></div>
        <div>
          {PIPELINE_STEPS.map(step => (
            <Reveal key={step.number} className="pipeline-step">
              <span className="pipeline-step__number">{step.number}</span>
              <div className="min-w-0"><div className="flex items-center justify-between gap-3 mb-2"><span className="editorial-kicker !text-muted">{step.subtitle}</span><step.icon size={17} className="text-accent" aria-hidden="true" /></div><h2 className="font-display text-2xl font-medium mb-3">{step.title}</h2><p className="text-sm text-ink-soft leading-relaxed">{step.description}</p></div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="np-card glass-card p-fluid-sm sm:p-fluid-lg mb-fluid-lg">
        <h2 className="font-display text-fluid-lg sm:text-fluid-xl font-bold mb-fluid-2xs text-ink tracking-tight">
          Trusted sources
        </h2>
        <p className="text-fluid-sm text-muted mb-fluid-sm">
          We only pull from established Indian news organizations with editorial
          standards.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8">
          {TRUSTED_SOURCES.map((source, index) => <span key={source} className="flex items-center gap-3 py-3 border-b border-rule text-[12px] text-ink"><span className="font-mono text-[9px] text-muted">{String(index + 1).padStart(2, "0")}</span>{source}</span>)}
        </div>
      </div>

      <div className="mb-fluid-lg">
        <h2 className="font-display text-fluid-lg sm:text-fluid-xl font-bold mb-fluid-sm text-ink tracking-tight">
          Credibility scoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-fluid-xs sm:gap-fluid-sm">
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

      <div className="np-card glass-card text-center p-fluid-sm sm:p-fluid-lg">
        <div className="w-10 h-10 sm:w-16 sm:h-16 rounded bg-paper-2 border border-rule flex items-center justify-center mx-auto mb-fluid-xs shrink-0">
          <GitHubIcon className="w-5 h-5 sm:w-8 sm:h-8 text-ink" />
        </div>
        <h2 className="font-display text-fluid-lg sm:text-fluid-xl font-bold mb-fluid-2xs text-ink tracking-tight">
          Open source
        </h2>
        <p className="text-fluid-sm text-muted mb-fluid-sm max-w-prose-fluid mx-auto leading-relaxed">
          The entire codebase is public. Anyone can audit how we work, suggest
          improvements, or run their own instance.
        </p>
        <a
          href="https://github.com/roshhellwett/projectsentinel"
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target min-h-[44px] inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 bg-ink hover:bg-ink/90 text-paper text-fluid-sm font-semibold rounded transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover-lift"
        >
          <GitHubIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          View on GitHub
        </a>
      </div>
    </PageShell>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.338c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
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
    <div className={`np-card glass-card p-fluid-sm ${borderColor} min-w-0`}>
      <div
        className={`relative z-10 inline-block px-2.5 py-1 bg-paper-2 border border-rule ${color} text-fluid-2xs font-bold rounded mb-fluid-2xs tabular-nums tracking-wider`}
      >
        {range}
      </div>
      <h3 className="font-display relative z-10 font-bold text-ink mb-fluid-3xs text-fluid-md">
        {label}
      </h3>
      <p className="relative z-10 text-fluid-sm text-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
