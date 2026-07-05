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
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = ICON_MAP[name] ?? Newspaper;
  return <Icon {...props} />;
}
