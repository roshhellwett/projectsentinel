export const IOS_SPRING = {
  snappy: { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.8 },
  smooth: { type: "spring" as const, stiffness: 350, damping: 35, mass: 1 },
  gentle: { type: "spring" as const, stiffness: 250, damping: 30, mass: 1 },
  bouncy: { type: "spring" as const, stiffness: 450, damping: 15, mass: 1 },
  pill: { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.9 },
  sheet: { type: "spring" as const, stiffness: 380, damping: 32, mass: 1 },
} as const;
