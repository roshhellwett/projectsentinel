import { Metadata } from 'next';
import { CategoryBar } from '@/components/layout/CategoryBar';

export const metadata: Metadata = {
  title: 'Cookies Policy - India Verified',
  description: 'How India Verified uses cookies and similar technologies.',
  openGraph: {
    title: 'Cookies Policy - India Verified',
    description: 'How India Verified uses cookies.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookies Policy - India Verified',
    description: 'How India Verified uses cookies.',
  },
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 pt-24 lg:pt-28 pb-14">
      <div className="mb-10">
        <CategoryBar />
      </div>
      <div className="max-w-3xl">
      <div className="premium-card rounded-3xl p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-950 tracking-tight">
          Cookies Policy
        </h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website.
              They help the site remember your preferences and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">How We Use Cookies</h2>
            <p>
              India Verified uses minimal cookies. We do not use tracking cookies,
              advertising cookies, or third-party analytics cookies. The only cookies
              we may set are strictly functional ones required for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Session management for admin authentication</li>
              <li>Remembering your category preferences during a session</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">Third-Party Services</h2>
            <p>
              We do not embed third-party tracking scripts, social media widgets,
              or advertising networks. Our site is designed to be privacy-respecting
              by default.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">Your Choices</h2>
            <p>
              You can disable cookies in your browser settings. However, please note
              that certain features of the site may not function properly without them.
              Most browsers allow you to block all cookies or delete existing ones
              through their settings menu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">Changes to This Policy</h2>
            <p>
              We may update this Cookies Policy from time to time. Any changes will
              be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">Contact</h2>
            <p>
              If you have questions about this policy, please reach out via our{' '}
              <a
                href="https://github.com/roshhellwett"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover underline"
              >
                GitHub profile
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
