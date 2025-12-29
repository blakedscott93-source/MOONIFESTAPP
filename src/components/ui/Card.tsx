/**
 * Standard Surface Card Component
 * Unified card style - white cards on soft neutral background
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '../../theme/tokens';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof tokens.spacing;
}

/**
 * Standard surface card component
 * Uses unified design system: 16px radius, subtle shadow, white background
 */
export const Card: React.FC<CardProps> = ({ children, style, padding = 'md' }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.card,
          borderRadius: tokens.radii.md, // 16px - unified card radius
          borderColor: tokens.colors.border,
          padding: tokens.spacing[padding],
          ...tokens.shadows.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
});






