/**
 * Primary Button Component
 * Consistent CTA button with Apple-clean styling
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../theme/tokens';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
  size?: 'medium' | 'large';
}

const TOUCH_TARGET_MIN = 44;

/**
 * Primary button component
 * Guarantees minimum touch size, uses tokens, consistent styling
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
  size = 'large',
}) => {
  const height = size === 'large' ? 52 : 44;
  const paddingHorizontal = size === 'large' ? tokens.spacing.xxl : tokens.spacing.xl;

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.secondaryButton,
          {
            height: Math.max(height, TOUCH_TARGET_MIN),
            paddingHorizontal,
            borderRadius: tokens.radii.md,
            borderColor: tokens.colors.border,
            opacity: disabled || loading ? 0.5 : 1,
          },
          style,
        ]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={tokens.colors.accent} />
        ) : (
          <Text style={[styles.secondaryButtonText, { color: tokens.colors.accent }]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          height: Math.max(height, TOUCH_TARGET_MIN),
          paddingHorizontal,
          borderRadius: tokens.radii.md,
          opacity: disabled || loading ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[tokens.colors.accent, tokens.colors.accentDark]}
        style={[
          styles.gradient,
          {
            borderRadius: tokens.radii.md,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    ...tokens.shadows.card,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...tokens.typography.bodyBold,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: tokens.colors.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.subtle,
  },
  secondaryButtonText: {
    ...tokens.typography.bodyBold,
    fontWeight: '600',
  },
});











