/**
 * Text truncation utilities
 * Fixed: null checks, proper whitespace handling
 */

export function truncateWords(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ') + '...';
}

export function truncateChars(text: string, maxChars: number): string {
  if (!text) return '';
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(0, maxChars) + '...';
}
