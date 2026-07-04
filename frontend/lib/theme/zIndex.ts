/**
 * Standardized z-index layers across the application.
 * Use these constants instead of arbitrary z-[x] tailwind classes.
 *
 * Layer stack (0 = lowest, 120 = highest):
 *   0   base
 *   10  content
 *   20  cardOverlay
 *   40  dropdowns
 *   50  stickyNav, tooltips, loadingBar
 *   54  readingProgress
 *   55  mobileNavOverlay
 *   57  mobileNav
 *   58  cookieConsent
 *   60  modalBackdrop
 *   65  drawerPanel
 *   70  prompts (swipe hints, break prompts)
 *   90  shareMenu
 *   92  offlineBanner
 *   95  popover
 *   100 toast (highest notification layer)
 *   110 shortcutBackdrop
 *   111 shortcutWidget
 *   120 adminModal
 */
export const Z_INDEX = {
  base: 'z-0',
  content: 'z-10',
  cardOverlay: 'z-20',
  
  // Floating UI elements inside page
  dropdown: 'z-40',
  stickyNav: 'z-50',
  tooltip: 'z-50',
  loadingBar: 'z-[52]',
  
  // Global layout elements
  skipLink: 'z-[55]',
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
  offlineBanner: 'z-[92]',
  popover: 'z-[95]',
  toast: 'z-[100]',
  
  // Absolute top layers
  shortcutBackdrop: 'z-[110]',
  shortcutWidget: 'z-[111]',
  adminModal: 'z-[120]',
} as const;
