/**
 * Tasks FAB - Circular + button for quick task creation
 * Positioned to the right of FloatingTabBar (Cal.ai style)
 */

import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { lightHaptic } from '../../utils/haptics';

// Constants
const BUTTON_SIZE = 56; // Matches tab bar height proportions
const ICON_SIZE = 24;

interface TasksFABProps {
  onPress: () => void;
}

export const TasksFAB: React.FC<TasksFABProps> = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    lightHaptic();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const bottomOffset = Math.max(insets.bottom, 14);
  const bottomPosition = bottomOffset + 4; // Align with tab bar vertically

  // Glass colors
  const glassBg = isDark
    ? 'rgba(20, 20, 24, 0.68)'
    : 'rgba(255, 255, 255, 0.75)';
  const glassBorder = isDark
    ? 'rgba(255, 255, 255, 0.25)'
    : 'rgba(255, 255, 255, 0.55)';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomPosition,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel="Add Task"
        accessibilityRole="button"
        accessibilityHint="Open tasks screen to add new tasks"
      >
        {/* Glass effect */}
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={45}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blurContainer}
          >
            <View style={[styles.glassOverlay, { backgroundColor: glassBg, borderColor: glassBorder }]}>
              <Ionicons name="add" size={ICON_SIZE} color={tokens.colors.primary} />
            </View>
          </BlurView>
        ) : (
          <View style={[styles.glassOverlay, { backgroundColor: glassBg, borderColor: glassBorder }]}>
            <Ionicons name="add" size={ICON_SIZE} color={tokens.colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16, // Match PILL_HORIZONTAL_PADDING
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 1002, // Above tab bar (1000) and FABs (1001)
    elevation: 1002,
  },
  blurContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
  },
  glassOverlay: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.floating,
  },
});
