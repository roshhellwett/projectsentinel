export const ANIMATION = {
  hover: 'transition-colors duration-200',
  transform: 'transition-transform duration-300 transform-gpu',
  fade: 'transition-opacity duration-300',
  all: 'transition-all duration-300',
  spring: 'transition-transform duration-500 ease-out',
  slow: 'transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
} as const;
