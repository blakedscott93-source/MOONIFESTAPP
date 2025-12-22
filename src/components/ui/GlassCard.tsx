import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Platform, Animated } from 'react-native';
import { tokens } from '../../theme/tokens';

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
 * Glassmorphism card component with cross-platform support
 * Uses BlurView on iOS, fallback on Android/web
 * Matches UnifiedCard structure for easy replacement
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = tokens.glass.blurIntensity,
  delay = 0,
}) => {
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
      borderRadius: tokens.radii.xl,
      borderColor: tokens.colors.border,
      ...tokens.shadows.card,
    },
    style,
  ];

  // iOS: Use BlurView if available
  if (Platform.OS === 'ios' && BlurView) {
    return (
      <Animated.View style={cardStyle}>
        <BlurView
          intensity={intensity}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        {children}
      </Animated.View>
    );
  }

  // Fallback: Use semi-transparent background
  return (
    <Animated.View
      style={[
        cardStyle,
        { backgroundColor: tokens.glass.overlay },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    padding: tokens.spacing.md,
  },
});

