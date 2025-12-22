import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../utils/theme';
import { lightHaptic } from '../utils/haptics';

interface JournalFABProps {
  onPress: () => void;
  opacity: Animated.AnimatedValue;
  translateY: Animated.AnimatedInterpolation<number>;
  visible: boolean;
  isScrolling?: boolean;
}

// Constants
const BOTTOM_TAB_HEIGHT = 85;
const FAB_SPACING_ABOVE_TAB = 0;
const FAB_HEIGHT = 56;
const FULL_WIDTH = 120;
const COLLAPSED_WIDTH = FAB_HEIGHT;

export const JournalFAB: React.FC<JournalFABProps> = ({
  onPress,
  opacity,
  translateY,
  visible,
  isScrolling = false,
}) => {
  const insets = useSafeAreaInsets();
  
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
      // Text fade (native driver)
      Animated.timing(textOpacity, {
        toValue: targetProgress,
        duration: isScrolling ? 120 : 200,
        delay: isScrolling ? 0 : 80,
        useNativeDriver: true,
      }),
      // Text slide (native driver) - slides in from left
      Animated.spring(textTranslateX, {
        toValue: isScrolling ? -20 : 0,
        useNativeDriver: true,
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
        useNativeDriver: true,
        tension: 400,
        friction: 25,
      }),
      Animated.timing(pressOpacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 25,
      }),
      Animated.timing(pressOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Calculate bottom position
  const bottomPosition = BOTTOM_TAB_HEIGHT + insets.bottom + FAB_SPACING_ABOVE_TAB - (FAB_HEIGHT / 2);

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
        accessibilityLabel="Write entry"
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
            <LinearGradient
              colors={['#FF6B9D', '#E85A8A', '#C44569']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.contentContainer}>
                {/* Icon - always visible, right-aligned */}
                <View style={styles.iconContainer}>
                  <Ionicons name="create" size={20} color="#FFF" />
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
                  <Text style={styles.text} numberOfLines={1}>
                    Write
                  </Text>
                </Animated.View>
              </View>
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
    zIndex: 1000,
    height: FAB_HEIGHT,
  },
  buttonWrapper: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2,
    ...Theme.shadow.fab,
  },
  buttonContainer: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2,
    overflow: 'hidden',
    minWidth: COLLAPSED_WIDTH,
  },
  gradient: {
    flex: 1,
    borderRadius: FAB_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: FAB_HEIGHT,
    paddingRight: Theme.spacing.md,
    paddingLeft: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  iconContainer: {
    width: 20,
    height: 20,
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
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
