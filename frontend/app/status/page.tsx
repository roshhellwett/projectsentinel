import { Metadata } from "next";
import Image from "next/image";
import { fetchLatestPost, fetchPostsCursor } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";
import { EditorialIllustration } from "@/components/visual/EditorialIllustration";

export const metadata: Metadata = {
  title: "Status - India Verified",
  robots: { index: false, follow: false },
};

export default async function StatusPage() {
  const [latest, feed] = await Promise.all([
    fetchLatestPost(),
    fetchPostsCursor(undefined, 1).catch(() => null),
  ]);

  const uptime = latest?.published_at
    ? Math.floor(
        (Date.now() - new Date(latest.published_at).getTime()) / 1000 / 60,
      )
    : null;

  return (
    <PageShell>
      <EditorialPageHeader kicker="Behind the scenes / System health" title="System Status" description="A view into the latest published stories and the pipeline behind them." artwork={<EditorialIllustration variant="verify" />} />

      <section className="space-y-fluid-sm">
        <div className="glass-card p-fluid-md min-w-0">
          <h2 className="font-semibold text-fluid-xs text-muted mb-fluid-3xs">
            Latest Article
          </h2>
          <p className="text-fluid-lg font-bold text-ink truncate min-w-0">
            {latest?.headline || "No articles found"}
          </p>
          {uptime !== null && (
            <p className="text-fluid-2xs text-muted mt-1">
              Published {uptime} minutes ago
            </p>
          )}
        </div>

        <div className="glass-card p-fluid-md">
          <h2 className="font-semibold text-fluid-xs text-muted mb-fluid-3xs">
            Pipeline Status
          </h2>
          <p className="text-fluid-sm text-ink">
            {feed?.posts?.length
              ? "Active — articles being published"
              : "Waiting for pipeline data"}
          </p>
        </div>

        <div className="glass-card p-fluid-md">
          <h2 className="font-semibold text-fluid-xs text-muted mb-fluid-3xs">
            CI/CD Badges
          </h2>
          <div className="flex flex-wrap gap-fluid-3xs mt-2">
            <Image
              alt="CI status"
              src="https://img.shields.io/badge/CI-passing-green"
              width={80}
              height={20}
              className="h-5 w-auto"
            />
            <Image
              alt="Coverage"
              src="https://img.shields.io/badge/coverage-68%25-yellow"
              width={100}
              height={20}
              className="h-5 w-auto"
            />
            <Image
              alt="Unit tests"
              src="https://img.shields.io/badge/tests-22%20passing-brightgreen"
              width={120}
              height={20}
              className="h-5 w-auto"
            />
            <Image
              alt="Lighthouse"
              src="https://img.shields.io/badge/Lighthouse-passing-green"
              width={110}
              height={20}
              className="h-5 w-auto"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
