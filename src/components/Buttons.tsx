import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

/**
 * Primary Button - Main CTA
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  icon,
  disabled,
  fullWidth,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, fullWidth && styles.fullWidth, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <LinearGradient
        colors={['#FF6B9D', '#E85A8A', '#C44569']}
        style={styles.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && <Ionicons name={icon} size={20} color="#FFF" style={styles.icon} />}
        <Text style={styles.primaryText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

/**
 * Secondary Button - Outline style
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  icon,
  disabled,
  fullWidth,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.secondaryButton,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={disabled ? 'Button is disabled' : undefined}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={Theme.colors.accent}
          style={styles.icon}
        />
      )}
      <Text style={styles.secondaryText}>{title}</Text>
    </TouchableOpacity>
  );
};

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
}

/**
 * Chip component - Small pill-shaped button
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  selected,
  icon,
  testID,
}) => {
  const content = (
    <View style={[styles.chip, selected && styles.chipSelected]}>
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? Theme.colors.textInverse : Theme.colors.accent}
          style={styles.chipIcon}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
        accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={undefined}
    >
      {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    minHeight: TOUCH_TARGET_MIN,
    ...Theme.shadow.medium,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  primaryText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderMedium,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    minHeight: TOUCH_TARGET_MIN,
    gap: Theme.spacing.sm,
    ...Theme.shadow.subtle,
  },
  secondaryText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.full,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.xs,
    minHeight: 32,
    ...Theme.shadow.subtle,
  },
  chipSelected: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  chipText: {
    ...Theme.typography.chip,
    color: Theme.colors.accent,
  },
  chipTextSelected: {
    color: Theme.colors.textInverse,
  },
  chipIcon: {
    marginRight: -Theme.spacing.xs,
  },
  icon: {
    marginRight: -Theme.spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});








