export function summaryToBullets(
  summary: string | null | undefined,
  max: number = 3,
): string[] {
  if (!summary) return [];
  const trimmed = summary.trim();
  if (!trimmed) return [];

  const processed = trimmed
    .replace(
      /\b(Mr|Mrs|Ms|Dr|Prof|Rev|St|Gov|Jr|Sr|vs|etc|Inc|Ltd|Co|Corp|Mt|Ft)\./gi,
      "$1{{DOT}}",
    )
    .replace(/\b([a-zA-Z])\./g, "$1{{DOT}}");

  const parts = processed.split(/([.!?]+["')\]]*)(?=\s+[A-Z0-9"'(\[]|$)/g);

  const sentences: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i].trim();
    const punctuation = parts[i + 1] || "";
    if (text) {
      const combined = (text + punctuation).replace(/\{\{DOT\}\}/g, ".");
      sentences.push(combined);
    }
  }

  if (sentences.length >= max) return sentences.slice(0, max);

  if (sentences.length === 1) {
    const fallbackParts = sentences[0]
      .split(/[,;:]\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 12);
    if (fallbackParts.length >= 2) return fallbackParts.slice(0, max);
  }

  return sentences.length > 0 ? sentences : [trimmed];
}
