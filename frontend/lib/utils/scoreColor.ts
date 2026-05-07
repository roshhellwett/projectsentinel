/**
 * Score color utilities - single source of truth for credibility colors
 */

export function getScoreColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 80) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (clamped >= 60) return 'bg-amber-50 text-amber-800 ring-amber-200';
  return 'bg-red-50 text-red-700 ring-red-200';
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
