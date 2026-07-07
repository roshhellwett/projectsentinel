export const ANIMATION = {
  hover: 'transition-colors duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]',
  transform: 'transition-transform duration-300 transform-gpu ease-[cubic-bezier(0.16,1,0.3,1)]',
  fade: 'transition-opacity duration-300 ease-out',
  all: 'transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu',
  spring: 'transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.15)] transform-gpu',
  slow: 'transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu',
} as const;

export const IOS_SPRING = {
  snappy: { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.8 },
  smooth: { type: "spring" as const, stiffness: 350, damping: 35, mass: 1 },
  gentle: { type: "spring" as const, stiffness: 250, damping: 30, mass: 1 },
  bouncy: { type: "spring" as const, stiffness: 450, damping: 15, mass: 1 },
  pill: { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.9 },
  sheet: { type: "spring" as const, stiffness: 380, damping: 32, mass: 1 },
} as const;

