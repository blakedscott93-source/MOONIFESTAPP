import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, ViewStyle, Pressable } from 'react-native';
import { Theme } from '../utils/theme';
import { lightHaptic } from '../utils/haptics';

interface UnifiedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
  testID?: string;
  /** Enable subtle scale animation on press */
  pressable?: boolean;
  /** Card variant for different use cases */
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  /** Disable haptic feedback */
  noHaptic?: boolean;
}

/**
 * Unified Card component with enhanced microinteractions
 * One consistent card style used across all screens
 */
export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  onPress,
  style,
  delay = 0,
  testID,
  pressable = true,
  variant = 'default',
  noHaptic = false,
}) => {
  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Interaction animations
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Theme.animation.medium,
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
  }, [delay]);

  const handlePressIn = useCallback(() => {
    if (!pressable || !onPress) return;

    // Scale down slightly
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [pressable, onPress]);

  const handlePressOut = useCallback(() => {
    if (!pressable || !onPress) return;

    // Spring back
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [pressable, onPress]);

  const handlePress = useCallback(() => {
    if (!noHaptic && onPress) {
      lightHaptic();
    }
    onPress?.();
  }, [noHaptic, onPress]);

  // Get variant-specific styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.cardElevated;
      case 'outlined':
        return styles.cardOutlined;
      case 'gradient':
        return styles.cardGradient;
      default:
        return {};
    }
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim },
    ],
  };

  const content = (
    <Animated.View
      style={[
        styles.card,
        getVariantStyle(),
        style,
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={testID}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

/**
 * Compact card variant for smaller items
 */
interface CompactCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const CompactCard: React.FC<CompactCardProps> = ({
  children,
  onPress,
  style,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    lightHaptic();
    onPress?.();
  };

  const content = (
    <Animated.View 
      style={[
        styles.compactCard, 
        style, 
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={testID}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

/**
 * Icon button with consistent styling and haptic feedback
 */
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'secondary';
  style?: ViewStyle;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  style,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    lightHaptic();
    onPress();
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return styles.iconButtonSmall;
      case 'large': return styles.iconButtonLarge;
      default: return styles.iconButtonMedium;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return styles.iconButtonPrimary;
      case 'secondary': return styles.iconButtonSecondary;
      default: return styles.iconButtonDefault;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.iconButton,
          getSizeStyle(),
          getVariantStyle(),
          style,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {icon}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md, // 12px gap between cards (more compact)
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.medium,
  },
  cardElevated: {
    ...Theme.shadow.large,
    borderWidth: 0,
  },
  cardOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  cardGradient: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  compactCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.full,
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
  },
  iconButtonMedium: {
    width: 44,
    height: 44,
  },
  iconButtonLarge: {
    width: 56,
    height: 56,
  },
  iconButtonDefault: {
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  iconButtonPrimary: {
    backgroundColor: Theme.colors.accent,
  },
  iconButtonSecondary: {
    backgroundColor: Theme.colors.accentSoft,
  },
});



