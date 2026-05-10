/**
 * Renders list of source links.
 * Always shows a human-readable label (title > name > hostname). Never raw URLs.
 */

import { ExternalLink } from 'lucide-react';
import { Source } from '@/types';

interface SourceLinksProps {
  sources: Source[];
}

function getSourceLabel(source: Source): string {
  if (source.title && source.title.trim()) return source.title.trim();
  if (source.name && source.name.trim()) return source.name.trim();
  try {
    return new URL(source.url).hostname.replace(/^www\./, '');
  } catch {
    return source.url || 'Source';
  }
}

export function SourceLinks({ sources }: SourceLinksProps) {
  if (!sources || sources.length === 0) {
    return <p className="text-sm text-slate-500">No sources available.</p>;
  }

  return (
    <ul className="space-y-2" role="list">
      {sources.map((source, index) => {
        const label = getSourceLabel(source);
        return (
          <li key={source.url || index}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors duration-200 group"
              aria-label={`Read full article on ${label} (opens in new tab)`}
            >
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="underline underline-offset-2">{label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
