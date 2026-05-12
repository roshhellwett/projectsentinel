/**
 * Category tag pill with accent-tinted variants.
 * Constrained width (max-w) prevents overflow inside cards.
 */

import { Category } from '@/types';
import type { CSSProperties } from 'react';

interface CategoryTagProps {
  category: Category | string;
  className?: string;
}

/**
 * Pastel tint per category — matches the redesign brief exactly.
 * Each entry returns the inline style for the pill: a soft tinted
 * background, a slightly darker border of the same hue and a dark
 * variant text color that still passes WCAG AA on the pastel fill.
 */
const CATEGORY_STYLE: Record<string, CSSProperties> = {
  // Politics — soft red
  politics:      { background: 'rgba(254, 202, 202, 0.8)', color: '#9f1239', borderColor: 'rgba(244, 114, 114, 0.45)' },
  // Business — soft mint green
  business:      { background: 'rgba(167, 243, 208, 0.8)', color: '#065f46', borderColor: 'rgba(110, 220, 175, 0.5)'  },
  // Sports — soft sky blue
  sports:        { background: 'rgba(186, 230, 253, 0.8)', color: '#075985', borderColor: 'rgba(120, 200, 245, 0.5)'  },
  // Tech — soft purple
  tech:          { background: 'rgba(221, 214, 254, 0.8)', color: '#4c1d95', borderColor: 'rgba(180, 165, 245, 0.5)'  },
  // Crime — soft peach
  crime:         { background: 'rgba(254, 215, 170, 0.8)', color: '#9a3412', borderColor: 'rgba(245, 175, 110, 0.5)'  },
  // Science — soft violet
  science:       { background: 'rgba(221, 214, 254, 0.8)', color: '#5b21b6', borderColor: 'rgba(180, 165, 245, 0.5)'  },
  // Health — soft pink
  health:        { background: 'rgba(252, 207, 232, 0.8)', color: '#9d174d', borderColor: 'rgba(245, 170, 210, 0.5)'  },
  // World — soft amber
  world:         { background: 'rgba(253, 230, 138, 0.8)', color: '#854d0e', borderColor: 'rgba(240, 200, 110, 0.5)'  },
  // Entertainment — soft fuchsia
  entertainment: { background: 'rgba(245, 208, 254, 0.8)', color: '#86198f', borderColor: 'rgba(225, 175, 240, 0.5)'  },
  // Education — soft lavender
  education:     { background: 'rgba(221, 214, 254, 0.8)', color: '#5b21b6', borderColor: 'rgba(180, 165, 245, 0.5)'  },
};

const DEFAULT_STYLE: CSSProperties = {
  background: 'rgba(226, 232, 240, 0.8)',
  color: '#334155',
  borderColor: 'rgba(180, 195, 215, 0.5)',
};

export function CategoryTag({ category, className = '' }: CategoryTagProps) {
  const style = CATEGORY_STYLE[category] || DEFAULT_STYLE;
  const display = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <span
      className={`inline-flex items-center max-w-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase rounded-full border ${className}`}
      style={style}
    >
      <span className="truncate">{display}</span>
    </span>
  );
}
