import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface PromptChip {
  label: string;
  icon: string;
  promptType: string;
}

const QUICK_PROMPTS: PromptChip[] = [
  { label: 'Gratitude', icon: 'heart', promptType: 'gratitude' },
  { label: 'Wins', icon: 'trophy', promptType: 'wins' },
  { label: 'Reflection', icon: 'bulb', promptType: 'reflection' },
];

interface JournalEmptyStateProps {
  onStartWriting: () => void;
  onPromptSelect?: (promptType: string) => void;
}

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

  const handlePromptPress = (promptType: string) => {
    if (onPromptSelect) {
      onPromptSelect(promptType);
    } else {
      onStartWriting();
    }
  };

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

      {/* Quick Prompt Chips */}
      <View style={styles.chipsContainer}>
        {QUICK_PROMPTS.map((prompt, index) => (
          <TouchableOpacity
            key={prompt.promptType}
            style={styles.chip}
            onPress={() => handlePromptPress(prompt.promptType)}
            activeOpacity={0.7}
            accessibilityLabel={`Start ${prompt.label} entry`}
            accessibilityRole="button"
          >
            <Ionicons
              name={prompt.icon as any}
              size={18}
              color={Theme.colors.accent}
            />
            <Text style={styles.chipText}>{prompt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.accentSoft,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    gap: Theme.spacing.sm,
    minHeight: TOUCH_TARGET_MIN,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  chipText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
  },
});
