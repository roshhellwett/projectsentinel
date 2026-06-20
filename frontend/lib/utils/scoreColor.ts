

export function getScoreTier(score: number): 'high' | 'mid' | 'low' {
  const c = Math.max(0, Math.min(100, score));
  if (c >= 90) return 'high';
  if (c >= 70) return 'mid';
  return 'low';
}

export function getScoreLabel(score: number): string {
  const tier = getScoreTier(score);
  if (tier === 'high') return 'High credibility';
  if (tier === 'mid') return 'Moderate';
  return 'Low';
}

export function getScoreHex(score: number): string {
  const c = Math.max(0, Math.min(100, Math.round(score)));
  // Map score (0-100) to hue (0-130: red to green). We use 130 for a crisp emerald green at 100.
  const hue = Math.round((c / 100) * 130);
  // Returns a CSS HSL string that evaluates native variables for flawless dark mode support.
  return `hsl(${hue}, var(--cred-s), var(--cred-l))`;
}
