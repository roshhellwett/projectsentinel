import {
  Landmark,
  TrendingUp,
  Trophy,
  Siren,
  Cpu,
  FlaskConical,
  HeartPulse,
  Globe,
  Clapperboard,
  GraduationCap,
  Newspaper,
  type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

const ICON_MAP: Record<string, FC<LucideProps>> = {
  'landmark':       Landmark,
  'trending-up':    TrendingUp,
  'trophy':         Trophy,
  'siren':          Siren,
  'cpu':            Cpu,
  'flask-conical':  FlaskConical,
  'heart-pulse':    HeartPulse,
  'globe':          Globe,
  'clapperboard':   Clapperboard,
  'graduation-cap': GraduationCap,
  'newspaper':      Newspaper,
};

interface CategoryIconProps extends LucideProps {
  /** The icon identifier from CategoryTheme.icon */
  name: string;
}

/**
 * Renders a Lucide icon for a category, resolved by its string identifier.
 * Falls back to Newspaper if the name is unrecognized.
 */
export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = ICON_MAP[name] ?? Newspaper;
  return <Icon {...props} />;
}
