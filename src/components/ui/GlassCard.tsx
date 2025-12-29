import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Platform, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// Try to import BlurView, fallback if not available
let BlurView: any = null;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  // expo-blur not installed, will use fallback
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  delay?: number;
}

/**
 * Glassmorphism card component with premium glass effect
 * Used ONLY on secondary surfaces (mood check, banners, modals)
 * NOT for primary task lists or input-heavy screens
 * 
 * Glass rules:
 * - Light mode: rgba(255,255,255,0.65–0.75) with light blur
 * - Dark mode: rgba(44,44,46,0.7) with dark blur
 * - Border: Subtle, theme-aware
 * - Blur intensity: 20 (light) / 30 (dark)
 * - Text contrast: AA compliant
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity, // Optional override
  delay = 0,
}) => {
  const { theme, isDark } = useTheme();
  
  // Use theme-aware glass properties
  const glassIntensity = intensity ?? theme.glass.blurIntensity;
  const glassTint = theme.glass.tint;
  const glassOverlay = theme.glass.overlay;
  const glassBorder = theme.glass.border;
  const glassShadow = theme.shadows.card;
  
  // Enhanced dark mode: stronger blur, more opaque background
  const finalGlassIntensity = isDark ? Math.max(glassIntensity, 35) : glassIntensity;
  const finalGlassOverlay = isDark 
    ? 'rgba(20, 18, 30, 0.7)' // Frosted obsidian glass
    : glassOverlay;

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  const cardStyle = [
    styles.container,
    {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
      borderRadius: theme.radii.lg, // 22px - glass card radius
      borderColor: glassBorder,
      backgroundColor: finalGlassOverlay,
      ...glassShadow,
    },
    style,
  ];

  // iOS: Use BlurView if available
  if (Platform.OS === 'ios' && BlurView) {
    return (
      <Animated.View style={[cardStyle, { backgroundColor: 'transparent' }]}>
        <BlurView
          intensity={finalGlassIntensity}
          tint={glassTint}
          style={StyleSheet.absoluteFill}
        />
        <View 
          style={[
            styles.content, 
            { 
              backgroundColor: finalGlassOverlay,
              // Add subtle inner border for dark mode definition
              ...(isDark && {
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: theme.radii.lg,
              }),
            }
          ]}
        >
          {children}
        </View>
      </Animated.View>
    );
  }

  // Fallback: Use semi-transparent background with glass effect
  return (
    <Animated.View 
      style={[
        cardStyle,
        // Add subtle inner border for dark mode definition
        isDark && {
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.06)',
        },
      ]}
    >
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    padding: 16, // Using fixed value since theme.spacing.lg might not be available in styles
  },
});

