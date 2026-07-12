import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use — India Verified",
  description:
    "The terms that govern your use of India Verified, an AI-assisted news aggregator.",
};

export default function TermsOfUse() {
  return (
    <LegalPage
      kicker="Terms of Use"
      title="Use the site fairly. We try to be accurate."
      lastUpdated="17 May 2026"
      intro={
        <p>
          By accessing India Verified you agree to the terms below. They are
          intentionally short and written in plain English. If anything is
          unclear, write to us at{" "}
          <a href="mailto:zenithprojects@icloud.com">
            zenithprojects@icloud.com
          </a>
          .
        </p>
      }
    >
      <h2>What India Verified is</h2>
      <p>
        India Verified aggregates publicly available news from established
        Indian publications, cross-references each story across multiple
        sources, and uses a large language model to produce a neutral summary
        and a credibility score. We always link back to the original publishers
        — they remain the primary source of record.
      </p>

      <h2>Editorial accuracy</h2>
      <p>
        We work hard to ensure each summary is faithful to its sources, but AI
        systems can make mistakes. If you spot an error, please use the
        &ldquo;Report a correction&rdquo; channel described on our{" "}
        <a href="/corrections/">Corrections Policy</a> page. We commit to
        reviewing every report and updating the record where required.
      </p>

      <h2>Permitted use</h2>
      <ul>
        <li>You may read, bookmark, and share links to any story.</li>
        <li>
          You may quote brief excerpts for commentary, criticism, or news
          reporting under fair dealing.
        </li>
        <li>
          Automated scraping of the site for commercial redistribution is not
          permitted without prior written consent.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Summaries, credibility scores, and editorial copy on India Verified are
        licensed{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY 4.0
        </a>{" "}
        — you may reuse them with attribution and a link back. Headlines,
        article bodies, and images linked from external publishers remain the
        property of those publishers under their respective terms.
      </p>

      <h2>No warranties</h2>
      <p>
        The service is provided &ldquo;as is&rdquo;. We do not warrant that
        every summary is error-free or that the site will be available without
        interruption. To the maximum extent permitted by law, we disclaim all
        implied warranties of merchantability, fitness for a particular purpose,
        and non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        India Verified, its operators, and its contributors are not liable for
        indirect, incidental, or consequential damages arising from your use of
        the site. Decisions you make based on information found here are your
        own responsibility — for legal, medical, or financial matters please
        consult a qualified professional.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India. Disputes will be
        submitted to the exclusive jurisdiction of the courts at Bengaluru,
        Karnataka.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The &ldquo;Last
        updated&rdquo; date at the top reflects the most recent revision.
      </p>
    </LegalPage>
  );
}
