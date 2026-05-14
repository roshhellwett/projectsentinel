interface ReadingTimeProps {
  text: string;
}

export function ReadingTime({ text }: ReadingTimeProps) {
  const wordsPerMinute = 200;
  const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
  const minutes = wordCount / wordsPerMinute;

  // For very short texts (summaries are typically 3 sentences / ~60 words),
  // show "Quick read" instead of the misleading "< 1 min read".
  const label = minutes < 1 ? 'Quick read' : `${Math.ceil(minutes)} min read`;

  return <span className="text-sm">{label}</span>;
}
