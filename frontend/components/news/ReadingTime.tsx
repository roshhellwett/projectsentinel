interface ReadingTimeProps {
  text: string;
}

export function ReadingTime({ text }: ReadingTimeProps) {
  const wordsPerMinute = 200;
  const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
  const minutes = wordCount / wordsPerMinute;

  const label = minutes < 1 ? '< 1 min read' : `${Math.ceil(minutes)} min read`;

  return <span className="text-sm">{label}</span>;
}
