/**
 * Score color utilities - single source of truth for credibility colors
 */

/**
 * Credibility tiers (per design spec):
 *   90–100 → High      (green  #22C55E)
 *   70–89  → Moderate  (amber  #F59E0B)
 *   <70    → Low       (red    #EF4444)
 */

export function getScoreTier(score: number): 'high' | 'mid' | 'low' {
  const c = Math.max(0, Math.min(100, score));
  if (c >= 90) return 'high';
  if (c >= 70) return 'mid';
  return 'low';
}

export function getScoreColor(score: number): string {
  const tier = getScoreTier(score);
  if (tier === 'high') return 'bg-cred-high/12 text-cred-high border-cred-high/30';
  if (tier === 'mid') return 'bg-cred-mid/12 text-cred-mid border-cred-mid/30';
  return 'bg-cred-low/12 text-cred-low border-cred-low/30';
}

export function getScoreBgColor(score: number): string {
  const tier = getScoreTier(score);
  if (tier === 'high') return 'bg-cred-high text-black';
  if (tier === 'mid') return 'bg-cred-mid text-black';
  return 'bg-cred-low text-white';
}

export function getScoreLabel(score: number): string {
  const tier = getScoreTier(score);
  if (tier === 'high') return 'High credibility';
  if (tier === 'mid') return 'Moderate';
  return 'Low';
}

export function getScoreHex(score: number): string {
  const tier = getScoreTier(score);
  if (tier === 'high') return '#22c55e';
  if (tier === 'mid') return '#f59e0b';
  return '#ef4444';
}
