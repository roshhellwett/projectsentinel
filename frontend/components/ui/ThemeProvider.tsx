'use client';

/**
 * ThemeProvider — locked to dark mode as per global design spec.
 * The legacy `useTheme()` hook is preserved for backward compatibility
 * with any consumers, but theme is always 'dark' and toggleTheme is a no-op.
 */

import { createContext, useContext, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
