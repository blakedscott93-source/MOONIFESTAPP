/**
 * Icon Button Component
 * Consistent icon hit areas with Apple-clean styling
 * Guarantees minimum touch size (44x44pt)
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, AccessibilityRole } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  variant?: 'default' | 'glass' | 'minimal';
}

const TOUCH_TARGET_MIN = 44;

/**
 * Icon button component
 * Uses tokens, enforces minimum touch size, consistent styling
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  iconSize = 22,
  iconColor,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
  variant = 'default',
}) => {
  const buttonSize = Math.max(size, TOUCH_TARGET_MIN);
  
  const getBackgroundColor = () => {
    if (variant === 'glass') {
      return `rgba(255, 255, 255, ${tokens.glass.bgAlpha})`;
    }
    if (variant === 'minimal') {
      return 'transparent';
    }
    return tokens.colors.card;
  };

  const getBorderColor = () => {
    if (variant === 'glass') {
      return `rgba(255, 255, 255, ${tokens.glass.borderAlpha})`;
    }
    if (variant === 'minimal') {
      return 'transparent';
    }
    return tokens.colors.border;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'minimal' ? 0 : 1,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={iconSize}
        color={iconColor || tokens.colors.textPrimary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.subtle,
  },
});

