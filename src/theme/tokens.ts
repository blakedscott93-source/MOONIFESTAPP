/**
 * Unified Design System Tokens
 * Single source of truth for premium, calm, adult design
 * Inspired by: Apple Health, Calm, Notion Mobile, Modern fitness apps
 */

import { Platform } from 'react-native';

// ============================================
// FONTS
// ============================================
export const fonts = {
  headingBold: 'Sora_700Bold',
  heading: 'Sora_600SemiBold',
  headingRegular: 'Sora_400Regular',
} as const;

// ============================================
// SPACING SYSTEM (6, 10, 12, 16, 24)
// ============================================
export const spacing = {
  xs: 6,   // Extra tight spacing
  sm: 10,  // Small spacing
  md: 12,  // Medium spacing
  lg: 16,  // Large spacing (default card padding, screen edges)
  xl: 24,  // Extra large spacing (section spacing)
  xxl: 32, // Extra extra large spacing (buttons, hero sections)
} as const;

// ============================================
// BORDER RADIUS (12, 18, 22, 28)
// ============================================
export const radii = {
  sm: 12,  // Small elements, chips
  md: 18,  // Standard cards
  lg: 22,  // Large cards, hero sections, tab bar pill
  xl: 28,  // Extra large, floating elements
  full: 999, // Pill shape, circular
} as const;

// ============================================
// SHADOWS (Subtle, grounded, not floating)
// Dark mode uses lighter shadows for proper elevation
// ============================================
export const getShadows = (isDark: boolean) => {
  const shadowColor = isDark ? '#000000' : '#000000';
  const shadowColorLight = isDark ? 'rgba(255, 255, 255, 0.1)' : '#000000';
  
  return {
    subtle: Platform.select({
      ios: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.15 : 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.15 : 0.06,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
    card: Platform.select({
      ios: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
    floating: Platform.select({
      ios: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.3 : 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.3 : 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
    elevated: Platform.select({
      ios: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.25 : 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: isDark ? shadowColorLight : shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.25 : 0.1,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  };
};

// Legacy shadows (light mode only, for backward compatibility)
export const shadows = getShadows(false);

// ============================================
// TYPOGRAPHY (Calm, confident, breathable)
// ============================================
export const typography = {
  // Large titles - bold, calm, confident
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: fonts.headingBold,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  // Section headers (h2)
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    fontFamily: fonts.heading,
    letterSpacing: -0.2,
    lineHeight: 30,
  },
  // Subheadings (h3)
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: fonts.heading,
    letterSpacing: 0,
    lineHeight: 24,
  },
  // Legacy headline (alias for h2)
  headline: {
    fontSize: 22,
    fontWeight: '700' as const,
    fontFamily: fonts.heading,
    letterSpacing: -0.2,
    lineHeight: 30,
  },
  // Legacy subhead (alias for h3)
  subhead: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: fonts.heading,
    letterSpacing: 0,
    lineHeight: 24,
  },
  // Body text - lighter, more breathable
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  // Small text
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  captionMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  // Tiny text
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
} as const;

// ============================================
// COLORS (Premium, calm, restrained)
// Light mode colors
// ============================================
export const colorsLight = {
  // Backgrounds (Apple HIG inspired)
  background: '#F6F5FB', // Soft neutral background
  bg: '#F6F5FB', // Alias for background
  surface: '#FFFFFF', // White cards on soft background
  card: '#FFFFFF', // Alias for surface
  surfaceSecondary: '#F5F0FF', // Secondary surface
  surfaceElevated: 'rgba(255, 255, 255, 0.95)', // Elevated surfaces
  cardSubtle: 'rgba(255, 255, 255, 0.92)', // Legacy alias
  
  // Text (Restrained, not playful)
  textPrimary: '#1C1B22', // Deep, calm
  textSecondary: 'rgba(28, 27, 34, 0.6)', // Muted
  textTertiary: 'rgba(28, 27, 34, 0.4)', // Very muted
  textInverse: '#FFFFFF', // Inverse text
  
  // Borders (Subtle)
  borderSubtle: 'rgba(90, 84, 120, 0.12)',
  border: 'rgba(90, 84, 120, 0.12)', // Alias
  borderMedium: 'rgba(90, 84, 120, 0.2)',
  borderStrong: 'rgba(90, 84, 120, 0.3)',
  
  // Primary (Purple = accent, not background everywhere)
  primary: '#7C3AED', // Primary purple
  accent: '#7C3AED', // Alias for primary
  accentSoft: '#E9D5FF', // Soft purple tint
  accentDark: '#6D28D9', // Dark purple
  // Legacy tint names (for compatibility)
  tintPurple: '#7C3AED', // Same as accent
  tintLavender: '#A78BFA', // Lighter purple
  
  // Semantic
  success: '#4CAF50',
  warning: '#FFB84D',
  error: '#EF4444',
  
  // Glass effects (light mode)
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassOverlay: 'rgba(255, 255, 255, 0.7)',
} as const;

// ============================================
// DARK MODE COLORS (Premium, high-contrast, intentional)
// True black background with frosted obsidian glass cards
// ============================================
export const colorsDark = {
  // Backgrounds (True black for premium space feel)
  background: '#000000', // True black - starfield background
  bg: '#000000', // Alias for background
  surface: '#1A1824', // Elevated surface - more readable (was #14121E)
  card: '#1A1824', // Alias for surface
  surfaceSecondary: '#242030', // Secondary elevated - better contrast (was #1A1824)
  surfaceElevated: '#2A2836', // Higher elevation - clearly visible (was #201E2A)
  cardSubtle: 'rgba(26, 24, 36, 0.85)', // Legacy alias - more opaque
  
  // Text (High contrast for readability)
  textPrimary: '#FFFFFF', // Pure white for maximum contrast
  textSecondary: 'rgba(255, 255, 255, 0.85)', // More readable (was 0.7)
  textTertiary: 'rgba(255, 255, 255, 0.65)', // More readable (was 0.5)
  textInverse: '#000000', // Inverse text (dark on light)
  
  // Borders (More visible for better definition)
  borderSubtle: 'rgba(255, 255, 255, 0.10)', // More visible (was 0.06)
  border: 'rgba(255, 255, 255, 0.10)', // Alias
  borderMedium: 'rgba(255, 255, 255, 0.15)', // More visible (was 0.1)
  borderStrong: 'rgba(255, 255, 255, 0.20)', // More visible (was 0.15)
  
  // Primary (Brighter purple for dark mode visibility)
  primary: '#C4B5FD', // Even brighter purple for better visibility (was #B794F6)
  accent: '#C4B5FD', // Alias for primary
  accentSoft: 'rgba(196, 181, 253, 0.30)', // More visible tint (was 0.25)
  accentDark: '#A78BFA', // Darker purple variant
  // Legacy tint names (for compatibility)
  tintPurple: '#C4B5FD', // Same as accent
  tintLavender: '#DDD6FE', // Lighter purple
  
  // Semantic (Adjusted for dark mode visibility)
  success: '#6EE7B7', // Bright green
  warning: '#FCD34D', // Bright yellow
  error: '#F87171', // Bright red
  
  // Glass effects (dark mode - frosted obsidian glass with better contrast)
  glass: 'rgba(26, 24, 36, 0.75)', // More opaque for better contrast (was rgba(20, 18, 30, 0.7))
  glassBorder: 'rgba(255, 255, 255, 0.10)', // More visible border (was 0.06)
  glassOverlay: 'rgba(26, 24, 36, 0.75)', // Dark glass overlay
} as const;

// Legacy colors export (light mode, for backward compatibility)
export const colors = colorsLight;

// Function to get colors based on theme
export const getColors = (isDark: boolean) => {
  return isDark ? colorsDark : colorsLight;
};

// ============================================
// GLASS EFFECTS (Used sparingly)
// Dark mode: Frosted obsidian glass with stronger blur
// Light mode: Standard frosted glass
// ============================================
export const getGlass = (isDark: boolean) => {
  if (isDark) {
    return {
      bgAlpha: 0.75, // Background alpha (dark mode - more opaque for better contrast)
      borderAlpha: 0.10, // Border alpha (more visible inner border)
      blurIntensity: 40, // Stronger blur for dark mode (35-45 range) - frosted obsidian
      overlay: 'rgba(26, 24, 36, 0.75)', // Frosted obsidian glass overlay - better contrast
      border: 'rgba(255, 255, 255, 0.10)', // More visible inner border
      tint: 'dark' as const, // BlurView tint for dark mode
    };
  }
  return {
    bgAlpha: 0.7, // Background alpha (0.65-0.75 range)
    borderAlpha: 0.4, // Border alpha
    blurIntensity: 20, // Blur intensity (18-24 range)
    overlay: 'rgba(255, 255, 255, 0.7)', // Light glass overlay
    border: 'rgba(255, 255, 255, 0.4)', // White border
    tint: 'light' as const, // BlurView tint for light mode
  };
};

// Legacy glass export (light mode, for backward compatibility)
export const glass = getGlass(false);

// ============================================
// TAB BAR CONSTANTS
// ============================================
export const tabBar = {
  // Floating pill dimensions (Cal AI style)
  PILL_HEIGHT: 64,
  PILL_BOTTOM_OFFSET: 12,
  PILL_BORDER_RADIUS: 32,
  PLUS_BUTTON_SIZE: 56,
  PLUS_BUTTON_SPACING: 12,
  // Legacy constants (keep for compatibility)
  height: 72,
  bottomOffset: 14,
  horizontalPadding: 16,
  borderRadius: 28, // xl radius
  blurIntensity: 45, // 40-55 range, using 45
  indicatorHeight: 48,
  indicatorRadius: 22, // lg radius
  TAB_BAR_SPACE: 100, // Space to reserve for tab bar (height + offset + breathing room)
} as const;

// ============================================
// COMPLETE TOKENS OBJECT
// Function to get theme-aware tokens
// ============================================
export const getTokens = (isDark: boolean = false) => {
  return {
    spacing,
    radii,
    shadows: getShadows(isDark),
    typography,
    colors: getColors(isDark),
    glass: getGlass(isDark),
    tabBar,
  };
};

// Legacy tokens export (light mode, for backward compatibility)
export const tokens = getTokens(false);

// ============================================
// TYPE EXPORTS
// ============================================
export type Tokens = typeof tokens;
export type SpacingTokens = typeof spacing;
export type RadiusTokens = typeof radii;
export type ShadowTokens = typeof shadows;
export type TypographyTokens = typeof typography;
export type ColorTokens = typeof colors;
