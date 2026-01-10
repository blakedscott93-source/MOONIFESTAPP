import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { lightHaptic } from '../utils/haptics';

interface JournalFABProps {
  onPress: () => void;
  opacity: Animated.AnimatedValue;
  translateY: Animated.AnimatedInterpolation<number>;
  visible: boolean;
  isScrolling?: boolean;
}

// Constants - Premium glass FAB matching footer design
const FAB_HEIGHT = 56; // Minimum 44px touch target + padding
const FAB_SPACING_ABOVE_TAB = 20; // Breathing room above footer (increased from 12)
const FULL_WIDTH = 120; // Expanded width with text
const COLLAPSED_WIDTH = FAB_HEIGHT; // Collapsed to circle
const GLASS_BLUR_INTENSITY = 30; // Slightly less than footer (45) for subtlety
const GLASS_BG_OPACITY_LIGHT = 0.75;
const GLASS_BG_OPACITY_DARK = 0.68;

export const JournalFAB: React.FC<JournalFABProps> = ({
  onPress,
  opacity,
  translateY,
  visible,
  isScrolling = false,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const tabBarInset = useTabBarInset();

  // Position FAB above footer using tabBarInset hook for accurate calculation
  // tabBarInset already includes: height + bottomOffset + safe area + breathing room
  // Add FAB spacing on top
  const bottomPosition = tabBarInset + FAB_SPACING_ABOVE_TAB;

  // Press feedback animations (native driver)
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressOpacity = useRef(new Animated.Value(1)).current;

  // Expand/collapse animation (0 = collapsed, 1 = expanded)
  const expandProgress = useRef(new Animated.Value(1)).current;

  // Text opacity and slide animations (native driver)
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current;

  // Handle expand/collapse with smooth spring animation
  useEffect(() => {
    const targetProgress = isScrolling ? 0 : 1;

    Animated.parallel([
      // Width animation (JS driver required)
      Animated.spring(expandProgress, {
        toValue: targetProgress,
        useNativeDriver: false,
        tension: 120,
        friction: 9,
        overshootClamping: false,
      }),
      // Text fade (JS driver)
      Animated.timing(textOpacity, {
        toValue: targetProgress,
        duration: isScrolling ? 120 : 200,
        delay: isScrolling ? 0 : 80,
        useNativeDriver: false,
      }),
      // Text slide (JS driver)
      Animated.spring(textTranslateX, {
        toValue: isScrolling ? -20 : 0,
        useNativeDriver: false,
        tension: 150,
        friction: 10,
        delay: isScrolling ? 0 : 50,
      }),
    ]).start();
  }, [isScrolling, expandProgress, textOpacity, textTranslateX]);

  // Press handlers with haptic feedback
  const handlePressIn = () => {
    lightHaptic();
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.96,
        useNativeDriver: false,
        tension: 400,
        friction: 25,
      }),
      Animated.timing(pressOpacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 400,
        friction: 25,
      }),
      Animated.timing(pressOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Interpolate width for smooth expansion
  const animatedWidth = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_WIDTH, FULL_WIDTH],
    extrapolate: 'clamp',
  });

  // Combined text opacity with smooth fade
  const combinedTextOpacity = Animated.multiply(
    expandProgress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    }),
    textOpacity
  );

  // Glass background color
  const glassBg = isDark
    ? `rgba(20, 20, 24, ${GLASS_BG_OPACITY_DARK})`
    : `rgba(255, 255, 255, ${GLASS_BG_OPACITY_LIGHT})`;
  const glassBorder = isDark
    ? 'rgba(255, 255, 255, 0.25)'
    : 'rgba(255, 255, 255, 0.55)';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomPosition,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel="Create new entry"
        accessibilityRole="button"
        accessibilityHint="Start writing a new journal entry"
      >
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: pressOpacity,
              transform: [{ scale: pressScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                width: animatedWidth,
              },
            ]}
          >
            {/* Glass effect - BlurView for iOS, fallback for Android/Web */}
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={GLASS_BLUR_INTENSITY}
                tint={isDark ? 'dark' : 'light'}
                style={styles.blurContainer}
              >
                <View style={[styles.glassOverlay, { backgroundColor: glassBg, borderColor: glassBorder }]}>
                  <View style={styles.contentContainer}>
                    {/* Icon - plus icon for create action */}
                    <View style={styles.iconContainer}>
                      <Ionicons name="add" size={24} color={tokens.colors.primary} />
                    </View>

                    {/* Text - fades and slides in/out smoothly */}
                    <Animated.View
                      style={[
                        styles.textContainer,
                        {
                          opacity: combinedTextOpacity,
                          transform: [{ translateX: textTranslateX }],
                        },
                      ]}
                      pointerEvents="none"
                    >
                      <Text style={[styles.text, { color: tokens.colors.primary }]} numberOfLines={1}>
                        Create
                      </Text>
                    </Animated.View>
                  </View>
                </View>
              </BlurView>
            ) : (
              // Fallback for Android/Web - simulated glass
              <View style={[styles.glassOverlay, { backgroundColor: glassBg, borderColor: glassBorder }]}>
                <View style={styles.contentContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="add" size={24} color={tokens.colors.primary} />
                  </View>
                  <Animated.View
                    style={[
                      styles.textContainer,
                      {
                        opacity: combinedTextOpacity,
                        transform: [{ translateX: textTranslateX }],
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Text style={[styles.text, { color: tokens.colors.primary }]} numberOfLines={1}>
                      Create
                    </Text>
                  </Animated.View>
                </View>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: tokens.spacing.lg,
    zIndex: 2000, // Above footer (footer is 1000)
    elevation: 2000, // Android elevation above footer
    height: FAB_HEIGHT,
  },
  buttonWrapper: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2,
    ...tokens.shadows.floating, // Premium shadow matching footer
  },
  buttonContainer: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2,
    overflow: 'hidden',
    minWidth: COLLAPSED_WIDTH,
  },
  blurContainer: {
    flex: 1,
    borderRadius: FAB_HEIGHT / 2,
    overflow: 'hidden',
  },
  glassOverlay: {
    flex: 1,
    borderRadius: FAB_HEIGHT / 2,
    borderWidth: 1,
    // Subtle inner highlight for glass effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      default: {},
    }),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: FAB_HEIGHT,
    paddingRight: tokens.spacing.md,
    paddingLeft: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    minWidth: 50,
  },
  text: {
    ...tokens.typography.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
