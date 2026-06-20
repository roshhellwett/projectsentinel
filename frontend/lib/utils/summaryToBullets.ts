

export function summaryToBullets(summary: string | null | undefined, max: number = 3): string[] {
  if (!summary) return [];
  const trimmed = summary.trim();
  if (!trimmed) return [];

  // 1. Protect abbreviations by replacing their dots with a temporary token.
  // This completely eliminates the need for regex lookbehinds (which crash old Safari).
  const processed = trimmed
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Rev|St|Gov|Jr|Sr|vs|etc|Inc|Ltd|Co|Corp|Mt|Ft)\./gi, '$1{{DOT}}')
    .replace(/\b([a-zA-Z])\./g, '$1{{DOT}}'); // Protects U.S., A.I., e.g., i.e., etc.

  // 2. Split on sentence boundaries using a capturing group for the punctuation.
  // A boundary is a punctuation mark, optionally followed by closing quotes/brackets,
  // then followed by whitespace and a starting character (Lookahead is universally supported).
  const parts = processed.split(/([.!?]+["')\]]*)(?=\s+[A-Z0-9"'(\[]|$)/g);

  const sentences: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i].trim();
    const punctuation = parts[i + 1] || '';
    if (text) {
      const combined = (text + punctuation).replace(/\{\{DOT\}\}/g, '.');
      sentences.push(combined);
    }
  }

  if (sentences.length >= max) return sentences.slice(0, max);

  // 3. Fallback: if only 1 sentence, try splitting by commas/semicolons for dense texts.
  if (sentences.length === 1) {
    const fallbackParts = sentences[0]
      .split(/[,;:]\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 12);
    if (fallbackParts.length >= 2) return fallbackParts.slice(0, max);
  }

  return sentences.length > 0 ? sentences : [trimmed];
}
