interface ReadingTimeProps {
  text: string;
}

const WPM = 220;

export function ReadingTime({ text }: ReadingTimeProps) {
  const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
  const minutes = wordCount / WPM;

  const label = minutes < 1 ? 'Quick read' : `${Math.ceil(minutes)} min read`;

  return <span className="text-sm">{label}</span>;
}
