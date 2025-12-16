import React, { useRef } from 'react';
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
}) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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

  // Calculate bottom position: tab bar height + safe area bottom + spacing
  // Positioned lower to overlap tab bar slightly (moved down 50% more)
  const bottomPosition = BOTTOM_TAB_HEIGHT + insets.bottom + FAB_SPACING_ABOVE_TAB - (FAB_HEIGHT / 2);

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
          <LinearGradient
            colors={['#FF6B9D', '#E85A8A', '#C44569']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="create" size={20} color="#FFF" />
            <Text style={styles.text}>Write</Text>
          </LinearGradient>
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
    overflow: 'visible', // Don't clip shadow
    ...Theme.shadow.fab,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: FAB_HEIGHT,
    paddingVertical: 0, // Height is fixed, no vertical padding needed
    paddingHorizontal: Theme.spacing.xl, // 24px horizontal padding
    gap: Theme.spacing.sm, // 8px gap between icon and text
    borderRadius: FAB_HEIGHT / 2, // Match parent borderRadius
  },
  text: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    letterSpacing: 0.3,
    fontSize: 15,
    fontWeight: '700',
  },
});
