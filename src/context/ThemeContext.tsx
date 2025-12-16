import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from '../utils/theme';

const THEME_STORAGE_KEY = '@theme_preference';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  theme: ReturnType<typeof createTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>('light');

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update active theme when mode or system preference changes
  useEffect(() => {
    if (themeMode === 'auto') {
      setActiveTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setActiveTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const isDark = activeTheme === 'dark';

  // Create dynamic theme based on active theme
  const theme = useMemo(() => createTheme(isDark), [isDark]);

  return (
    <ThemeContext.Provider value={{ themeMode, activeTheme, setThemeMode, isDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
