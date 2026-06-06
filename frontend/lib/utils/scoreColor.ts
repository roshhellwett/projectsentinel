

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
