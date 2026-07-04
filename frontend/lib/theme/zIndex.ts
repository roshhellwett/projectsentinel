/**
 * Standardized z-index layers across the application.
 * Use these constants instead of arbitrary z-[x] tailwind classes.
 */
export const Z_INDEX = {
  base: 'z-0',
  content: 'z-10',
  cardOverlay: 'z-20',
  
  // Floating UI elements inside page
  dropdown: 'z-40',
  stickyNav: 'z-50',
  tooltip: 'z-50',
  
  // Global layout elements
  readingProgress: 'z-[54]',
  mobileNavOverlay: 'z-[55]',
  mobileNav: 'z-[57]',
  cookieConsent: 'z-[58]',
  
  // Modals & Overlays
  modalBackdrop: 'z-[60]',
  drawerPanel: 'z-[65]',
  prompts: 'z-[70]', // Swipe hints, break prompts
  
  // High-priority modals
  shareMenu: 'z-[90]',
  popover: 'z-[100]',
  toast: 'z-[100]',
  offlineBanner: 'z-[100]',
  
  // Absolute top layers
  shortcutBackdrop: 'z-[110]',
  shortcutWidget: 'z-[111]',
  adminModal: 'z-[120]',
} as const;
