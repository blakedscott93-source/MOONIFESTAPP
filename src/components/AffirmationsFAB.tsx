import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../utils/theme';
import { useTabBarInset } from '../hooks/useTabBarInset';

// Target spacing above tab bar
const FAB_SPACING_ABOVE_TAB = 20;
// Fixed FAB height for perfect pill shape
const FAB_HEIGHT = 56;

interface AffirmationsFABProps {
  onPress: () => void;
}

export const AffirmationsFAB: React.FC<AffirmationsFABProps> = ({ onPress }) => {
  const tabBarInset = useTabBarInset();
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

  const bottomPosition = tabBarInset + FAB_SPACING_ABOVE_TAB;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomPosition,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityLabel="New Affirmation"
        accessibilityRole="button"
        accessibilityHint="Create a new affirmation"
      >
        <Animated.View style={{ opacity: opacityAnim }}>
          <LinearGradient
            colors={['#C77DFF', '#8B7DD8']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color={Theme.colors.textInverse} />
            <Text style={styles.text}>New</Text>
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
    zIndex: 1001, // Above FloatingTabBar (1000)
    elevation: 1001, // Android elevation
  },
  button: {
    height: FAB_HEIGHT,
    borderRadius: FAB_HEIGHT / 2,
    minWidth: FAB_HEIGHT,
    overflow: 'visible',
    ...Theme.shadow.fab,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: FAB_HEIGHT,
    paddingVertical: 0,
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
    borderRadius: FAB_HEIGHT / 2,
  },
  text: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    letterSpacing: 0.3,
    fontSize: 15,
    fontWeight: '700',
  },
});









