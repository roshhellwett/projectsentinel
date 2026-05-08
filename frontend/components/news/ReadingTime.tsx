import { Clock } from 'lucide-react';

interface ReadingTimeProps {
  text: string;
}

export function ReadingTime({ text }: ReadingTimeProps) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return (
    <span className="inline-flex items-center gap-1.5 text-slate-500">
      <Clock className="w-4 h-4" />
      <span className="text-sm">{readingTime} min read</span>
    </span>
  );
}
