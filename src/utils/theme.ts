/**
 * Unified Design System Tokens
 * Single source of truth for consistent UI across all tabs
 * Supports both light and dark modes
 */

import { getColors, ThemeColors } from './themeColors';

export const createTheme = (isDark: boolean = false) => ({
  // Spacing Scale (Premium 4pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 40,
  },

  // Border Radius Scale (Premium values)
  radius: {
    sm: 14, // Small card
    md: 16,
    lg: 20, // Large card/hero
    xl: 32,
    full: 999, // Pill
  },

  // Shadow/Elevation Tokens (Premium iOS-style)
  shadow: {
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    fab: {
      shadowColor: '#FF6B9D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
  },

  // Typography Scale (Premium Calm/Apple-like)
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: 36,
    },
    section: {
      fontSize: 18,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: 24,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: 30,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: 0,
      lineHeight: 26,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
    captionBold: {
      fontSize: 13,
      fontWeight: '700' as const,
      lineHeight: 18,
    },
    chip: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    small: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },

  // Unified Color System (Dynamic based on theme)
  colors: getColors(isDark),

  // Animation Durations
  animation: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
});

// Default theme export (light mode) for backwards compatibility
export const Theme = createTheme(false);

// Touch Target Minimum Size (Accessibility)
export const TOUCH_TARGET_MIN = 44;
