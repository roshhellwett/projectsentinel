"use client";

import { memo, useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { Source } from "@/types";
import { getHostname } from "@/lib/utils/getHostname";
import { useI18n } from "@/lib/i18n/i18n-shared";

interface SourceLinksProps {
  sources: Source[];
}

function getSourceLabel(source: Source): string {
  if (source.title && source.title.trim()) return source.title.trim();
  if (source.name && source.name.trim()) return source.name.trim();
  const host = getHostname(source.url);
  return host || source.url || "Source";
}

const SourceFavicon = memo(function SourceFavicon({ url }: { url: string }) {
  const [errored, setErrored] = useState(false);
  const host = getHostname(url);

  if (!host || errored) {
    return (
      <span
        aria-hidden="true"
        className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-sm bg-paper-2 text-muted"
      >
        <Globe className="w-3 h-3" />
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      sizes="16px"
      className="flex-shrink-0 w-4 h-4 rounded-sm bg-paper shadow-[0_1px_2px_rgba(15,23,42,0.10)]"
    />
  );
});

export const SourceLinks = memo(function SourceLinks({
  sources,
}: SourceLinksProps) {
  const { t } = useI18n();
  if (!sources || sources.length === 0) {
    return <p className="text-sm text-muted">{t("drawer.no_sources")}</p>;
  }

  return (
    <ul className="space-y-2.5" role="list">
      {sources.map((source, index) => {
        const label = getSourceLabel(source);
        return (
          <li key={`${source.url || "src"}-${index}`}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target min-h-[44px] touch-polish flex items-center gap-3 rounded-xl border border-rule/80 bg-paper-2/60 px-4 py-3 text-sm text-ink hover:border-ink hover:bg-paper hover:shadow-2xs active:scale-[0.98] transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              aria-label={`Read full article on ${label} (opens in new tab)`}
            >
              <SourceFavicon url={source.url} />
              <span className="flex-1 min-w-0 truncate font-mono font-bold text-[13px] tracking-tight">
                {label}
              </span>
              <ExternalLink className="w-4 h-4 text-ink-soft group-hover:text-ink group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </a>
          </li>
        );
      })}
    </ul>
  );
});
