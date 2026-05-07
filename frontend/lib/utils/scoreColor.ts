/**
 * Score color utilities - single source of truth for credibility colors
 */

export function getScoreColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 80) return 'text-success';
  if (clamped >= 60) return 'text-warning';
  return 'text-danger';
}

export function getScoreBgColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 80) return 'bg-success text-white';
  if (clamped >= 60) return 'bg-warning text-black';
  return 'bg-danger text-white';
}

export function getScoreLabel(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 80) return 'High credibility';
  if (clamped >= 60) return 'Moderate credibility';
  return 'Low credibility';
}
