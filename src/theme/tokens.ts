/**
 * Centralized Design System Tokens
 * Apple-clean + subtle glass aesthetic
 * Single source of truth for all design values
 */

import { Platform } from 'react-native';

// Color Tokens
export const colors = {
  // Backgrounds
  bg: '#F7F6FF',
  card: 'rgba(255,255,255,0.92)',
  
  // Text
  textPrimary: '#1C1B22',
  textSecondary: 'rgba(28,27,34,0.58)',
  
  // Borders
  border: 'rgba(90,84,120,0.12)',
  
  // Tints
  tintPurple: '#7C3AED',
  tintLavender: '#A78BFA',
  
  // Semantic
  success: '#4CAF50',
  warning: '#FFB84D',
} as const;

// Radius Tokens
export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

// Spacing Tokens
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Typography Scale
export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
} as const;

// Shadow Presets (subtle card shadow)
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
  }),
} as const;

// Glass effects
export const glass = {
  overlay: 'rgba(255,255,255,0.72)',
  blurIntensity: 25,
} as const;

// Complete Tokens Object
export const tokens = {
  colors,
  radii,
  spacing,
  typography,
  shadows,
  glass,
} as const;

// Type Exports
export type Tokens = typeof tokens;
export type ColorTokens = typeof colors;
export type RadiusTokens = typeof radii;
export type SpacingTokens = typeof spacing;
export type TypographyTokens = typeof typography;
export type ShadowTokens = typeof shadows;

