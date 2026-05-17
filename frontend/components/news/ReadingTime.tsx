// last edited 2026-05-17 by roshhellwett

interface ReadingTimeProps {
  text: string;
}

export function ReadingTime({ text }: ReadingTimeProps) {
  const wordsPerMinute = 200;
  const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
  const minutes = wordCount / wordsPerMinute;

  const label = minutes < 1 ? 'Quick read' : `${Math.ceil(minutes)} min read`;

  return <span className="text-sm">{label}</span>;
}
