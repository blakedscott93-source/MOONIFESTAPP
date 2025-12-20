import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface JournalFABProps {
  onPress: () => void;
  opacity: Animated.AnimatedValue;
  translateY: Animated.AnimatedInterpolation<number>;
  visible: boolean;
  isScrolling?: boolean;
}

// Bottom tab bar height from AppNavigator
const BOTTOM_TAB_HEIGHT = 85;
// Target spacing above tab bar (flush with footer - minimal gap)
const FAB_SPACING_ABOVE_TAB = 0;
// Fixed FAB height for perfect pill shape
const FAB_HEIGHT = 56;

export const JournalFAB: React.FC<JournalFABProps> = ({
  onPress,
  opacity,
  translateY,
  visible,
  isScrolling = false,
}) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const buttonWidth = useRef(new Animated.Value(1)).current;
  const textWidth = useRef(new Animated.Value(50)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    // Haptic feedback if available (would require expo-haptics package)
    // For now, just call onPress
    onPress();
  };

  // Animate text and button width based on scroll state
  useEffect(() => {
    // Stop any running animations first
    textOpacity.stopAnimation();
    buttonWidth.stopAnimation();
    textWidth.stopAnimation();
    
    if (isScrolling) {
      // Hide text and shrink to icon-only when scrolling
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(buttonWidth, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(textWidth, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Show text and expand when scrolling stops
      Animated.parallel([
        Animated.spring(buttonWidth, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: false,
        }),
        Animated.timing(textWidth, {
          toValue: 50,
          duration: 200,
          delay: 80,
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          delay: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScrolling]);

  // Calculate bottom position: tab bar height + safe area bottom + spacing
  // Positioned lower to overlap tab bar slightly (moved down 50% more)
  const bottomPosition = BOTTOM_TAB_HEIGHT + insets.bottom + FAB_SPACING_ABOVE_TAB - (FAB_HEIGHT / 2);

  // Calculate animated width - ensure minimum is FAB_HEIGHT to prevent cropping
  const animatedWidth = buttonWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [FAB_HEIGHT, 120], // Icon-only width to full width
  });
  
  // Animated gap between icon and text
  const animatedGap = buttonWidth.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, Theme.spacing.sm], // No gap when collapsed, gap when expanded
  });
  
  // Animated padding - 0 when collapsed (icon-only), full padding when expanded
  const animatedPadding = buttonWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Theme.spacing.xl],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomPosition,
          opacity,
          transform: [{ translateY }, { scale: scaleAnim }],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityLabel="Write entry"
        accessibilityRole="button"
        accessibilityHint="Start writing a new journal entry"
      >
        <Animated.View style={{ opacity: opacityAnim }}>
          <Animated.View
            style={[
              styles.gradient,
              {
                width: animatedWidth,
                minWidth: FAB_HEIGHT, // Prevent shrinking below icon size
              },
            ]}
          >
            <LinearGradient
              colors={['#FF6B9D', '#E85A8A', '#C44569']}
              style={styles.gradientInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.innerContent,
                  {
                    paddingHorizontal: animatedPadding,
                  }
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="create" size={20} color="#FFF" />
                </View>
                <Animated.View
                  style={[
                    styles.textContainer,
                    {
                      opacity: textOpacity,
                      marginLeft: animatedGap,
                      width: textWidth,
                    }
                  ]}
                >
                  <Text style={styles.text} numberOfLines={1}>Write</Text>
                </Animated.View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Theme.spacing.lg,
    zIndex: 1000, // Ensure it's above everything
    // No overflow clipping - ensure parent doesn't clip
  },
  button: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2, // Perfect pill shape (height/2)
    minWidth: FAB_HEIGHT, // Minimum width equals height for pill
    overflow: 'hidden', // Clip content to prevent icon cropping
    ...Theme.shadow.fab,
  },
  gradient: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2, // Match parent borderRadius
    overflow: 'hidden',
  },
  gradientInner: {
    height: FAB_HEIGHT,
    paddingVertical: 0,
    borderRadius: FAB_HEIGHT / 2,
    width: '100%',
    overflow: 'hidden',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: FAB_HEIGHT,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  text: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    letterSpacing: 0.3,
    fontSize: 15,
    fontWeight: '700',
  },
});
