/**
 * Renders list of source links
 * Fixed: unique keys, aria labels
 */

import { ExternalLink } from 'lucide-react';
import { Source } from '@/types';

interface SourceLinksProps {
  sources: Source[];
}

export function SourceLinks({ sources }: SourceLinksProps) {
  return (
    <ul className="space-y-2" role="list">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors duration-200 group"
            aria-label={`Read full article on ${source.name} (opens in new tab)`}
          >
            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="underline underline-offset-2">{source.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
