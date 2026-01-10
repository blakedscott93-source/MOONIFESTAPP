import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

// Chips removed as per user request
// Replaced with simplified view
export const JournalEmptyState: React.FC<JournalEmptyStateProps> = ({
  onStartWriting,
  onPromptSelect,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Theme.animation.slow,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="journal-outline" size={64} color={Theme.colors.accentSoft} />
      </View>
      <Text style={styles.title}>Your first entry starts here</Text>
      <Text style={styles.subtitle}>
        Choose a prompt to begin your gratitude journey.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.subtitle,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
});
