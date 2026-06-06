

export function summaryToBullets(summary: string | null | undefined, max: number = 3): string[] {
  if (!summary) return [];
  const trimmed = summary.trim();
  if (!trimmed) return [];

  const sentences = trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(\[])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length >= max) return sentences.slice(0, max);

  if (sentences.length === 1) {
    const parts = sentences[0]
      .split(/[,;:]\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 12);
    if (parts.length >= 2) return parts.slice(0, max);
  }

  return sentences.length > 0 ? sentences : [trimmed];
}
