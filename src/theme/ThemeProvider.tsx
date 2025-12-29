/**
 * Theme Provider
 * Provides unified design tokens via React Context
 * Syncs with the main ThemeContext for consistent theming across the app
 * Provides dark mode aware tokens
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { getTokens, Tokens } from './tokens';
import { useTheme as useMainTheme } from '../context/ThemeContext';

interface ThemeContextValue {
  theme: Tokens;
  isDark: boolean;
  toggleTheme?: () => void;
}

// Default light mode tokens for initial context
const defaultTokens = getTokens(false);

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTokens,
  isDark: false,
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Wraps app to provide unified design tokens
 * Syncs with the main ThemeContext to ensure consistent theming
 * Provides theme-aware tokens (light/dark mode)
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  if (__DEV__) {
    console.log('✅ ThemeProvider rendering...');
  }
  
  // Sync with the main ThemeContext from ThemeContext.tsx
  // This ensures all components use the same theme state
  const mainTheme = useMainTheme();
  const isDark = mainTheme.isDark;

  // Get theme-aware tokens (light or dark)
  const theme = useMemo(() => getTokens(isDark), [isDark]);

  const value: ThemeContextValue = {
    theme, // Theme-aware tokens (light or dark)
    isDark,
    // Note: toggleTheme is handled by the main ThemeContext
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access unified theme tokens
 * This hook provides the same interface but syncs with the main theme
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};






