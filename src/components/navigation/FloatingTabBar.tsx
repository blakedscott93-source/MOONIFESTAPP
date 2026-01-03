/**
 * Premium Floating Tab Bar Component
 * Cal AI-style: Compact glass pill with 5 tabs + separate + button
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  LayoutChangeEvent,
  AccessibilityInfo,
  Animated as RNAnimated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  createAnimatedComponent,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { lightHaptic } from '../../utils/haptics';
import { getColors } from '../../utils/themeColors';

const AnimatedView = createAnimatedComponent(View);
const AnimatedPath = createAnimatedComponent(Path);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout constants
const H_PADDING = 16; // Horizontal padding for outer container
const GAP = 12; // Gap between pill and + button
const TABS_LEFT_PADDING = 0; // No padding - tabs fill entire width evenly
const TABS_RIGHT_PADDING = 0; // No padding - tabs fill entire width evenly
const PLUS_SIZE = 56; // + button diameter
const PLUS_TOUCH_SIZE = 56; // Touch target matches size
const PILL_HEIGHT = 64;
const PILL_BOTTOM_OFFSET = 12;
const PILL_BORDER_RADIUS = 32;

const INDICATOR_HEIGHT = 36;
const INDICATOR_MARGIN = 8;

const TAB_ICON_SIZE = 21; // Optimal for 5 tabs with proper spacing
const ACTIVE_ICON_SIZE = 23; // Slightly larger when active
const MIN_TAP_TARGET = 44;

const BORDER_PADDING = 3.5; // Much thicker rainbow border for high visibility
const BEAM_DURATION = 3000; // 3s for smoother animation
const BEAM_SEGMENT_LENGTH = 0.20; // 20% of perimeter for visible beam

// Rainbow spectrum - clearly visible
const RAINBOW_SPECTRUM_LIGHT = [
  'rgba(255,107,107,0.40)', // Red
  'rgba(255,165,0,0.40)',   // Orange
  'rgba(255,215,0,0.40)',   // Yellow
  'rgba(78,203,113,0.40)',  // Green
  'rgba(74,144,226,0.40)',  // Blue
  'rgba(155,89,182,0.40)',  // Purple
  'rgba(255,107,107,0.40)', // Red (loop)
];

// Dark mode: More visible
const RAINBOW_SPECTRUM_DARK = [
  'rgba(255,107,107,0.50)', // Red
  'rgba(255,165,0,0.50)',   // Orange
  'rgba(255,215,0,0.50)',   // Yellow
  'rgba(78,203,113,0.50)',  // Green
  'rgba(74,144,226,0.50)',  // Blue
  'rgba(155,89,182,0.50)',  // Purple
  'rgba(255,107,107,0.50)', // Red (loop)
];

// Glass constants
const GLASS_BLUR = 35; // Reduced from 50 for cleaner look

type FloatingTabBarProps = BottomTabBarProps;

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useTheme();
  const colors = getColors(isDark);

  const [reducedMotion, setReducedMotion] = React.useState(false);
  const tabScaleRefs = useRef<Record<string, RNAnimated.Value>>({});

  // Plus button press animation
  const plusButtonScale = React.useRef(new RNAnimated.Value(1)).current;
  
  const handleTasksPress = () => {
    lightHaptic();
    RNAnimated.sequence([
      RNAnimated.spring(plusButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      RNAnimated.spring(plusButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    navigation.navigate('TasksScreen');
  };

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => subscription?.remove();
  }, []);

  // Measure pill width for active highlight calculation
  const [pillWidth, setPillWidth] = React.useState(0);
  const [pillHeight, setPillHeight] = React.useState(0);

  // Reanimated values for active pill animation
  const highlightX = useSharedValue(0);
  const beamRotation = useSharedValue(0);
  const beamOffset = useSharedValue(0); // For SVG perimeter animation

  // Calculate frame dimensions FIRST (before they're used)
  const frameOuterHeight = PILL_HEIGHT + (BORDER_PADDING * 2);
  const frameInnerHeight = PILL_HEIGHT;

  // Constants for highlight calculation - Cal AI style rounded-rect pill
  // Must fit within pill's inner boundaries (pill inner radius is 32px, height is 64px)
  // Premium styling: Proper spacing and rounded-rect indicator
  const HIGHLIGHT_HORIZONTAL_INSET = 6; // 6px padding each side for balanced fit
  const HIGHLIGHT_VERTICAL_INSET = 12; // 12px vertical padding
  const HIGHLIGHT_BORDER_RADIUS = 20; // 20px radius for active indicator

  // Measure inner pill width (content layer width) for active pill calculation
  const handleContentLayerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPillWidth(width);
    setPillHeight(height);
  };
  
  /**
   * Calculate active pill position using reanimated
   * 
   * MEASUREMENT:
   * - pillWidth: Measured via onLayout on contentLayer (the inner pill width)
   *   This is the actual width of the tab container inside the pill.
   * 
   * CALCULATION:
   * - TAB_COUNT = state.routes.length (should be 5)
   * - tabWidth = pillWidth / TAB_COUNT
   *   Each tab occupies an equal width.
   * 
   * - highlightWidth = tabWidth - (HIGHLIGHT_INSET * 2)
   *   Highlight is slightly smaller than tab width with 6px inset on each side.
   * 
   * - translateX = state.index * tabWidth + HIGHLIGHT_INSET
   *   Positions highlight at the start of the active tab slot plus inset.
   * 
   * ANIMATION:
   * - Reduced motion: Snap instantly (no animation)
   * - Normal: Smooth spring animation (damping: 18, stiffness: 280, mass: 0.5)
   *   Premium iOS feel - tweak for different feel:
   *   - Higher damping (22-25): Slower, more controlled
   *   - Lower damping (15-17): Faster, bouncier
   *   - Higher stiffness (300-350): Snappier
   *   - Lower stiffness (250-270): Softer
   */
  useEffect(() => {
    if (pillWidth > 0 && state.routes.length > 0) {
      const TAB_COUNT = state.routes.length;
      // Tabs fill entire width evenly (no padding)
      const tabWidth = pillWidth / TAB_COUNT;
      // Use same calculation as animated style (matching activePillStyle)
      // Reference: Highlight fits perfectly around tab content (snug fit)
      const highlightWidth = Math.max(50, tabWidth - (HIGHLIGHT_HORIZONTAL_INSET * 2));
      // Position highlight (no padding offset since tabs fill full width)
      const translateX = state.index * tabWidth + HIGHLIGHT_HORIZONTAL_INSET;
      
      if (reducedMotion) {
        // Snap without animation for reduced motion
        highlightX.value = translateX;
      } else {
        // Smooth spring animation (premium feel)
        highlightX.value = withSpring(translateX, {
          damping: 15,
          stiffness: 150,
          mass: 0.4,
        });
      }
    }
  }, [state.index, pillWidth, state.routes.length, reducedMotion]);

  // Perimeter beam animation (SVG-based)
  useEffect(() => {
    if (reducedMotion) {
      beamOffset.value = 0;
      return;
    }
    
    // Calculate perimeter length for rounded rectangle
    // Perimeter = 2 * (width + height) - 8 * radius + 2 * π * radius
    const outerWidth = pillWidth + (BORDER_PADDING * 2);
    const outerHeight = frameOuterHeight;
    const radius = PILL_BORDER_RADIUS + BORDER_PADDING;
    const perimeter = outerWidth > 0 && outerHeight > 0
      ? 2 * (outerWidth + outerHeight) - 8 * radius + 2 * Math.PI * radius
      : 1000; // Fallback
    
    beamOffset.value = withRepeat(
      withTiming(perimeter, {
        duration: BEAM_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [reducedMotion, pillWidth, frameOuterHeight]);

  // Animated props for SVG perimeter beam
  const animatedBeamPathStyle = useAnimatedProps(() => {
    const outerWidth = pillWidth + (BORDER_PADDING * 2);
    const outerHeight = frameOuterHeight;
    const radius = PILL_BORDER_RADIUS + BORDER_PADDING;
    const perimeter = outerWidth > 0 && outerHeight > 0
      ? 2 * (outerWidth + outerHeight) - 8 * radius + 2 * Math.PI * radius
      : 1000;
    
    const dashArray = perimeter * BEAM_SEGMENT_LENGTH;
    const dashGap = perimeter * (1 - BEAM_SEGMENT_LENGTH);
    
    return {
      strokeDasharray: `${dashArray} ${dashGap}`,
      strokeDashoffset: beamOffset.value,
    };
  });

  // Animated style for active pill (Cal AI style rounded-rect sliding highlight)
  const activePillStyle = useAnimatedStyle(() => {
    if (pillWidth > 0 && state.routes.length > 0) {
      const TAB_COUNT = state.routes.length;
      // Tabs fill entire width evenly (no padding, matching useEffect)
      const tabWidth = pillWidth / TAB_COUNT;
      // Ensure highlight fits within pill boundaries with proper padding
      // Use Math.max to prevent negative width on very small screens
      // Reference: Highlight fits perfectly around tab content (snug fit)
      const highlightWidth = Math.max(50, tabWidth - (HIGHLIGHT_HORIZONTAL_INSET * 2));
      
      return {
        width: highlightWidth,
        // Height is controlled by top/bottom insets in the component style
        // Don't set height here - let top/bottom constraints handle it
        // highlightX.value already accounts for TABS_LEFT_PADDING in useEffect
        transform: [{ translateX: highlightX.value }],
      };
    }
    return {
      width: 0,
      transform: [{ translateX: 0 }],
    };
  });

  // Use theme-aware glass colors
  const glassBg = theme.glass.overlay;
  const glassBorder = theme.glass.border;
  const indicatorBg = isDark 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)';
  const borderMaskBg = colors.bg; // Use theme background color
  
  // Rainbow spectrum - more saturated in dark mode
  const rainbowSpectrum = isDark ? RAINBOW_SPECTRUM_DARK : RAINBOW_SPECTRUM_LIGHT;
  const beamStops = isDark
    ? [
        <Stop key="dark-0" offset="0%" stopColor="rgba(255, 255, 255, 0)" />,
        <Stop key="dark-20" offset="20%" stopColor="rgba(255, 255, 255, 0.40)" />,
        <Stop key="dark-50" offset="50%" stopColor="rgba(255, 255, 255, 0.60)" />,
        <Stop key="dark-80" offset="80%" stopColor="rgba(255, 255, 255, 0.40)" />,
        <Stop key="dark-100" offset="100%" stopColor="rgba(255, 255, 255, 0)" />,
      ]
    : [
        <Stop key="light-0" offset="0%" stopColor="rgba(124, 58, 237, 0)" />,
        <Stop key="light-20" offset="20%" stopColor="rgba(124, 58, 237, 0.30)" />,
        <Stop key="light-50" offset="50%" stopColor="rgba(124, 58, 237, 0.45)" />,
        <Stop key="light-80" offset="80%" stopColor="rgba(124, 58, 237, 0.30)" />,
        <Stop key="light-100" offset="100%" stopColor="rgba(124, 58, 237, 0)" />,
      ];
  
  // Outer glow colors for dark mode (very subtle rainbow echo)
  const outerGlowColors = isDark
    ? [
        'rgba(255, 100, 100, 0.06)',  // Very subtle red glow
        'rgba(255, 140, 100, 0.08)',  // Very subtle orange glow
        'rgba(255, 210, 100, 0.09)',  // Very subtle yellow glow
        'rgba(140, 255, 140, 0.08)',  // Very subtle green glow
        'rgba(100, 255, 255, 0.09)',  // Very subtle cyan glow
        'rgba(100, 140, 255, 0.08)',  // Very subtle blue glow
        'rgba(140, 100, 255, 0.06)',  // Very subtle purple glow
        'rgba(255, 100, 190, 0.08)',  // Very subtle pink glow
        'rgba(255, 100, 100, 0.06)',  // Loop back
      ]
    : [];

  return (
    <View
      style={[
        styles.outerContainer,
        {
          bottom: PILL_BOTTOM_OFFSET + insets.bottom,
          paddingHorizontal: H_PADDING,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Horizontal row: Left pill + Right + button */}
      <View style={styles.rowContainer}>
        {/* LEFT: Pill wrapper with flex:1 and maxWidth constraint */}
        <View style={styles.pillWrapper}>
          {/* Pill container - relative positioning for absolute children */}
          <View
            style={[
              styles.pillContainer,
              {
                height: frameOuterHeight,
                borderRadius: PILL_BORDER_RADIUS + BORDER_PADDING,
              },
            ]}
            pointerEvents="box-none"
          >
            {/* Border Ring Layer - Absolute, overflow hidden for masking only */}
            <View
              style={[
                styles.borderContainer,
                {
                  borderRadius: PILL_BORDER_RADIUS + BORDER_PADDING,
                },
              ]}
              pointerEvents="none"
            >
              {/* Outer glow layer (dark mode only) */}
              {isDark && (
                <View
                  style={[
                    styles.outerGlowLayer,
                    {
                      borderRadius: PILL_BORDER_RADIUS + BORDER_PADDING + 4,
                    },
                  ]}
                  pointerEvents="none"
                >
                  <LinearGradient
                    colors={outerGlowColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      StyleSheet.absoluteFill,
                      { borderRadius: PILL_BORDER_RADIUS + BORDER_PADDING + 4 },
                    ]}
                  />
                </View>
              )}
              
              {/* Base rainbow border + animated beam - using SVG for proper rounded rectangle perimeter */}
              {pillWidth > 0 && (() => {
                const outerWidth = pillWidth + (BORDER_PADDING * 2);
                const radius = PILL_BORDER_RADIUS + BORDER_PADDING;
                return (
                <Svg
                  width="100%"
                  height="100%"
                  style={StyleSheet.absoluteFill}
                  viewBox={`0 0 ${outerWidth} ${frameOuterHeight}`}
                  preserveAspectRatio="none"
                >
                  <Defs>
                    {/* Base rainbow gradient */}
                    <SvgLinearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      {rainbowSpectrum.map((color, index) => (
                        <Stop
                          key={index}
                          offset={`${(index / (rainbowSpectrum.length - 1)) * 100}%`}
                          stopColor={color}
                        />
                      ))}
                    </SvgLinearGradient>
                    
                    {/* Beam highlight gradient - visible animation */}
                    <SvgLinearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      {beamStops}
                    </SvgLinearGradient>
                  </Defs>
                  
                  {/* Base rainbow border path - full rounded rectangle */}
                  <Path
                    d={`
                      M ${radius},0
                      L ${outerWidth - radius},0
                      Q ${outerWidth},0 ${outerWidth},${radius}
                      L ${outerWidth},${frameOuterHeight - radius}
                      Q ${outerWidth},${frameOuterHeight} ${outerWidth - radius},${frameOuterHeight}
                      L ${radius},${frameOuterHeight}
                      Q 0,${frameOuterHeight} 0,${frameOuterHeight - radius}
                      L 0,${radius}
                      Q 0,0 ${radius},0
                      Z
                    `}
                    fill="none"
                    stroke="url(#rainbowGradient)"
                    strokeWidth={BORDER_PADDING * 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Animated beam path - travels around full perimeter including all curves */}
                  {!reducedMotion && (
                    <AnimatedPath
                      d={`
                        M ${radius},0
                        L ${outerWidth - radius},0
                        Q ${outerWidth},0 ${outerWidth},${radius}
                        L ${outerWidth},${frameOuterHeight - radius}
                        Q ${outerWidth},${frameOuterHeight} ${outerWidth - radius},${frameOuterHeight}
                        L ${radius},${frameOuterHeight}
                        Q 0,${frameOuterHeight} 0,${frameOuterHeight - radius}
                        L 0,${radius}
                        Q 0,0 ${radius},0
                        Z
                      `}
                      fill="none"
                      stroke="url(#beamGradient)"
                      strokeWidth={BORDER_PADDING * 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animatedProps={animatedBeamPathStyle}
                    />
                  )}
                </Svg>
                );
              })()}
              
              {/* Border mask - Only covers INSIDE to reveal border on all sides */}
              <View
                style={[
                  styles.borderMask,
                  {
                    borderRadius: PILL_BORDER_RADIUS,
                    backgroundColor: borderMaskBg,
                    // Position to reveal border on ALL sides
                    // Border stroke width is BORDER_PADDING * 2, so mask should be inset by that amount
                    top: (BORDER_PADDING * 2) + 0.5, // Small extra to ensure clean edge
                    left: (BORDER_PADDING * 2) + 0.5,
                    right: (BORDER_PADDING * 2) + 0.5,
                    bottom: (BORDER_PADDING * 2) + 0.5,
                  },
                ]}
                pointerEvents="none"
              />
            </View>

            {/* Glass Background Layer - Absolute, behind content - Enhanced for dark mode */}
            <View
              style={[
                styles.glassBody,
                {
                  height: frameInnerHeight,
                  borderRadius: PILL_BORDER_RADIUS,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : glassBorder, // Stronger border in dark mode
                  // Premium shadow
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 40,
                    },
                    android: {
                      elevation: 12,
                    },
                    default: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 40,
                      elevation: 12,
                    },
                  }),
                },
              ]}
              pointerEvents="none"
            >
              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={isDark ? 60 : 50} // Balanced blur intensity
                  tint={theme.glass.tint}
                  style={StyleSheet.absoluteFill}
                >
                  <View
                    style={[
                      styles.glassOverlay,
                      {
                        backgroundColor: isDark
                          ? 'rgba(10, 10, 14, 0.65)' // Clean dark background
                          : 'rgba(255, 255, 255, 0.70)', // Clean light background
                        borderRadius: PILL_BORDER_RADIUS,
                      }
                    ]}
                  />
                </BlurView>
              ) : (
                <View
                  style={[
                    styles.glassOverlay,
                    {
                      backgroundColor: isDark
                        ? 'rgba(10, 10, 14, 0.85)' // Opaque dark mode for Android/Web
                        : 'rgba(255, 255, 255, 0.85)', // Opaque light mode for Android/Web
                      borderRadius: PILL_BORDER_RADIUS,
                      borderWidth: 0.5,
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  ]}
                />
              )}
            </View>

            {/* CONTENT LAYER - Tabs container - Clipped to inner pill for active highlight */}
            <View
              style={[
                styles.contentLayer,
                {
                  height: frameInnerHeight,
                  borderRadius: PILL_BORDER_RADIUS,
                  overflow: 'hidden', // CRITICAL: Clip active pill to inner pill bounds
                },
              ]}
              pointerEvents="box-none"
            >
              {/* Measure content layer width for active pill calculation */}
              <View
                onLayout={handleContentLayerLayout}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />

              {/* NO GLASS HIGHLIGHT - Clean iOS style with color changes only */}

              {/* Tabs - All 5 tabs with flex:1 for equal distribution */}
              <View style={styles.tabsRow}>
                {state.routes.map((route, index) => {
                  const { options } = descriptors[route.key];
                  const isFocused = state.index === index;

                  const onPress = () => {
                    lightHaptic();
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  };

                  // Animation for tab press - use a ref to persist across renders
                  const scaleAnim = tabScaleRefs.current[route.key]
                    || (tabScaleRefs.current[route.key] = new RNAnimated.Value(1));
                  
                  const handlePressIn = () => {
                    RNAnimated.spring(scaleAnim, {
                      toValue: 0.95,
                      useNativeDriver: true,
                    }).start();
                  };
                  const handlePressOut = () => {
                    RNAnimated.spring(scaleAnim, {
                      toValue: 1,
                      useNativeDriver: true,
                    }).start();
                  };

                  const onLongPress = () => {
                    navigation.emit({
                      type: 'tabLongPress',
                      target: route.key,
                    });
                  };

                  const is45Tab = route.name === '45 NOW';
                  const goldColor = isDark ? '#E8C547' : '#D4AF37';

                  // PRODUCTION-READY contrast - Visible in both light and dark modes
                  const iconColor = isFocused
                    ? (is45Tab ? goldColor : (isDark ? '#FFFFFF' : '#000000')) // Active: white in dark, black in light
                    : (is45Tab
                        ? (isDark ? 'rgba(232, 197, 71, 0.60)' : 'rgba(212, 175, 55, 0.65)')
                        : (isDark ? 'rgba(255, 255, 255, 0.60)' : 'rgba(0, 0, 0, 0.60)')); // Inactive: 60% opacity both modes
                  const iconSize = isFocused ? ACTIVE_ICON_SIZE : TAB_ICON_SIZE;
                  const labelColor = isFocused
                    ? (is45Tab ? goldColor : (isDark ? '#FFFFFF' : '#000000')) // Active: white in dark, black in light
                    : (is45Tab
                        ? (isDark ? 'rgba(232, 197, 71, 0.60)' : 'rgba(212, 175, 55, 0.65)')
                        : (isDark ? 'rgba(255, 255, 255, 0.60)' : 'rgba(0, 0, 0, 0.60)')); // Inactive: 60% opacity both modes
                  
                  const iconElement = options.tabBarIcon
                    ? options.tabBarIcon({
                        focused: isFocused,
                        color: iconColor,
                        size: iconSize,
                      })
                    : null;

                  const label =
                    typeof options.tabBarLabel === 'string'
                      ? options.tabBarLabel
                      : (options.title ?? route.name);

                  return (
                    <RNAnimated.View
                      style={[
                        { transform: [{ scale: scaleAnim }] },
                      ]}
                    >
                      <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel || label}
                        testID={(options as any).tabBarTestID}
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onLongPress={onLongPress}
                        style={styles.tabItem}
                        activeOpacity={1}
                      >
                      <View style={styles.tabContent}>
                        <View style={styles.iconContainer}>
                          {iconElement}
                        </View>
                        <Text
                          style={[
                            styles.label,
                            { color: labelColor },
                            isFocused && styles.labelActive,
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                        >
                          {label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    </RNAnimated.View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* RIGHT: + Button wrapper - Fixed size, no flex */}
        <View style={styles.plusButtonWrapper}>
          {/* Outer glow halo (dark mode only) - reduced size */}
          {isDark && (
            <View
              style={[
                styles.plusButtonGlow,
                {
                  width: PLUS_SIZE + 6,
                  height: PLUS_SIZE + 6,
                  borderRadius: (PLUS_SIZE + 6) / 2,
                },
              ]}
              pointerEvents="none"
            />
          )}
          <RNAnimated.View
            style={[
              {
                transform: [{ scale: plusButtonScale }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleTasksPress}
              style={[
                styles.plusButton,
                {
                  width: PLUS_SIZE,
                  height: PLUS_SIZE,
                },
              ]}
              activeOpacity={1}
              accessibilityLabel="Add Task"
              accessibilityRole="button"
            >
            <View
              style={[
                styles.plusButtonCircle,
                {
                  width: PLUS_SIZE,
                  height: PLUS_SIZE,
                  borderRadius: PLUS_SIZE / 2,
                  backgroundColor: '#0A0A0A', // Solid black
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.4,
                      shadowRadius: 24,
                    },
                    android: {
                      elevation: 8,
                    },
                    default: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.4,
                      shadowRadius: 24,
                      elevation: 8,
                    },
                  }),
                },
              ]}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            </TouchableOpacity>
          </RNAnimated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'visible',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: GAP,
  },

  // LEFT: Pill wrapper - Uses flexbox to grow, with sensible maxWidth
  pillWrapper: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // CRITICAL: Allows flex to shrink below content size
    maxWidth: SCREEN_WIDTH * 0.88, // Optional maxWidth to prevent pill from being too wide
    overflow: 'visible', // CRITICAL: Never clip tabs
  },

  // Pill container - Relative positioning for absolute children
  pillContainer: {
    position: 'relative',
    width: '100%', // Takes full width of pillWrapper
    overflow: 'visible', // CRITICAL: Content layer must not be clipped
  },

  // Border/Ring Layer - Absolute, clips for masking only
  borderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden', // Only this layer clips (for border masking)
    zIndex: 0,
  },
  outerGlowLayer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: -1, // Behind border
    opacity: 0.3, // Very subtle glow
  },
  borderBaseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  borderBeamLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  borderGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  borderMask: {
    position: 'absolute',
    zIndex: 100,
  },

  // Glass Background Layer - Absolute, behind content
  glassBody: {
    position: 'absolute',
    top: BORDER_PADDING,
    left: BORDER_PADDING,
    right: BORDER_PADDING,
    bottom: BORDER_PADDING,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // CONTENT LAYER - Clipped to inner pill for active highlight
  contentLayer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden', // CRITICAL: Clip active pill to inner pill bounds
    zIndex: 2,
  },

  // Cal AI-style Active Pill (sliding glass highlight capsule)
  activePill: {
    position: 'absolute',
    left: 0,
    zIndex: 0, // Behind tab content (icons/labels render above)
    overflow: 'hidden', // Ensure rounded corners clip content
    // No shadow to prevent visual overflow
  },
  activePillOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  activePillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    pointerEvents: 'none',
  },

  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Evenly distribute tabs across width
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TAP_TARGET,
    paddingVertical: 6,
    paddingHorizontal: 8, // Add padding for better spacing
    minWidth: 0, // CRITICAL: Allow flex to shrink
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3, // Tight spacing for compact layout
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26, // Slightly larger container for premium feel
    height: 26, // Matches icon size with breathing room
  },
  label: {
    fontSize: 10, // Apple standard: 10pt minimum (premium readability)
    fontWeight: '600', // Slightly heavier for better hierarchy (premium)
    textAlign: 'center',
    lineHeight: 12, // Balanced line height
    letterSpacing: 0.1, // Subtle letter spacing for premium feel
  },
  labelActive: {
    fontWeight: '700', // Stronger weight for active tab (premium)
    letterSpacing: 0.2, // Slightly more spacing for premium feel
  },

  // RIGHT: Plus button wrapper - Fixed size (maintains touch target)
  plusButtonWrapper: {
    width: PLUS_TOUCH_SIZE,
    height: PLUS_TOUCH_SIZE,
    flexShrink: 0, // Never shrink
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(196, 181, 253, 0.15)', // Very subtle lavender glow
    zIndex: 999,
  },
  plusButton: {
    borderRadius: PLUS_TOUCH_SIZE / 2,
    overflow: 'visible', // Allow glow to show
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001, // Above pill
    // Shadow will be set dynamically based on isDark
  },
  plusButtonCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
