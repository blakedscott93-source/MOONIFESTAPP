/**
 * Theme Provider
 * Provides theme tokens and dark mode state via React Context
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { tokens, Tokens } from './tokens';

interface ThemeContextValue {
  theme: Tokens;
  isDark: boolean;
  toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: tokens,
  isDark: false,
});

interface ThemeProviderProps {
  children: ReactNode;
  initialIsDark?: boolean;
}

/**
 * Theme Provider Component
 * Wraps app to provide theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialIsDark = false,
}) => {
  const [isDark, setIsDark] = useState(initialIsDark);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const value: ThemeContextValue = {
    theme: tokens, // For now, tokens are static (light mode)
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};


