/**
 * Theme Colors for Light and Dark Modes
 * Comprehensive color system with semantic naming
 */

export interface ThemeColors {
  // Backgrounds
  bg: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;

  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Borders
  border: string;
  borderMedium: string;
  borderStrong: string;

  // Accent Colors
  accent: string;
  accentSoft: string;
  accentDark: string;

  // Semantic Colors
  danger: string;
  error: string; // Alias for danger for compatibility
  success: string;
  warning: string;
  info: string;

  // Special Accents
  gold: string;
  pink: string;

  // Overlay
  overlay: string;
  modalBackground: string;
}

export const lightColors: ThemeColors = {
  // Backgrounds (Premium Calm/Apple-like)
  bg: '#F7F5FF', // Very light lavender
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F0FF',
  surfaceElevated: '#FFFFFF',

  // Text Colors (Premium values)
  textPrimary: '#1F1235', // Deep dark purple
  textSecondary: '#6B5B8A', // Medium purple-gray
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Borders (Premium subtle)
  border: 'rgba(31, 18, 53, 0.08)', // Subtle border
  borderMedium: '#E9D5FF',
  borderStrong: '#D4B5FF',

  // Accent Colors (Unified purple family)
  accent: '#7C3AED', // purple500
  accentSoft: '#E9D5FF',
  accentDark: '#8B5CF6', // purple400

  // Semantic Colors
  danger: '#FF6B6B',
  error: '#FF6B6B', // Alias for danger
  success: '#4CAF50',
  warning: '#FFB84D',
  info: '#3498DB',

  // Special Accents
  gold: '#FFD700',
  pink: '#FF6B9D',

  // Overlay
  overlay: 'rgba(61, 31, 92, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  // Backgrounds
  bg: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#252525',
  surfaceElevated: '#2A2A2A',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B4A7D6',
  textTertiary: '#888888',
  textInverse: '#121212',

  // Borders
  border: '#2A2A2A',
  borderMedium: '#3A3A3A',
  borderStrong: '#4A4A4A',

  // Accent Colors
  accent: '#D49EFF',
  accentSoft: '#3D2A5C',
  accentDark: '#A77FD8',

  // Semantic Colors
  danger: '#FF8A8A',
  error: '#FF8A8A', // Alias for danger
  success: '#66BB6A',
  warning: '#FFD084',
  info: '#64B5F6',

  // Special Accents
  gold: '#FFD700',
  pink: '#FF8AB9',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: 'rgba(0, 0, 0, 0.8)',
};

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}
