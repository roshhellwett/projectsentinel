// last edited 2026-05-17 by roshhellwett

export function truncateWords(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ') + '...';
}
