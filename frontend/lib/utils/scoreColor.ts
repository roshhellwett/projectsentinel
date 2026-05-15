/**
 * Score color utilities — single source of truth for credibility colors.
 *
 * IMPORTANT: These hex values MUST match the tailwind config tokens
 * (`cred-high`, `cred-mid`, `cred-low`) so credibility bars, compact
 * badges, and text-cred-* utility classes render the same hue for a
 * given score tier.
 *
 * Credibility tiers (per design spec):
 *   90–100 → High      (mint   #10b981)   — matches `cred-high`
 *   70–89  → Moderate  (lavender #8b7ff0) — matches `cred-mid`
 *   <70    → Low       (peach  #f59e0b)   — matches `cred-low`
 */

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
  const tier = getScoreTier(score);
  if (tier === 'high') return '#10b981';
  if (tier === 'mid') return '#8b7ff0';
  return '#f59e0b';
}
