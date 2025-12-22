/**
 * Icon Button Component
 * Circular tap target with light glass background and border
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
}

/**
 * Icon button component with glass effect
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
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.colors.card,
          borderColor: tokens.colors.border,
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
    borderWidth: 1,
  },
});

