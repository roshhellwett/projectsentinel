import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — India Verified',
  description:
    'How India Verified handles your data: no advertising, no third-party tracking, no accounts. Reading preferences stay on your device.',
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      kicker="Privacy Policy"
      title="Your reading stays on your device."
      lastUpdated="17 May 2026"
      intro={
        <p>
          India Verified is an AI-assisted news aggregator. We have no
          advertising business, no third-party trackers, and we do not run
          user accounts. This document explains exactly what data is touched
          when you visit the site and what your rights are.
        </p>
      }
    >
      <h2>Data we store on your device</h2>
      <p>
        The site uses your browser&apos;s <code>localStorage</code> to remember a
        handful of preferences so the experience feels personal between
        visits:
      </p>
      <ul>
        <li>Light or dark theme choice</li>
        <li>Stories you have bookmarked (the &ldquo;Saved&rdquo; list)</li>
        <li>Recent search terms, so the search overlay can autocomplete</li>
        <li>Which stories you have already read, to dim them in the feed</li>
        <li>Whether you have accepted this notice (the cookie consent flag)</li>
      </ul>
      <p>
        None of this data ever leaves your browser. There is no server-side
        profile keyed to you. Clearing your browser storage erases everything.
      </p>

      <h2>Server logs</h2>
      <p>
        Like any website, our hosting provider records standard request logs
        (IP address, user-agent, requested URL, response code, timestamp).
        These logs are retained for up to 30 days for operational and
        security purposes — diagnosing outages, blocking abuse, and meeting
        legal obligations. They are not used to build advertising profiles
        and are not shared with marketing partners.
      </p>

      <h2>Cookies</h2>
      <p>
        The site does not set any first-party tracking cookies. The cookie
        consent banner stores a single boolean in <code>localStorage</code> to
        remember that you have seen it. We do not embed third-party
        advertising tags, analytics pixels, or social-media trackers.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        India Verified is a general-audience news service. We do not knowingly
        collect any information from children under 13.
      </p>

      <h2>Your rights</h2>
      <p>
        Because no personally identifiable data is collected on our side,
        there is generally nothing for us to delete on your behalf. You can
        exercise complete control by clearing site data in your browser
        settings.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we materially change how data is handled, we will update the
        &ldquo;Last updated&rdquo; date at the top of this page and post a notice on
        the homepage. Continued use of the site after such changes constitutes
        acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, concerns, or requests can be sent to{' '}
        <a href="mailto:zenithprojects@icloud.com">zenithprojects@icloud.com</a>.
      </p>
    </LegalPage>
  );
}
