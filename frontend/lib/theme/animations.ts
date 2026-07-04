/**
 * Standardized animation utility classes.
 * Use these to maintain consistent timing and easing across the application.
 */
export const ANIMATION = {
  // Standard hover state transitions (buttons, links, generic color changes)
  hover: 'transition-colors duration-200',
  
  // Layout and transform transitions (expanding sections, dragging, translation)
  transform: 'transition-transform duration-300 transform-gpu',
  
  // Opacity fade transitions (modals, overlays, lazy loaded images)
  fade: 'transition-opacity duration-300',
  
  // Multi-property transitions (complex components, cards, complex state changes)
  all: 'transition-all duration-300',
  
  // Spring/elastic animations
  spring: 'transition-transform duration-500 ease-out',
  
  // Specific slow animations (progress bars, credibility bars)
  slow: 'transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
} as const;
